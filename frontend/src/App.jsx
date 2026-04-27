import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/public/LandingPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminServices from './pages/admin/AdminServices';
import AdminStaff from './pages/admin/AdminStaff';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReviews from './pages/admin/AdminReviews';

import DeveloperLogin from './pages/developer/DeveloperLogin';
import DeveloperDashboard from './pages/developer/DeveloperDashboard';
import DevHero from './pages/developer/DevHero';
import DevServices from './pages/developer/DevServices';
import DevAbout from './pages/developer/DevAbout';
import DevContact from './pages/developer/DevContact';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#D4AF37', secondary: '#000' } },
            error: { iconTheme: { primary: '#ff4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* ── Public ──────────────────────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />

          {/* ── Admin ───────────────────────────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute role="admin"><AdminServices /></ProtectedRoute>
          } />
          <Route path="/admin/staff" element={
            <ProtectedRoute role="admin"><AdminStaff /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute role="admin"><AdminReviews /></ProtectedRoute>
          } />

          {/* ── Developer ────────────────────────────────────────────────── */}
          <Route path="/developer/login" element={<DeveloperLogin />} />
          <Route path="/developer" element={
            <ProtectedRoute role="developer"><DeveloperDashboard /></ProtectedRoute>
          } />
          <Route path="/developer/hero" element={
            <ProtectedRoute role="developer"><DevHero /></ProtectedRoute>
          } />
          <Route path="/developer/services" element={
            <ProtectedRoute role="developer"><DevServices /></ProtectedRoute>
          } />
          <Route path="/developer/about" element={
            <ProtectedRoute role="developer"><DevAbout /></ProtectedRoute>
          } />
          <Route path="/developer/contact" element={
            <ProtectedRoute role="developer"><DevContact /></ProtectedRoute>
          } />

          {/* ── Fallback ─────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
