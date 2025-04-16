-- This SQL script creates the user_stats table in Supabase

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
  uiux_completed BOOLEAN DEFAULT false,
  uiux_progress INTEGER DEFAULT 0,
  graphic_design_completed BOOLEAN DEFAULT false, -- Added column
  last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id)
);
END;
$$ LANGUAGE plpgsql;
