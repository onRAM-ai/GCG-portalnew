-- Enhance profiles table with additional fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS entertainment_type TEXT CHECK (entertainment_type IN ('dancer', 'bartender', 'hostess')),
  ADD COLUMN IF NOT EXISTS hourly_rate INTEGER CHECK (hourly_rate >= 0),
  ADD COLUMN IF NOT EXISTS experience INTEGER CHECK (experience >= 0),
  ADD COLUMN IF NOT EXISTS rating DECIMAL CHECK (rating >= 0 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Create profile reviews table
CREATE TABLE IF NOT EXISTS public.profile_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one review per user per profile
  CONSTRAINT unique_profile_review UNIQUE (profile_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for profile reviews
CREATE POLICY "Anyone can view profile reviews"
  ON public.profile_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.profile_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    auth.uid() != profile_id
  );

-- Function to update profile rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update profile rating and total_ratings
    UPDATE profiles
    SET rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM profile_reviews
      WHERE profile_id = NEW.profile_id
    ),
    total_ratings = total_ratings + 1
    WHERE id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update profile rating and total_ratings
    UPDATE profiles
    SET rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM profile_reviews
      WHERE profile_id = OLD.profile_id
    ),
    total_ratings = total_ratings - 1
    WHERE id = OLD.profile_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for rating updates
CREATE TRIGGER on_review_change
  AFTER INSERT OR DELETE ON public.profile_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();