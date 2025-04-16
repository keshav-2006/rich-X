// This is not a file to be used in the application
// It's just a reference for the SQL functions you need to create in Supabase

/*
-- Run this in the Supabase SQL Editor:

-- Function to create user_stats table
CREATE OR REPLACE FUNCTION create_user_stats_table()
RETURNS void AS $$
BEGIN
  -- Create user_stats table if it doesn't exist
  CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    course_count INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    hours_learned DECIMAL(10, 2) DEFAULT 0,
    completed_this_month INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create user_activity table
CREATE OR REPLACE FUNCTION create_user_activity_table()
RETURNS void AS $$
BEGIN
  -- Create user_activity table if it doesn't exist
  CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Create index on user_id for faster queries
  CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to create profiles table
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void AS $$
BEGIN
  -- Create profiles table if it doesn't exist
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    phone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for avatars if it doesn't exist
CREATE OR REPLACE FUNCTION create_avatars_bucket()
RETURNS void AS $$
BEGIN
  -- This requires storage admin privileges
  -- You may need to run this manually in the Supabase dashboard
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('avatars', 'avatars', true) 
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
*/
