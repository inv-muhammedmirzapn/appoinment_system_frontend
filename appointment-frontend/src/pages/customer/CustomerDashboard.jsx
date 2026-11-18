import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAppointments, setLoading, setError } from '../../features/appointments/appointmentSlice';
import { appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import './CustomerPages.css';

function StatCard({ label, count, color }) {
  return (
    <div
      className="customer-stat-card"
      style={{ borderLeft: `5px solid ${color}` }}
    >
      <span className="customer-stat-card__val" style={{ color }}>{count}</span>
      <span className="customer-stat-card__lbl">{label}</span>
    </div>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector((s) => s.customerAppointments);
  const customerId = useSelector((s) => s.auth.customerId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const response = await appointmentAPI.listAppointments({ customer_id: customerId });
        const data = Array.isArray(response.data) ? response.data : response.data.results ?? [];
        dispatch(setAppointments(data));
      } catch (err) {
        dispatch(setError(err.message || 'Failed to load appointments.'));
      }
    };
    fetchData();
  }, [customerId, dispatch]);

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'PENDING').length;
  const upcoming = appointments.filter((a) => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(a.status)).length;
  const completed = appointments.filter((a) => a.status === 'COMPLETED').length;

  const recent = [...appointments]
    .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="customer-container">
      {/* Header */}
      <div className="customer-header">
        <div>
          <h1 className="customer-header__title">My Dashboard</h1>
          <p className="customer-header__subtitle">
            Welcome! Viewing appointments for Customer #{customerId}
          </p>
        </div>
        <button
          onClick={() => navigate('/customer/appointments/create')}
          className="customer-header__btn"
        >
          + Book New Appointment
        </button>
      </div>

      {error && (
        <div className="customer-alert customer-alert--error">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="customer-stats">
        <StatCard label="Total Bookings" count={total} color="#2563eb" />
        <StatCard label="Pending" count={pending} color="#f59e0b" />
        <StatCard label="Active / Upcoming" count={upcoming} color="#10b981" />
        <StatCard label="Completed" count={completed} color="#6b7280" />
      </div>

      {/* Recent Appointments Table */}
      <div className="customer-card">
        <div className="customer-card__header">
          <h2 className="customer-card__title">Recent Appointments</h2>
          {appointments.length > 5 && (
            <button
              onClick={() => navigate('/customer/appointments')}
              className="customer-card__link"
            >
              View All ({appointments.length}) →
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="customer-card__empty">
            No appointments yet.{' '}
            <span
              style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/customer/appointments/create')}
            >
              Book one now!
            </span>
          </div>
        ) : (
          <div className="customer-table-scroll">
            <table className="customer-table">
              <thead>
                <tr>
                  {['ID', 'Title', 'Status', 'Scheduled At', 'Duration', 'Actions'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((appt) => (
                  <tr key={appt.id}>
                    <td className="customer-table__id">#{appt.id}</td>
                    <td className="customer-table__title">{appt.title}</td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td>
                      {appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleString() : '—'}
                    </td>
                    <td>
                      {appt.duration_minutes ? `${appt.duration_minutes} min` : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/customer/appointments/${appt.id}`)}
                        className="customer-table__btn-view"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
