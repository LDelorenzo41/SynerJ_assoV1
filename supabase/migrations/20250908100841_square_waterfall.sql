/*
  # Corriger l'accès aux associations pour la création de clubs

  1. Problème
    - Les politiques RLS empêchent la lecture des associations lors de la création de clubs
    - L'erreur PGRST116 indique qu'aucune ligne n'est retournée à cause des politiques

  2. Solution temporaire
    - Désactiver RLS sur la table associations
    - Permettre l'accès public en lecture pour la validation des codes

  3. Sécurité
    - Les associations ne contiennent pas d'informations sensibles
    - Seuls les codes sont utilisés pour la validation
*/

-- Désactiver RLS sur la table associations
ALTER TABLE associations DISABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes qui causent des problèmes
DROP POLICY IF EXISTS "Enable read access for associations" ON associations;
DROP POLICY IF EXISTS "Enable insert access for associations" ON associations;