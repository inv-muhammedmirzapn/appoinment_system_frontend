import { Outlet, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCustomerId } from '../../features/auth/authSlice';
import './CustomerLayout.css';

const NAV_LINKS = [
  { to: '/customer/dashboard', label: 'Dashboard' },
  { to: '/customer/appointments', label: 'My Appointments' },
  { to: '/customer/appointments/create', label: 'Book Appointment' },
];

function CustomerLayout() {
  const dispatch = useDispatch();
  const customerId = useSelector((s) => s.auth.customerId);

  const navLinkClass = ({ isActive }) =>
    isActive ? 'cl-nav-link cl-nav-link--active' : 'cl-nav-link';

  return (
    <div className="cl-root">
      {/* Top Navbar */}
      <header className="cl-topbar">
        <div className="cl-topbar__brand">Appointments Portal</div>
        <div className="cl-topbar__customer-id">
          <label htmlFor="customer-id-input">Customer ID:</label>
          <input
            id="customer-id-input"
            type="number"
            min="1"
            value={customerId}
            onChange={(e) => dispatch(setCustomerId(e.target.value))}
            className="cl-id-input"
          />
        </div>
      </header>

      <div className="cl-body">
        {/* Sidebar */}
        <aside className="cl-sidebar">
          <div className="cl-sidebar__title">Customer Menu</div>
          <nav className="cl-sidebar__nav">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={navLinkClass}
                end={to === '/customer/dashboard'}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="cl-sidebar__footer">
            <div className="cl-sidebar__id-label">Active Customer ID</div>
            <div className="cl-sidebar__id-value">Customer #{customerId}</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="cl-main">
          <Outlet context={{ customerId }} />
        </main>
      </div>
    </div>
  );
}

export default CustomerLayout;
