import { Outlet, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAdminId } from '../../features/auth/authSlice';
import './AdminLayout.css';

const NAV_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/appointments', label: 'All Appointments' },
];

function AdminLayout() {
  const dispatch = useDispatch();
  const adminId = useSelector((s) => s.auth.adminId);

  const navLinkClass = ({ isActive }) =>
    isActive ? 'al-nav-link al-nav-link--active' : 'al-nav-link';

  return (
    <div className="al-root">
      {/* Sidebar */}
      <aside className="al-sidebar">
        <div className="al-sidebar__header">
          <div className="al-sidebar__title">Admin Console</div>
        </div>

        <nav className="al-sidebar__nav">
          <div className="al-sidebar__section-label">Admin Menu</div>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={navLinkClass}
              end={to === '/admin/dashboard'}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="al-sidebar__footer">
          <div className="al-sidebar__id-label">Active Admin ID</div>
          <input
            type="number"
            min="1"
            value={adminId}
            onChange={(e) => dispatch(setAdminId(e.target.value))}
            className="al-id-input"
            aria-label="Admin ID"
          />
        </div>
      </aside>

      {/* Right side: topbar + content */}
      <div className="al-content-area">
        <header className="al-topbar">
          <h1 className="al-topbar__title">Appointment Administration</h1>
          <div className="al-topbar__right">
            <span className="al-badge">Admin Mode</span>
            <span className="al-topbar__user">Admin #{adminId}</span>
          </div>
        </header>

        <main className="al-main">
          <Outlet context={{ adminId }} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
