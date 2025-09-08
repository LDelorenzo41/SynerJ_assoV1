/*
  # Fix profile access timeout

  1. Security Changes
    - Drop all existing problematic RLS policies
    - Create simple, direct policies for profiles table
    - Ensure authenticated users can access their own profile data
    - Fix any circular references in policies

  2. Profile Access
    - Allow users to SELECT their own profile using auth.uid()
    - Allow users to UPDATE their own profile
    - Allow users to INSERT their own profile (for new user creation)
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage associations they created" ON associations;
DROP POLICY IF EXISTS "Anyone can view associations for registration" ON associations;
DROP POLICY IF EXISTS "Authenticated users can create associations" ON associations;
DROP POLICY IF EXISTS "Users can manage clubs they admin" ON clubs;
DROP POLICY IF EXISTS "Anyone can view clubs for subscription" ON clubs;
DROP POLICY IF EXISTS "Authenticated users can create clubs" ON clubs;

-- Create simple, direct policies for profiles
CREATE POLICY "Enable read access for users to their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update access for users to their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert access for users to create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create simple policies for associations
CREATE POLICY "Enable read access for associations"
  ON associations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for associations"
  ON associations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create simple policies for clubs
CREATE POLICY "Enable read access for clubs"
  ON clubs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for clubs"
  ON clubs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);