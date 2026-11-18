import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layouts
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProviderLayout from '../components/layout/ProviderLayout';

// Customer pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import AppointmentList from '../pages/customer/AppointmentList';
import CreateAppointment from '../pages/customer/CreateAppointment';
import CustomerAppointmentDetails from '../pages/customer/AppointmentDetails';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AppointmentManagement from '../pages/admin/AppointmentManagement';
import AdminAppointmentDetails from '../pages/admin/AppointmentDetails';

// Provider pages
import ProviderDashboard from '../pages/provider/ProviderDashboard';
import ProviderAppointmentDetails from '../pages/provider/ProviderAppointmentDetails';

function NotFound() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.code}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.desc}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={styles.links}>
          {isAdmin ? (
            <a href="/admin/dashboard" style={{ ...styles.link, ...styles.linkAdmin }}>
              Go to Admin Dashboard
            </a>
          ) : (
            <a href="/customer/dashboard" style={styles.link}>
              Go to Dashboard
            </a>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: '1rem',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    padding: '3rem 2.5rem',
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%',
    animation: 'fadeIn 0.4s ease',
  },
  code: {
    fontSize: '6rem',
    fontWeight: 900,
    color: '#e2e8f0',
    lineHeight: 1,
    marginBottom: '0.5rem',
    letterSpacing: '-0.04em',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 0.75rem',
  },
  desc: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  link: {
    display: 'block',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'background 0.15s',
  },
  linkAdmin: {
    background: '#1e2a3a',
  },
};

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect: Default to customer dashboard */}
      <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />

      {/* Customer section */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="appointments/create" element={<CreateAppointment />} />
        <Route path="appointments/:id" element={<CustomerAppointmentDetails />} />
      </Route>

      {/* Admin section - Accessible ONLY by explicitly navigating to /admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="appointments/:id" element={<AdminAppointmentDetails />} />
      </Route>

      {/* Provider section */}
      <Route path="/provider" element={<ProviderLayout />}>
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="appointments/:id" element={<ProviderAppointmentDetails />} />
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
