/*
  # Fix clubs RLS policies for club creation

  1. Security Changes
    - Update INSERT policy on clubs table to allow unauthenticated users to create clubs
    - This is needed during the registration process when the user is not yet authenticated
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Enable insert access for clubs" ON clubs;

-- Create new INSERT policy that allows both authenticated and unauthenticated users
CREATE POLICY "Enable insert access for clubs"
  ON clubs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Keep the existing SELECT policy for authenticated users
-- (This should already exist but let's make sure)
DROP POLICY IF EXISTS "Enable read access for clubs" ON clubs;

CREATE POLICY "Enable read access for clubs"
  ON clubs
  FOR SELECT
  TO authenticated
  USING (true);