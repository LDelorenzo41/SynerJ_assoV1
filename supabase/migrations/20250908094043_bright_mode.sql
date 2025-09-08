/*
  # Correction des politiques RLS pour éviter la récursion infinie

  1. Suppression des anciennes politiques
  2. Création de nouvelles politiques simplifiées
  3. Éviter les références circulaires dans les politiques
*/

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Super Admins can view association members" ON profiles;
DROP POLICY IF EXISTS "Club Admins can view club members" ON profiles;

DROP POLICY IF EXISTS "Anyone can view associations for registration" ON associations;
DROP POLICY IF EXISTS "Super Admins can manage their association" ON associations;

DROP POLICY IF EXISTS "Anyone can view clubs for subscription" ON clubs;
DROP POLICY IF EXISTS "Super Admins can view their association's clubs" ON clubs;
DROP POLICY IF EXISTS "Club Admins can manage their club" ON clubs;

DROP POLICY IF EXISTS "Members can view their club's events" ON events;
DROP POLICY IF EXISTS "Club Admins can manage their club's events" ON events;

DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON user_clubs;
DROP POLICY IF EXISTS "Club Admins can view their club subscriptions" ON user_clubs;

-- Politiques simplifiées pour la table profiles (sans récursion)
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

-- Politiques pour associations
CREATE POLICY "Anyone can view associations for registration"
  ON associations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create associations"
  ON associations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can manage associations they created"
  ON associations
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE association_id = associations.id AND role = 'Super Admin'
  ));

-- Politiques pour clubs
CREATE POLICY "Anyone can view clubs for subscription"
  ON clubs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create clubs"
  ON clubs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can manage clubs they admin"
  ON clubs
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE club_id = clubs.id AND role = 'Club Admin'
  ));

-- Politiques pour events
CREATE POLICY "Users can view events based on visibility and membership"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'Public' OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE club_id = events.club_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM user_clubs WHERE club_id = events.club_id
    )
  );

CREATE POLICY "Club admins can manage their club events"
  ON events
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE club_id = events.club_id AND role = 'Club Admin'
  ));

-- Politiques pour user_clubs
CREATE POLICY "Users can manage their own subscriptions"
  ON user_clubs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view club subscriptions"
  ON user_clubs
  FOR SELECT
  TO authenticated
  USING (true);