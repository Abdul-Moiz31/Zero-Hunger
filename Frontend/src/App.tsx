import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Header from './components/Header';
import Hero from './components/landing/Hero';
import ImpactStats from './components/landing/ImpactStats';
import HowItWorks from './components/landing/HowItWorks';
import Roles from './components/landing/Roles';
import CtaBand from './components/landing/CtaBand';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AuthPage from './components/auth/AuthPage';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DonorDashboard from './components/dashboard/DonorDashboard';
import NGODashboard from './components/dashboard/NGODashboard';
import VolunteerDashboard from './components/dashboard/VolunteerDashboard';
import AdminDashboard from './/components/dashboard/AdminDashboard';
import UnauthorizedPage from './components/UnauthorizedPage';
import Listings from './components/Listings';
import { AdminProvider } from './contexts/AdminContext';
import { DonorProvider } from './contexts/donorContext';
import { NGOProvider } from './contexts/ngoContext';
import { VolunteerProvider } from  './contexts/volunteerContext';
import { FoodListingsProvider } from './contexts/FoodContext';

const HomePage = () => (
  <div className="min-h-screen">
    <Header />
    <main>
      <Hero />
      <ImpactStats />
      <HowItWorks />
      <Roles />
      <About />
      <Testimonials />
      <CtaBand />
      <Contact />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
      <VolunteerProvider>
      <NGOProvider>
        <DonorProvider>
        <AdminProvider>
          <FoodListingsProvider>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/listings" element={<><Header /><Listings /><Footer /></>} />

          {/* Protected Routes */}
          <Route
            path="/admin-dashboard/*"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </PrivateRoute>
            }
            />
          <Route
            path="/donor-dashboard/*"
            element={
              <PrivateRoute allowedRoles={['donor']}>
                <DashboardLayout>
                  <DonorDashboard />
                </DashboardLayout>
              </PrivateRoute>
            }
            />
          <Route
            path="/ngo-dashboard/*"
            element={
              <PrivateRoute allowedRoles={['ngo']}>
                <DashboardLayout>
                  <NGODashboard />
                </DashboardLayout>
              </PrivateRoute>
            }
            />
          <Route
            path="/volunteer-dashboard/*"
            element={
              <PrivateRoute allowedRoles={['volunteer']}>
                <DashboardLayout>
                  <VolunteerDashboard />
                </DashboardLayout>
              </PrivateRoute>
            }
            />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
            </FoodListingsProvider>
        </AdminProvider>
        </DonorProvider>
        </NGOProvider>
        </VolunteerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;