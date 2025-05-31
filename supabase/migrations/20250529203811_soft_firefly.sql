/*
  # Fix ambiguous kai_points reference

  1. Changes
    - Update get_rankings function to explicitly reference profiles.kai_points
    - Add proper table aliasing for clarity
    - Ensure proper column references in the ORDER BY clause

  2. Security
    - Function remains accessible to authenticated users only
    - No changes to RLS policies needed
*/

CREATE OR REPLACE FUNCTION public.get_rankings()
RETURNS TABLE (
  id uuid,
  username text,
  kai_points integer,
  current_rank text,
  current_streak integer,
  max_streak integer
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.username,
    p.kai_points,
    p.current_rank,
    p.current_streak,
    p.max_streak
  FROM profiles p
  ORDER BY p.kai_points DESC, p.username ASC;
$$;