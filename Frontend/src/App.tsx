import React, { Suspense, lazy } from 'react';
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
import { AdminProvider } from './contexts/AdminContext';
import { DonorProvider } from './contexts/donorContext';
import { NGOProvider } from './contexts/ngoContext';
import { VolunteerProvider } from './contexts/volunteerContext';
import { FoodListingsProvider } from './contexts/FoodContext';

// Code-split heavy / authenticated routes so the landing page loads fast.
const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const DonorDashboard = lazy(() => import('./components/dashboard/DonorDashboard'));
const NGODashboard = lazy(() => import('./components/dashboard/NGODashboard'));
const VolunteerDashboard = lazy(() => import('./components/dashboard/VolunteerDashboard'));
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const UnauthorizedPage = lazy(() => import('./components/UnauthorizedPage'));
const Listings = lazy(() => import('./components/Listings'));

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

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-green-600" />
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
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/unauthorized" element={<UnauthorizedPage />} />
                      <Route
                        path="/listings"
                        element={
                          <>
                            <Header />
                            <Listings />
                            <Footer />
                          </>
                        }
                      />

                      {/* Protected */}
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

                      {/* Catch-all */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
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
