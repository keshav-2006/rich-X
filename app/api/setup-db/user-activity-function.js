// This is not a file to be used in the application
// It's just a reference for the SQL function you need to create in Supabase

/*
-- Run this in the Supabase SQL Editor:

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
*/
