/*
  # Fix Rankings Function

  1. Changes
    - Create or replace the get_rankings function with proper table aliases
    - Fix table references to use correct aliases
    - Add proper filtering based on time periods
    - Include equipped title and skin information
    
  2. Function Parameters
    - p_period: The time period for rankings ('global', 'monthly', 'weekly')
    - p_sort_field: Field to sort by ('kai_points', 'streak', 'rank')
    - p_sort_direction: Sort direction ('asc', 'desc')
    - p_page: Page number for pagination
    - p_page_size: Number of records per page
*/

CREATE OR REPLACE FUNCTION get_rankings(
  p_period text,
  p_sort_field text,
  p_sort_direction text,
  p_page integer,
  p_page_size integer
)
RETURNS TABLE (
  id uuid,
  username text,
  kai_points integer,
  current_rank text,
  current_streak integer,
  equipped_title text,
  equipped_skin text
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_profiles AS (
    SELECT 
      p.id,
      p.username,
      p.kai_points,
      p.current_rank,
      p.current_streak,
      t.title as equipped_title,
      s.skin as equipped_skin
    FROM profiles p
    LEFT JOIN user_titles t ON t.user_id = p.id AND t.is_equipped = true
    LEFT JOIN user_skins s ON s.user_id = p.id AND s.is_equipped = true
    WHERE 
      CASE 
        WHEN p_period = 'weekly' THEN
          p.last_workout_date >= CURRENT_DATE - INTERVAL '7 days'
        WHEN p_period = 'monthly' THEN
          p.last_workout_date >= CURRENT_DATE - INTERVAL '30 days'
        ELSE true
      END
  )
  SELECT *
  FROM ranked_profiles
  ORDER BY
    CASE 
      WHEN p_sort_field = 'kai_points' AND p_sort_direction = 'desc' THEN kai_points END DESC NULLS LAST,
    CASE 
      WHEN p_sort_field = 'kai_points' AND p_sort_direction = 'asc' THEN kai_points END ASC NULLS LAST,
    CASE 
      WHEN p_sort_field = 'streak' AND p_sort_direction = 'desc' THEN current_streak END DESC NULLS LAST,
    CASE 
      WHEN p_sort_field = 'streak' AND p_sort_direction = 'asc' THEN current_streak END ASC NULLS LAST,
    CASE 
      WHEN p_sort_field = 'rank' AND p_sort_direction = 'desc' THEN current_rank END DESC NULLS LAST,
    CASE 
      WHEN p_sort_field = 'rank' AND p_sort_direction = 'asc' THEN current_rank END ASC NULLS LAST
  LIMIT p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$ LANGUAGE plpgsql;