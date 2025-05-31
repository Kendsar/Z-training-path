/*
  # Add Rankings Support

  1. New Functions
    - get_rankings: Function to retrieve user rankings with period filtering and sorting
    - calculate_rank_weight: Helper function to convert rank to numeric weight for sorting
*/

-- Create function to calculate rank weight for sorting
CREATE OR REPLACE FUNCTION calculate_rank_weight(rank_name TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE rank_name
    WHEN 'Human Form' THEN 1
    WHEN 'Initiate Saiyan' THEN 2
    WHEN 'Saiyan' THEN 3
    WHEN 'Super Saiyan' THEN 4
    WHEN 'SSJ2' THEN 5
    WHEN 'SSJ3' THEN 6
    WHEN 'Blue Sign' THEN 7
    WHEN 'Final Form' THEN 8
    WHEN 'God Form' THEN 9
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to get rankings with period filtering
CREATE OR REPLACE FUNCTION get_rankings(
  p_period TEXT,
  p_sort_field TEXT,
  p_sort_direction TEXT,
  p_page INTEGER,
  p_page_size INTEGER
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  kai_points INTEGER,
  current_rank TEXT,
  current_streak INTEGER,
  equipped_title TEXT,
  equipped_skin TEXT
) AS $$
DECLARE
  v_where TEXT;
  v_order TEXT;
  v_offset INTEGER;
BEGIN
  -- Set up period filtering
  v_where := CASE p_period
    WHEN 'weekly' THEN 'AND profiles.updated_at >= date_trunc(''week'', CURRENT_DATE)'
    WHEN 'monthly' THEN 'AND profiles.updated_at >= date_trunc(''month'', CURRENT_DATE)'
    ELSE ''
  END;

  -- Set up sorting
  v_order := CASE 
    WHEN p_sort_field = 'kai_points' THEN 'kai_points'
    WHEN p_sort_field = 'streak' THEN 'current_streak'
    WHEN p_sort_field = 'rank' THEN 'calculate_rank_weight(current_rank)'
    ELSE 'kai_points'
  END;

  v_order := v_order || ' ' || p_sort_direction;
  v_offset := (p_page - 1) * p_page_size;

  -- Execute dynamic query
  RETURN QUERY EXECUTE '
    WITH ranked_users AS (
      SELECT 
        p.id,
        p.username,
        p.kai_points,
        p.current_rank,
        p.current_streak,
        ut.title as equipped_title,
        us.skin as equipped_skin
      FROM profiles p
      LEFT JOIN user_titles ut ON ut.user_id = p.id AND ut.is_equipped = true
      LEFT JOIN user_skins us ON us.user_id = p.id AND us.is_equipped = true
      WHERE 1=1 ' || v_where || '
    )
    SELECT *
    FROM ranked_users
    ORDER BY ' || v_order || '
    LIMIT ' || p_page_size || '
    OFFSET ' || v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_rankings TO public;