/*
  # SynerJ Database Schema

  1. New Tables
    - `associations`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `city` (text, optional)
      - `email` (text, required)
      - `phone` (text, optional)
      - `description` (text, optional)
      - `association_code` (text, unique, auto-generated)
      - `created_at` (timestamp)
    
    - `clubs`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `club_email` (text, required)
      - `association_id` (uuid, foreign key)
      - `club_code` (text, unique, auto-generated)
      - `created_at` (timestamp)
    
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `role` (enum: Super Admin, Club Admin, Member, Supporter)
      - `club_id` (uuid, optional foreign key)
      - `association_id` (uuid, optional foreign key)
      - `created_at` (timestamp)
    
    - `events`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `date` (timestamp, required)
      - `visibility` (enum: Public, Members Only)
      - `club_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `user_clubs` (join table)
      - `user_id` (uuid, foreign key)
      - `club_id` (uuid, foreign key)
      - Primary key: (user_id, club_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('Super Admin', 'Club Admin', 'Member', 'Supporter');
CREATE TYPE event_visibility AS ENUM ('Public', 'Members Only');

-- Function to generate random codes
CREATE OR REPLACE FUNCTION generate_random_code(prefix text, length int DEFAULT 8)
RETURNS text AS $$
BEGIN
  RETURN prefix || '-' || upper(substring(md5(random()::text) from 1 for length));
END;
$$ LANGUAGE plpgsql;

-- Create associations table
CREATE TABLE IF NOT EXISTS associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  email text NOT NULL,
  phone text,
  description text,
  association_code text UNIQUE NOT NULL DEFAULT generate_random_code('ASSOC'),
  created_at timestamptz DEFAULT now()
);

-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  club_email text NOT NULL,
  association_id uuid NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  club_code text UNIQUE NOT NULL DEFAULT generate_random_code('CLUB'),
  created_at timestamptz DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'Supporter',
  club_id uuid REFERENCES clubs(id) ON DELETE SET NULL,
  association_id uuid REFERENCES associations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  visibility event_visibility NOT NULL DEFAULT 'Public',
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create user_clubs join table
CREATE TABLE IF NOT EXISTS user_clubs (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, club_id)
);

-- Enable RLS
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clubs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for associations
CREATE POLICY "Super Admins can manage their association"
  ON associations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.association_id = associations.id 
      AND profiles.role = 'Super Admin'
    )
  );

CREATE POLICY "Anyone can view associations for registration"
  ON associations
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for clubs
CREATE POLICY "Club Admins can manage their club"
  ON clubs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.club_id = clubs.id 
      AND profiles.role = 'Club Admin'
    )
  );

CREATE POLICY "Super Admins can view their association's clubs"
  ON clubs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.association_id = clubs.association_id 
      AND profiles.role = 'Super Admin'
    )
  );

CREATE POLICY "Anyone can view clubs for subscription"
  ON clubs
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super Admins can view association members"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.association_id = profiles.association_id 
      AND p.role = 'Super Admin'
    )
  );

CREATE POLICY "Club Admins can view club members"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.club_id = profiles.club_id 
      AND p.role = 'Club Admin'
    )
  );

-- RLS Policies for events
CREATE POLICY "Club Admins can manage their club's events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.club_id = events.club_id 
      AND profiles.role = 'Club Admin'
    )
  );

CREATE POLICY "Members can view their club's events"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'Public' OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.club_id = events.club_id 
      AND profiles.role IN ('Member', 'Club Admin')
    ) OR
    EXISTS (
      SELECT 1 FROM user_clubs 
      WHERE user_clubs.user_id = auth.uid() 
      AND user_clubs.club_id = events.club_id
    )
  );

-- RLS Policies for user_clubs
CREATE POLICY "Users can manage their own subscriptions"
  ON user_clubs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Club Admins can view their club subscriptions"
  ON user_clubs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.club_id = user_clubs.club_id 
      AND profiles.role = 'Club Admin'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (new.id, '', '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();