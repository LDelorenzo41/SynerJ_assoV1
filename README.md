# SynerJ - Plateforme de Gestion d'Associations et de Clubs

SynerJ est une application web complète développée avec React, TypeScript et Supabase qui permet de gérer des associations, leurs clubs affiliés, et les membres de ces clubs.

## 🚀 Fonctionnalités

### Gestion Multi-Niveaux
- **Associations** : Création et gestion d'associations
- **Clubs** : Clubs affiliés aux associations
- **Membres** : Utilisateurs avec différents rôles et permissions

### Système de Rôles
- **Super Admin** : Gestion complète de l'association et de tous ses clubs
- **Club Admin** : Gestion d'un club spécifique et de ses événements
- **Member** : Membre d'un club avec accès aux événements
- **Supporter** : Accès aux événements publics uniquement

### Gestion d'Événements
- Création et modification d'événements par les Club Admins
- Visibilité configurable (Public / Membres seulement)
- Calendrier des événements avec détails complets

### Authentification Sécurisée
- Authentification par email/mot de passe via Supabase
- Gestion des sessions utilisateur
- Protection des routes selon les rôles

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **Routing** : React Router DOM
- **Icons** : Lucide React
- **Build Tool** : Vite

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd synerj
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**
   - Créer un projet Supabase
   - Configurer les variables d'environnement dans `.env`
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Lancer l'application**
```bash
npm run dev
```

## 🗄️ Structure de la Base de Données

### Tables Principales

#### `associations`
- `id` : UUID (clé primaire)
- `name` : Nom de l'association
- `email` : Email de contact
- `city` : Ville (optionnel)
- `phone` : Téléphone (optionnel)
- `description` : Description (optionnel)
- `association_code` : Code unique généré automatiquement

#### `clubs`
- `id` : UUID (clé primaire)
- `name` : Nom du club
- `description` : Description (optionnel)
- `club_email` : Email du club
- `association_id` : Référence vers l'association
- `club_code` : Code unique généré automatiquement

#### `profiles`
- `id` : UUID (référence vers auth.users)
- `first_name` : Prénom
- `last_name` : Nom
- `role` : Rôle (Super Admin, Club Admin, Member, Supporter)
- `club_id` : Référence vers le club (optionnel)
- `association_id` : Référence vers l'association (optionnel)

#### `events`
- `id` : UUID (clé primaire)
- `name` : Nom de l'événement
- `description` : Description (optionnel)
- `date` : Date et heure de l'événement
- `visibility` : Public ou Members Only
- `club_id` : Référence vers le club organisateur

#### `user_clubs`
- `user_id` : Référence vers le profil utilisateur
- `club_id` : Référence vers le club
- Table de liaison pour les abonnements aux clubs

## 🔐 Sécurité (RLS - Row Level Security)

Toutes les tables utilisent les politiques RLS de Supabase pour garantir :
- Les utilisateurs ne peuvent voir que leurs données autorisées
- Les Club Admins ne peuvent gérer que leur club
- Les Super Admins ont accès à toute leur association
- Les événements respectent leur niveau de visibilité

## 🎯 Utilisation

### Création d'une Association
1. Aller sur la page d'accueil
2. Cliquer sur "Créer une Association"
3. Remplir les informations requises
4. Un code d'association sera généré automatiquement

### Création d'un Club
1. Utiliser le code d'association fourni
2. Cliquer sur "Créer un Club"
3. Remplir les informations du club
4. Un code de club sera généré pour les futurs membres

### Inscription d'un Utilisateur
1. Cliquer sur "Rejoindre en tant qu'Utilisateur"
2. Remplir les informations personnelles
3. Optionnel : Entrer un code de club pour devenir membre
4. Sans code de club, l'utilisateur devient "Supporter"

### Gestion des Événements
- Les Club Admins peuvent créer des événements depuis leur tableau de bord
- Choisir la visibilité (Public ou Membres seulement)
- Tous les utilisateurs peuvent voir les événements selon leur niveau d'accès

## 🚀 Déploiement

L'application peut être déployée sur n'importe quelle plateforme supportant les applications React :
- Vercel
- Netlify
- Heroku
- AWS S3 + CloudFront

Assurez-vous de configurer les variables d'environnement Supabase sur votre plateforme de déploiement.

## 📝 Scripts Disponibles

- `npm run dev` : Lancer en mode développement
- `npm run build` : Construire pour la production
- `npm run preview` : Prévisualiser la build de production
- `npm run lint` : Vérifier le code avec ESLint

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Supabase
- Vérifier les logs de la console pour les erreurs

---

**SynerJ** - Simplifiez la gestion de vos associations et clubs ! 🎉