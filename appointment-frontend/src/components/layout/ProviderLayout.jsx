import { Outlet, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setProviderId } from '../../features/auth/authSlice';
import './ProviderLayout.css';

const NAV_LINKS = [
  { to: '/provider/dashboard', label: 'Provider Dashboard' },
];

function ProviderLayout() {
  const dispatch = useDispatch();
  const providerId = useSelector((s) => s.auth.providerId || 11);

  const navLinkClass = ({ isActive }) =>
    isActive ? 'pl-nav-link pl-nav-link--active' : 'pl-nav-link';

  return (
    <div className="pl-root">
      {/* Sidebar */}
      <aside className="pl-sidebar">
        <div className="pl-sidebar__header">
          <div className="pl-sidebar__brand">
            <div className="pl-sidebar__title">Provider Portal</div>
          </div>
          <div className="pl-sidebar__subtitle">Clinician & Provider Console</div>
        </div>

        <nav className="pl-sidebar__nav">
          <div className="pl-sidebar__section-label">Navigation</div>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={navLinkClass}
              end={to === '/provider/dashboard'}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Provider ID input */}
        <div className="pl-sidebar__footer">
          <div className="pl-sidebar__id-label">Active Provider ID</div>
          <input
            type="number"
            min="1"
            value={providerId}
            onChange={(e) => dispatch(setProviderId(e.target.value))}
            className="pl-id-input"
            aria-label="Provider ID"
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-content-area">
        <header className="pl-topbar">
          <h1 className="pl-topbar__title">Provider Workspace</h1>
          <div className="pl-topbar__right">
            <span className="pl-badge">Provider Mode</span>
            <span className="pl-topbar__user">Provider #{providerId}</span>
          </div>
        </header>

        <main className="pl-main">
          <Outlet context={{ providerId }} />
        </main>
      </div>
    </div>
  );
}

export default ProviderLayout;
