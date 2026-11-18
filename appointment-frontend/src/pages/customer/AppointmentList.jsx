import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAppointments, setLoading, setError } from '../../features/appointments/appointmentSlice';
import { appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import './CustomerPages.css';

const ALL_STATUSES = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AppointmentList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector((s) => s.customerAppointments);
  const customerId = useSelector((s) => s.auth.customerId);

  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        dispatch(setLoading(true));
        const params = { customer_id: customerId };
        if (statusFilter) params.status = statusFilter;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        const response = await appointmentAPI.listAppointments(params);
        const data = Array.isArray(response.data) ? response.data : response.data.results ?? [];
        dispatch(setAppointments(data));
      } catch (err) {
        dispatch(setError(err.message || 'Failed to load appointments.'));
      }
    };
    fetchAppointments();
  }, [customerId, statusFilter, startDate, endDate, dispatch]);

  const handleReset = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="customer-container">
      {/* Header */}
      <div className="customer-header">
        <div>
          <h1 className="customer-header__title">My Appointments</h1>
          <p className="customer-header__subtitle">
            Appointments booked under Customer #{customerId}
          </p>
        </div>
        <button
          onClick={() => navigate('/customer/appointments/create')}
          className="customer-header__btn"
        >
          + Book Appointment
        </button>
      </div>

      {error && (
        <div className="customer-alert customer-alert--error">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="customer-filter-bar">
        <div className="customer-filter-grid">
          <div className="customer-form-field">
            <label className="customer-form-label">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="customer-form-input"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="customer-form-field">
            <label className="customer-form-label">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="customer-form-input"
            />
          </div>

          <div className="customer-form-field">
            <label className="customer-form-label">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="customer-form-input"
            />
          </div>

          {(statusFilter || startDate || endDate) && (
            <button
              onClick={handleReset}
              className="customer-header__btn-back"
              style={{ alignSelf: 'flex-end', height: '40px' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Appointments List Card */}
      <div className="customer-card">
        <div className="customer-card__header">
          <h2 className="customer-card__title">
            Bookings ({appointments.length})
          </h2>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="customer-card__empty">
            No appointments found for the selected filters.{' '}
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
                  {['ID', 'Title', 'Status', 'Provider', 'Scheduled At', 'Duration', 'Actions'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="customer-table__id">#{appt.id}</td>
                    <td className="customer-table__title">{appt.title}</td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td>
                      {appt.provider_id ? `Provider #${appt.provider_id}` : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Unassigned</span>}
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
                        View Details
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
