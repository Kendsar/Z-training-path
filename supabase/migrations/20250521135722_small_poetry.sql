/*
  # Initial Schema Setup for Z-Training App

  1. New Tables
    - `profiles` - User profiles with progression tracking
      - `id` (uuid, primary key, linked to auth.users)
      - `username` (text, unique)
      - `kai_points` (integer, default 0)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, nullable)
      - `current_rank` (text, default 'Human Form')
      - `current_streak` (integer, default 0)
      - `max_streak` (integer, default 0)
      - `last_workout_date` (date, nullable)
    
    - `workouts` - User workout records
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id)
      - `name` (text, required)
      - `date` (date, required)
      - `sport_type` (text, required)
      - `duration` (integer, nullable, in minutes)
      - `notes` (text, nullable)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, nullable)
      - `kai_points` (integer, default 100)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  kai_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  current_rank TEXT DEFAULT 'Human Form',
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  last_workout_date DATE
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  sport_type TEXT NOT NULL,
  duration INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  kai_points INTEGER DEFAULT 100
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for workouts
CREATE POLICY "Users can view own workouts"
  ON workouts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON workouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();