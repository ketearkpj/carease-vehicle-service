// ===== src/App.jsx =====
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Layout from './Components/Layout/Layout';
import ErrorBoundary from './Components/Common/ErrorBoundary';

// Context Providers
import { AppProvider } from './Context/AppContext';
import { BookingProvider } from './Context/BookingContext';
import { PaymentProvider } from './Context/PaymentContext';
import { AdminAuthProvider } from './Context/AdminAuthContext';

// Pages - All 22 pages directly imported
import Home from './Pages/Home';
import Services from './Pages/Services';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Rentals from './Pages/Rentals';
import CarWash from './Pages/CarWash';
import Repairs from './Pages/Repairs';
import Sales from './Pages/Sales';
import ServiceCheckout from './Pages/ServiceCheckout';
import Booking from './Pages/Booking';
import Checkout from './Pages/Checkout';
import BookingConfirmation from './Pages/BookingConfirmation';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import ManageBookings from './Pages/ManageBookings';
import ManagePayments from './Pages/ManagePayments';
import ManageVehicles from './Pages/ManageVehicles';
import Reports from './Pages/Reports';
import Privacy from './Pages/Privacy';
import Terms from './Pages/Terms';
import FAQ from './Pages/FAQ';
import Careers from './Pages/Careers';
import NotFound from './Pages/NotFound';

// Routes
import { ROUTES } from './Config/Routes';
import { IS_DEV } from './Config/env';
import { useAdminAuth } from './Hooks/useAdminAuth';

// API (available globally if needed)
import { API_BASE_URL } from './Config/API';

// Styles - All essential styles (31 files)
import './Styles/Variables.css';
import './Styles/Global.css';
import './Styles/Animations.css';
import './Styles/Responsive.css';
import './Styles/Button.css';
import './Styles/Card.css';
import './Styles/Input.css';
import './Styles/Select.css';
import './Styles/Modal.css';
import './Styles/Features.css';
import './Styles/ErrorBoundary.css';
// Page-specific styles are imported within each page component

const AdminProtectedRoute = ({ children }) => {
  const { initializing, isAuthenticated } = useAdminAuth();

  if (initializing) return null;
  return isAuthenticated ? children : <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
};

function App() {
  const [runtimeError, setRuntimeError] = useState(null);

  // Log API base URL in development
  useEffect(() => {
    if (IS_DEV) {
      console.log('🚀 CAR EASE App Initialized');
      console.log('📡 API Base URL:', API_BASE_URL);
    }
  }, []);

  useEffect(() => {
    const onError = (event) => {
      setRuntimeError(event?.error?.message || event?.message || 'Unknown runtime error');
    };

    const onUnhandledRejection = (event) => {
      const reason = event?.reason;
      const message =
        typeof reason === 'string'
          ? reason
          : reason?.message || 'Unhandled promise rejection';
      setRuntimeError(message);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return (
    <Router>
      <AppProvider>
        <AdminAuthProvider>
          <BookingProvider>
            <PaymentProvider>
              <div className="app">
                <ErrorBoundary>
                  {runtimeError && (
                    <div
                      style={{
                        position: 'fixed',
                        bottom: '16px',
                        left: '16px',
                        right: '16px',
                        zIndex: 10000,
                        background: '#1a0f0f',
                        color: '#ffb4b4',
                        border: '1px solid #ff6666',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        fontSize: '14px'
                      }}
                    >
                      Runtime error: {runtimeError}
                    </div>
                  )}
                  {/* Global Components - NavBar and Footer are inside Layout */}
                  <Layout>
                    <Routes>
                    {/* ===== PUBLIC ROUTES ===== */}
                    <Route path={ROUTES.HOME} element={<Home />} />
                    <Route path={ROUTES.SERVICES} element={<Services />} />
                    <Route path={ROUTES.ABOUT} element={<About />} />
                    <Route path={ROUTES.CONTACT} element={<Contact />} />
                    
                    {/* ===== SERVICE ROUTES ===== */}
                    <Route path={ROUTES.RENTALS} element={<Rentals />} />
                    <Route path={ROUTES.RENTALS_FLOW} element={<ServiceCheckout serviceKey="rentals" />} />
                    <Route path={ROUTES.CAR_WASH} element={<CarWash />} />
                    <Route path={ROUTES.CAR_WASH_FLOW} element={<ServiceCheckout serviceKey="car-wash" />} />
                    <Route path={ROUTES.REPAIRS} element={<Repairs />} />
                    <Route path={ROUTES.REPAIRS_FLOW} element={<ServiceCheckout serviceKey="repairs" />} />
                    <Route path={ROUTES.SALES} element={<Sales />} />
                    <Route path={ROUTES.SALES_FLOW} element={<ServiceCheckout serviceKey="sales" />} />
                    
                    {/* ===== BOOKING ROUTES ===== */}
                    <Route path={ROUTES.BOOKING} element={<Booking />} />
                    <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
                    <Route path={ROUTES.BOOKING_CONFIRMATION} element={<BookingConfirmation />} />
                    
                    {/* ===== ADMIN AUTH ROUTES ===== */}
                    <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
                    
                    {/* ===== ADMIN DASHBOARD ROUTES ===== */}
                    <Route
                      path={ROUTES.ADMIN_DASHBOARD}
                      element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>}
                    />
                    <Route
                      path={ROUTES.ADMIN_BOOKINGS}
                      element={<AdminProtectedRoute><ManageBookings /></AdminProtectedRoute>}
                    />
                    <Route
                      path={ROUTES.ADMIN_PAYMENTS}
                      element={<AdminProtectedRoute><ManagePayments /></AdminProtectedRoute>}
                    />
                    <Route
                      path={ROUTES.ADMIN_VEHICLES}
                      element={<AdminProtectedRoute><ManageVehicles /></AdminProtectedRoute>}
                    />
                    <Route
                      path={ROUTES.ADMIN_REPORTS}
                      element={<AdminProtectedRoute><Reports /></AdminProtectedRoute>}
                    />
                    
                    {/* ===== LEGAL & INFORMATION ROUTES ===== */}
                    <Route path={ROUTES.PRIVACY} element={<Privacy />} />
                    <Route path={ROUTES.TERMS} element={<Terms />} />
                    <Route path={ROUTES.FAQ} element={<FAQ />} />
                    <Route path={ROUTES.CAREERS} element={<Careers />} />
                    
                    {/* ===== REDIRECTS ===== */}
                    <Route path="/admin" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
                    <Route path="/dashboard" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
                    
                    {/* ===== 404 ROUTE ===== */}
                    <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ErrorBoundary>
              </div>
            </PaymentProvider>
          </BookingProvider>
        </AdminAuthProvider>
      </AppProvider>
    </Router>
  );
}

export default App;
