-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  may_not_return BOOLEAN DEFAULT false,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')) DEFAULT 'PENDING',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Venues can create feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'venue'
    )
  );

CREATE POLICY "Admins can view all feedback"
  ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Venues can view their own feedback"
  ON public.feedback
  FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

-- Create function to handle feedback notifications
CREATE OR REPLACE FUNCTION handle_feedback_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If may_not_return is true, create admin notification
  IF NEW.may_not_return = true THEN
    INSERT INTO notifications (
      type,
      title,
      message,
      metadata,
      user_id
    )
    SELECT
      'feedback',
      'Urgent Feedback Review Required',
      'A venue has flagged an entertainer as "may not return"',
      jsonb_build_object(
        'feedback_id', NEW.id,
        'venue_id', NEW.venue_id,
        'user_id', NEW.user_id
      ),
      profiles.id
    FROM profiles
    WHERE profiles.role = 'admin';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for feedback notifications
CREATE TRIGGER on_feedback_created
  AFTER INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION handle_feedback_notification();

-- Create function to get feedback stats
CREATE OR REPLACE FUNCTION get_feedback_stats(p_user_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_feedback BIGINT,
  may_not_return_count BIGINT,
  pending_review_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::numeric, 2) as average_rating,
    COUNT(*) as total_feedback,
    COUNT(*) FILTER (WHERE may_not_return = true) as may_not_return_count,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_review_count
  FROM feedback
  WHERE user_id = p_user_id;
END;
$$;