-- Add function to add kai points securely
CREATE OR REPLACE FUNCTION add_kai_points(
  user_id UUID,
  points INTEGER
) RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET kai_points = kai_points + points
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check spin eligibility
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

-- Add function to get next spin time
CREATE OR REPLACE FUNCTION get_next_spin_time(user_id UUID)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  last_spin TIMESTAMPTZ;
BEGIN
  SELECT spun_at
  INTO last_spin
  FROM wheel_spins
  WHERE wheel_spins.user_id = get_next_spin_time.user_id
  ORDER BY spun_at DESC
  LIMIT 1;
  
  RETURN CASE
    WHEN last_spin IS NULL THEN now()
    ELSE last_spin + interval '24 hours'
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;