-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'cancellation', 'update', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create notification functions
CREATE OR REPLACE FUNCTION notify_worker(
  p_worker_id UUID,
  p_message TEXT,
  p_shift_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata
  )
  VALUES (
    p_worker_id,
    'assignment',
    'New Shift Assignment',
    p_message,
    jsonb_build_object('shift_id', p_shift_id)
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION notify_available_workers(
  p_shift_id UUID,
  p_message TEXT
) RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  worker_id UUID;
  notification_id UUID;
BEGIN
  FOR worker_id IN
    SELECT ap.user_id
    FROM availability_preferences ap
    JOIN shifts s ON s.id = p_shift_id
    WHERE s.date = ANY(ap.available_dates)
    AND NOT EXISTS (
      SELECT 1 FROM shift_assignments sa
      WHERE sa.shift_id = p_shift_id
      AND sa.worker_id = ap.user_id
    )
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      metadata
    )
    VALUES (
      worker_id,
      'update',
      'New Shift Available',
      p_message,
      jsonb_build_object('shift_id', p_shift_id)
    )
    RETURNING id INTO notification_id;
    
    RETURN NEXT notification_id;
  END LOOP;
  
  RETURN;
END;
$$;