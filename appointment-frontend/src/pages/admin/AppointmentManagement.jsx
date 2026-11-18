import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAppointments, setLoading, setError } from '../../features/appointments/adminAppointmentSlice';
import { appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import './AppointmentManagement.css';

const STATUSES = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];
const PAGE_SIZE = 10;

export default function AppointmentManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector((s) => s.adminAppointments);

  const [filters, setFilters] = useState({ customer_id: '', status: '', start_date: '', end_date: '' });
  const [page, setPage] = useState(1);
  const [localError, setLocalError] = useState('');
  const [fetching, setFetching] = useState(false);

  const fetchAppointments = useCallback(async (f = filters) => {
    try {
      setFetching(true);
      dispatch(setLoading(true));
      const params = {};
      if (f.customer_id) params.customer_id = Number(f.customer_id);
      if (f.status) params.status = f.status;
      if (f.start_date) params.start_date = f.start_date;
      if (f.end_date) params.end_date = f.end_date;
      const res = await appointmentAPI.listAppointments(params);
      const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
      dispatch(setAppointments(data));
      setLocalError('');
      setPage(1);
    } catch (err) {
      const msg = err.message || 'Failed to load appointments';
      setLocalError(msg);
      dispatch(setError(msg));
    } finally {
      setFetching(false);
    }
  }, [filters, dispatch]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (field, val) => {
    setFilters((prev) => ({ ...prev, [field]: val }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    fetchAppointments(filters);
  };

  const handleReset = () => {
    const blank = { customer_id: '', status: '', start_date: '', end_date: '' };
    setFilters(blank);
    fetchAppointments(blank);
  };

  const totalPages = Math.ceil(appointments.length / PAGE_SIZE) || 1;
  const paginated = appointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayError = localError || error;
  const isLoading = fetching || loading;

  return (
    <div className="admin-mgmt">
      {/* Header */}
      <div className="admin-mgmt__header">
        <div>
          <h1 className="admin-mgmt__title">All Appointments</h1>
          <p className="admin-mgmt__subtitle">Search, filter, and review appointments across the platform</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="admin-mgmt__btn-back"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Filter Card */}
      <form onSubmit={handleApply} className="admin-mgmt__filter-form">
        <div className="admin-mgmt__filter-grid">
          <div>
            <label className="admin-mgmt__field-label">Customer ID</label>
            <input
              type="number"
              min="1"
              value={filters.customer_id}
              onChange={(e) => handleFilterChange('customer_id', e.target.value)}
              placeholder="e.g. 1"
              className="admin-mgmt__field-input"
            />
          </div>
          <div>
            <label className="admin-mgmt__field-label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="admin-mgmt__field-input"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-mgmt__field-label">From Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="admin-mgmt__field-input"
            />
          </div>
          <div>
            <label className="admin-mgmt__field-label">To Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="admin-mgmt__field-input"
            />
          </div>
        </div>
        <div className="admin-mgmt__filter-actions">
          <button
            type="submit"
            className="admin-mgmt__btn-submit"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="admin-mgmt__btn-reset"
          >
            Reset
          </button>
        </div>
      </form>

      {displayError && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 500 }}>
          {displayError}
        </div>
      )}

      {/* Table Card */}
      <div className="admin-mgmt__table-card">
        <div className="admin-mgmt__table-header">
          <span style={{ fontWeight: 600, color: '#1e2a3a', fontSize: '15px' }}>
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
          </span>
          {totalPages > 1 && (
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div className="spinner" style={{ marginBottom: '10px' }} />
            <p>Loading appointments…</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-mgmt__table">
              <thead>
                <tr>
                  {['ID', 'Customer ID', 'Provider ID', 'Title', 'Status', 'Scheduled At', 'Duration', 'Actions'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '50px', textAlign: 'center', color: '#9ca3af', fontSize: '15px' }}>
                      No appointments match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((apt, idx) => (
                    <tr key={apt.id} style={{ background: idx % 2 === 1 ? '#fafbfc' : '#fff' }}>
                      <td style={{ fontWeight: 600, color: '#1e2a3a' }}>#{apt.id}</td>
                      <td>Customer #{apt.customer_id}</td>
                      <td>
                        {apt.provider_id ? `Provider #${apt.provider_id}` : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Unassigned</span>}
                      </td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.title}</td>
                      <td><StatusBadge status={apt.status} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {apt.scheduled_at ? new Date(apt.scheduled_at).toLocaleString() : '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {apt.duration_minutes ? `${apt.duration_minutes} min` : '—'}
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/appointments/${apt.id}`)}
                          style={{ padding: '7px 16px', background: '#1e2a3a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-mgmt__pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="admin-mgmt__page-btn"
            >
              ← Previous
            </button>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: p === page ? '#1e2a3a' : '#d1d5db',
                    background: p === page ? '#1e2a3a' : '#fff',
                    color: p === page ? '#fff' : '#374151',
                    cursor: 'pointer',
                    fontWeight: p === page ? 700 : 400,
                    fontSize: '14px',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="admin-mgmt__page-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
