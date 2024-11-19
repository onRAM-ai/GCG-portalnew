import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    // Create availability_preferences table
    const { error: preferencesError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.availability_preferences (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          available_dates DATE[] DEFAULT ARRAY[]::DATE[],
          preferred_suburbs TEXT[] DEFAULT ARRAY[]::TEXT[],
          preferred_venues TEXT[] DEFAULT ARRAY[]::TEXT[],
          preferred_shift_types TEXT[] DEFAULT ARRAY[]::TEXT[],
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(user_id)
        );

        -- Enable RLS
        ALTER TABLE public.availability_preferences ENABLE ROW LEVEL SECURITY;

        -- Create policies
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'availability_preferences' 
            AND policyname = 'Users can view their own preferences'
          ) THEN
            CREATE POLICY "Users can view their own preferences"
              ON public.availability_preferences
              FOR SELECT
              USING (auth.uid() = user_id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'availability_preferences' 
            AND policyname = 'Users can update their own preferences'
          ) THEN
            CREATE POLICY "Users can update their own preferences"
              ON public.availability_preferences
              FOR UPDATE
              USING (auth.uid() = user_id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'availability_preferences' 
            AND policyname = 'Users can insert their own preferences'
          ) THEN
            CREATE POLICY "Users can insert their own preferences"
              ON public.availability_preferences
              FOR INSERT
              WITH CHECK (auth.uid() = user_id);
          END IF;
        END $$;

        -- Grant permissions
        GRANT ALL ON public.availability_preferences TO authenticated;
        GRANT USAGE ON SCHEMA public TO authenticated;
      `
    });

    if (preferencesError) {
      console.error('Error creating availability_preferences table:', preferencesError);
      throw preferencesError;
    }

    // Previous database setup code...
    const { error: profilesError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          bio TEXT CHECK (char_length(bio) <= 200),
          images TEXT[] DEFAULT ARRAY[]::TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles' 
            AND policyname = 'Users can view their own profile'
          ) THEN
            CREATE POLICY "Users can view their own profile"
              ON public.profiles FOR SELECT
              USING (auth.uid() = id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles' 
            AND policyname = 'Users can update their own profile'
          ) THEN
            CREATE POLICY "Users can update their own profile"
              ON public.profiles FOR UPDATE
              USING (auth.uid() = id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles' 
            AND policyname = 'Users can insert their own profile'
          ) THEN
            CREATE POLICY "Users can insert their own profile"
              ON public.profiles FOR INSERT
              WITH CHECK (auth.uid() = id);
          END IF;
        END $$;

        -- Grant permissions
        GRANT ALL ON public.profiles TO authenticated;
      `
    });

    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
      throw profilesError;
    }

    // Create bookings table
    const { error: bookingsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.bookings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          entertainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          venue_id UUID NOT NULL,
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_time TIMESTAMP WITH TIME ZONE NOT NULL,
          status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          
          -- Ensure end_time is after start_time
          CONSTRAINT valid_booking_period CHECK (end_time > start_time),
          
          -- Prevent overlapping bookings for the same entertainer
          CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
            entertainer_id WITH =,
            tstzrange(start_time, end_time) WITH &&
          )
        );

        -- Enable RLS
        ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

        -- Policies for bookings
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'bookings' 
            AND policyname = 'Users can view their own bookings'
          ) THEN
            CREATE POLICY "Users can view their own bookings"
              ON public.bookings FOR SELECT
              USING (auth.uid() = entertainer_id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'bookings' 
            AND policyname = 'Users can create their own bookings'
          ) THEN
            CREATE POLICY "Users can create their own bookings"
              ON public.bookings FOR INSERT
              WITH CHECK (auth.uid() = entertainer_id);
          END IF;

          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'bookings' 
            AND policyname = 'Users can update their own bookings'
          ) THEN
            CREATE POLICY "Users can update their own bookings"
              ON public.bookings FOR UPDATE
              USING (auth.uid() = entertainer_id);
          END IF;
        END $$;

        -- Grant permissions
        GRANT ALL ON public.bookings TO authenticated;
      `
    });

    if (bookingsError) {
      console.error('Error creating bookings table:', bookingsError);
      throw bookingsError;
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
}