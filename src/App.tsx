import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthNew } from './hooks/useAuthNew';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Associations from './pages/Associations';
import Clubs from './pages/Clubs';
import MyClub from './pages/MyClub';
import Settings from './pages/Settings';
import Sponsors from './pages/Sponsors';
import MonCalendrier from './pages/MonCalendrier';
import PublicHeader from './components/PublicHeader';
import SponsorProfile from './pages/SponsorProfile';
import Communications from './pages/Communications';
import Mailing from './pages/Mailing';
import ClubWebsite from './pages/ClubWebsite';

// Import des composants de réservation
import EquipmentManagement from './components/equipment/EquipmentManagement';
import ClubReservation from './components/equipment/ClubReservation';

// Import des pages légales
import LegalNotices from './pages/legal/LegalNotices';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import HelpCenter from './pages/legal/HelpCenter';
import FAQ from './pages/legal/FAQ';
import Documentation from './pages/legal/Documentation';

// Import des pages d'invitation
import ClubInvitations from './pages/ClubInvitations';
import AcceptInvitation from './pages/AcceptInvitation';
import UseInvitationLink from './pages/UseInvitationLink';

function App() {
  const { isAuthenticated, loading } = useAuthNew();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ============ ROUTES PUBLIQUES ============ */}
        
        {/* Page d'accueil et connexion avec PublicHeader */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> :
            <>
              <PublicHeader />
              <Landing />
            </>
          } 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> :
            <>
              <PublicHeader />
              <Login />
            </>
          } 
        />

        {/* Routes pour mot de passe oublié */}
        <Route 
          path="/forgot-password" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> :
            <>
              <PublicHeader />
              <ForgotPassword />
            </>
          } 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />
        
        {/* Site web public du club (SANS Layout ni Header) */}
        <Route 
          path="/club/:clubId/website" 
          element={<ClubWebsite />} 
        />

        {/* ============ INVITATIONS (Publiques, SANS Layout) ============ */}
        
        {/* Accepter une invitation par email */}
        <Route 
          path="/invitation/accept/:token" 
          element={<AcceptInvitation />} 
        />
        
        {/* Utiliser un lien d'invitation */}
        <Route 
          path="/invitation/link/:code" 
          element={<UseInvitationLink />} 
        />

        {/* ============ PAGES LÉGALES (Publiques, SANS Layout ni Header) ============ */}
        
        {/* Mentions Légales */}
        <Route 
          path="/legal/notices" 
          element={<LegalNotices />} 
        />
        
        {/* Politique de confidentialité */}
        <Route 
          path="/legal/privacy-policy" 
          element={<PrivacyPolicy />} 
        />
        
        {/* Conditions Générales d'Utilisation */}
        <Route 
          path="/legal/terms" 
          element={<TermsOfService />} 
        />
        
        {/* Centre d'aide */}
        <Route 
          path="/legal/help-center" 
          element={<HelpCenter />} 
        />
        
        {/* FAQ */}
        <Route 
          path="/legal/faq" 
          element={<FAQ />} 
        />
        
        {/* Documentation */}
        <Route 
          path="/legal/documentation" 
          element={<Documentation />} 
        />
        
        {/* ============ ROUTES PROTÉGÉES AVEC Layout ============ */}
        
        <Route
          path="/dashboard"
          element={
            <Layout>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Layout>
          }
        />
        
        <Route 
          path="/calendrier" 
          element={
            <ProtectedRoute allowedRoles={['Member', 'Supporter', 'Sponsor']}>
              <Layout>
                <MonCalendrier />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/events"
          element={
            <Layout>
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            </Layout>
          }
        />
        
        <Route
          path="/communications"
          element={
            <Layout>
              <ProtectedRoute>
                <Communications />
              </ProtectedRoute>
            </Layout>
          }
        />
        
        <Route
          path="/associations"
          element={
            <Layout>
              <ProtectedRoute requiredRole="Super Admin">
                <Associations />
              </ProtectedRoute>
            </Layout>
          }
        />
        
        <Route
          path="/clubs"
          element={
            <Layout>
              <ProtectedRoute>
                <Clubs />
              </ProtectedRoute>
            </Layout>
          }
        />
        
        <Route
          path="/my-club"
          element={
            <Layout>
              <ProtectedRoute requiredRole="Club Admin">
                <MyClub />
              </ProtectedRoute>
            </Layout>
          }
        />
        
        <Route
          path="/sponsors"
          element={
            <Layout>
              <ProtectedRoute>
                <Sponsors />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Profil sponsor (accessible uniquement aux Sponsors connectés) */}
        <Route
          path="/sponsor/profile"
          element={
            <Layout>
              <ProtectedRoute requiredRole="Sponsor">
                <SponsorProfile />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout>
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* ============ GESTION DU MATÉRIEL ============ */}
        
        {/* Gestion du matériel - Super Admins uniquement */}
        <Route
          path="/equipment-management"
          element={
            <Layout>
              <ProtectedRoute requiredRole="Super Admin">
                <EquipmentManagement />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Réservation de matériel - Club Admins et Super Admins */}
        <Route
          path="/equipment-reservation"
          element={
            <Layout>
              <ProtectedRoute allowedRoles={['Club Admin', 'Super Admin']}>
                <ClubReservation />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* ============ MAILING ============ */}
        
        {/* Route Mailing - Super Admin, Club Admin et Sponsor */}
        <Route
          path="/mailing"
          element={
            <Layout>
              <ProtectedRoute allowedRoles={['Super Admin', 'Club Admin', 'Sponsor']}>
                <Mailing />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* ============ INVITATIONS DE MEMBRES ============ */}
        
        {/* Gestion des invitations - Club Admin uniquement */}
        <Route
          path="/club/invitations"
          element={
            <Layout>
              <ProtectedRoute requiredRole="Club Admin">
                <ClubInvitations />
              </ProtectedRoute>
            </Layout>
          }
        />
        
      </Routes>
    </Router>
  );
}

export default App;