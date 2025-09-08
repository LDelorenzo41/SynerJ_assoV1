/*
  # Corriger la fonction de gestion des nouveaux utilisateurs

  1. Fonction de déclenchement
    - Créer automatiquement un profil pour chaque nouvel utilisateur
    - Gérer les valeurs par défaut correctement
  
  2. Déclencheur
    - S'exécuter après l'insertion d'un nouvel utilisateur dans auth.users
    - Créer le profil correspondant dans public.profiles
*/

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Créer la fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'Supporter'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien déclencheur s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le déclencheur pour les nouveaux utilisateurs
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- S'assurer que les colonnes first_name et last_name peuvent être nulles temporairement
ALTER TABLE public.profiles 
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN last_name DROP NOT NULL;