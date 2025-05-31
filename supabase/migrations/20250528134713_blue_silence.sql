/*
  # Add Wheel of Honor System

  1. New Tables
    - `wheel_spins` - Track user spins and cooldowns
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `spun_at` (timestamptz)
      - `reward_type` (text)
      - `reward_value` (jsonb)
      
    - `user_titles` - Store earned titles
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `earned_at` (timestamptz)
      - `is_equipped` (boolean)
      
    - `user_skins` - Store earned skins
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `skin` (text)
      - `earned_at` (timestamptz)
      - `is_equipped` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create wheel_spins table
CREATE TABLE IF NOT EXISTS wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  spun_at TIMESTAMPTZ DEFAULT now(),
  reward_type TEXT NOT NULL,
  reward_value JSONB NOT NULL,
  
  CONSTRAINT valid_reward_type CHECK (
    reward_type IN ('kai_points', 'title', 'skin')
  )
);

-- Create user_titles table
CREATE TABLE IF NOT EXISTS user_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  is_equipped BOOLEAN DEFAULT false,
  
  CONSTRAINT unique_user_title UNIQUE (user_id, title)
);

-- Create user_skins table
CREATE TABLE IF NOT EXISTS user_skins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skin TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  is_equipped BOOLEAN DEFAULT false,
  
  CONSTRAINT unique_user_skin UNIQUE (user_id, skin)
);

-- Enable Row Level Security
ALTER TABLE wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skins ENABLE ROW LEVEL SECURITY;

-- Create policies for wheel_spins
CREATE POLICY "Users can view own spins"
  ON wheel_spins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spins"
  ON wheel_spins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_titles
CREATE POLICY "Users can view own titles"
  ON user_titles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own titles"
  ON user_titles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for user_skins
CREATE POLICY "Users can view own skins"
  ON user_skins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skins"
  ON user_skins
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to check spin eligibility
CREATE OR REPLACE FUNCTION check_spin_eligibility(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_spin TIMESTAMPTZ;
BEGIN
  SELECT spun_at
  INTO last_spin
  FROM wheel_spins
  WHERE wheel_spins.user_id = check_spin_eligibility.user_id
  ORDER BY spun_at DESC
  LIMIT 1;
  
  RETURN (
    last_spin IS NULL OR
    (now() - last_spin) >= interval '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;