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
        {/* Routes publiques SANS Layout */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} 
        />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
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
      </Routes>
    </Router>
  );
}

export default App;