import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthNew } from './hooks/useAuthNew';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Associations from './pages/Associations';
import Clubs from './pages/Clubs';
import MyClub from './pages/MyClub';
import Settings from './pages/Settings';
import Sponsors from './pages/Sponsors';
import MonCalendrier from './pages/MonCalendrier';
import PublicHeader from './components/PublicHeader';
import SponsorProfile from './pages/SponsorProfile'; // ✅ NOUVEAU - Remplace SponsorEdit
import Communications from './pages/Communications';
import Mailing from './pages/Mailing';

// Import des nouveaux composants de réservation
import EquipmentManagement from './components/equipment/EquipmentManagement';
import ClubReservation from './components/equipment/ClubReservation';

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
        {/* Routes publiques SANS Layout mais AVEC PublicHeader */}
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
        
        {/* ❌ ANCIENNE ROUTE SUPPRIMÉE - Plus nécessaire avec le nouveau processus
        <Route 
          path="/sponsor-edit/:token" 
          element={<SponsorEdit />} 
        />
        */}
        
        {/* Routes protégées AVEC Layout */}
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
            <ProtectedRoute allowedRoles={['Member', 'Supporter']}>
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

        {/* ✅ NOUVELLE ROUTE - Profil sponsor (accessible uniquement aux Sponsors connectés) */}
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

        {/* ============ ROUTES DE RÉSERVATION ============ */}
        
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
        
      </Routes>
    </Router>
  );
}

export default App;