/*
  # Add missing trigger function

  1. New Functions
    - `update_updated_at()` - Trigger function to automatically update the updated_at timestamp
      - Used by both profiles and workouts tables
      - Runs BEFORE UPDATE
      - Sets updated_at to current timestamp
*/

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;