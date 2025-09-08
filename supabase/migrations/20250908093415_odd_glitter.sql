/*
  # Fix profiles table nullable fields

  1. Changes
    - Make `first_name` and `last_name` nullable in profiles table
    - This allows Supabase Auth to create the initial profile record
    - The application will update these fields after successful signup

  2. Security
    - Maintains existing RLS policies
    - No changes to authentication flow
*/

-- Make first_name and last_name nullable to allow initial profile creation
ALTER TABLE profiles 
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN last_name DROP NOT NULL;