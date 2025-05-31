-- Add isRestDay column to workouts table
ALTER TABLE workouts 
ADD COLUMN is_rest_day BOOLEAN DEFAULT false;

-- Update existing workouts to have is_rest_day = false
UPDATE workouts 
SET is_rest_day = false 
WHERE is_rest_day IS NULL;

-- Make is_rest_day non-nullable
ALTER TABLE workouts 
ALTER COLUMN is_rest_day SET NOT NULL;