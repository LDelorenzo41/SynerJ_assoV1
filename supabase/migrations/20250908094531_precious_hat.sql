/*
  # Désactiver temporairement RLS sur profiles pour résoudre le timeout

  1. Désactive RLS sur la table profiles
  2. Supprime toutes les politiques existantes qui causent des problèmes
  3. Permet l'accès direct aux profils pour résoudre le timeout
*/

-- Désactiver RLS temporairement sur la table profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes sur profiles
DROP POLICY IF EXISTS "Enable insert access for users to create their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update access for users to their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;