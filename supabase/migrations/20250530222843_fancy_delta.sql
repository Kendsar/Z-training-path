/*
  # Add kai points RPC function

  1. New Functions
    - `add_kai_points`: Updates a user's kai points by adding the specified amount
      - Parameters:
        - user_id (uuid): The ID of the user to update
        - points (integer): The number of points to add
      - Returns: void
      - Security: Can only be executed by authenticated users on their own profile

  2. Security
    - Function is restricted to authenticated users
    - Users can only modify their own kai points
*/

-- Create the add_kai_points function
CREATE OR REPLACE FUNCTION add_kai_points(user_id uuid, points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is modifying their own profile
  IF auth.uid() = user_id THEN
    UPDATE profiles 
    SET kai_points = COALESCE(kai_points, 0) + points 
    WHERE id = user_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to modify other users points';
  END IF;
END;
$$;