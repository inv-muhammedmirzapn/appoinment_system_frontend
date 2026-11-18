import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import './ProviderDashboard.css';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const providerId = useSelector((s) => s.auth.providerId || 11);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.listAppointments({});
      const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
      setAppointments(data);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to fetch appointments' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, providerId]);

  const myAppointments = useMemo(() => {
    return appointments.filter((apt) => Number(apt.provider_id) === Number(providerId));
  }, [appointments, providerId]);

  const counts = useMemo(() => {
    return {
      TOTAL: myAppointments.length,
      ASSIGNED: myAppointments.filter((a) => a.status === 'ASSIGNED').length,
      ACCEPTED: myAppointments.filter((a) => a.status === 'ACCEPTED').length,
      IN_PROGRESS: myAppointments.filter((a) => a.status === 'IN_PROGRESS').length,
      COMPLETED: myAppointments.filter((a) => a.status === 'COMPLETED').length,
    };
  }, [myAppointments]);

  const filtered = useMemo(() => {
    if (selectedFilter === 'ALL') return myAppointments;
    return myAppointments.filter((a) => a.status === selectedFilter);
  }, [myAppointments, selectedFilter]);

  const handleAccept = async (aptId) => {
    setActionLoadingId(aptId);
    setFeedback(null);
    try {
      await appointmentAPI.acceptAppointment(aptId, { provider_id: Number(providerId) });
      setFeedback({ type: 'success', text: `Appointment #${aptId} accepted!` });
      await fetchAppointments();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to accept appointment' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (aptId) => {
    if (!window.confirm(`Reject appointment #${aptId}? It will be returned to Admin for re-assignment.`)) return;
    setActionLoadingId(aptId);
    setFeedback(null);
    try {
      await appointmentAPI.rejectAppointment(aptId, { provider_id: Number(providerId) });
      setFeedback({ type: 'success', text: `Appointment #${aptId} rejected.` });
      await fetchAppointments();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to reject appointment' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStart = async (aptId) => {
    setActionLoadingId(aptId);
    setFeedback(null);
    try {
      await appointmentAPI.startAppointment(aptId, { provider_id: Number(providerId) });
      setFeedback({ type: 'success', text: `Appointment #${aptId} is now In Progress!` });
      await fetchAppointments();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to start appointment' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (aptId) => {
    setActionLoadingId(aptId);
    setFeedback(null);
    try {
      await appointmentAPI.completeAppointment(aptId, { provider_id: Number(providerId) });
      setFeedback({ type: 'success', text: `Appointment #${aptId} marked as Completed!` });
      await fetchAppointments();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to complete appointment' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="provider-dashboard">
      {/* Header */}
      <div className="provider-dashboard__header">
        <div>
          <h1 className="provider-dashboard__title">Provider Dashboard</h1>
          <p className="provider-dashboard__subtitle">
            Appointments assigned to Provider #{providerId}
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="provider-dashboard__btn-refresh"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`provider-dashboard__alert provider-dashboard__alert--${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="provider-dashboard__metrics">
        <div
          onClick={() => setSelectedFilter('ALL')}
          className={`provider-dashboard__metric-card provider-dashboard__metric-card--all ${selectedFilter === 'ALL' ? 'active' : ''}`}
        >
          <div className="provider-dashboard__metric-value">{counts.TOTAL}</div>
          <div className="provider-dashboard__metric-label">All Assigned</div>
        </div>

        <div
          onClick={() => setSelectedFilter('ASSIGNED')}
          className={`provider-dashboard__metric-card provider-dashboard__metric-card--assigned ${selectedFilter === 'ASSIGNED' ? 'active' : ''}`}
        >
          <div className="provider-dashboard__metric-value">{counts.ASSIGNED}</div>
          <div className="provider-dashboard__metric-label">Action Required</div>
        </div>

        <div
          onClick={() => setSelectedFilter('ACCEPTED')}
          className={`provider-dashboard__metric-card provider-dashboard__metric-card--accepted ${selectedFilter === 'ACCEPTED' ? 'active' : ''}`}
        >
          <div className="provider-dashboard__metric-value">{counts.ACCEPTED}</div>
          <div className="provider-dashboard__metric-label">Accepted / Upcoming</div>
        </div>

        <div
          onClick={() => setSelectedFilter('IN_PROGRESS')}
          className={`provider-dashboard__metric-card provider-dashboard__metric-card--in_progress ${selectedFilter === 'IN_PROGRESS' ? 'active' : ''}`}
        >
          <div className="provider-dashboard__metric-value">{counts.IN_PROGRESS}</div>
          <div className="provider-dashboard__metric-label">In Progress</div>
        </div>

        <div
          onClick={() => setSelectedFilter('COMPLETED')}
          className={`provider-dashboard__metric-card provider-dashboard__metric-card--completed ${selectedFilter === 'COMPLETED' ? 'active' : ''}`}
        >
          <div className="provider-dashboard__metric-value">{counts.COMPLETED}</div>
          <div className="provider-dashboard__metric-label">Completed</div>
        </div>
      </div>

      {/* Callout */}
      {counts.ASSIGNED > 0 && selectedFilter !== 'ASSIGNED' && (
        <div className="provider-dashboard__callout">
          <div className="provider-dashboard__callout-content">
            <span style={{ fontSize: '20px' }}>🔔</span>
            <span className="provider-dashboard__callout-text">
              You have {counts.ASSIGNED} new appointment assignment{counts.ASSIGNED > 1 ? 's' : ''} awaiting your response.
            </span>
          </div>
          <button
            onClick={() => setSelectedFilter('ASSIGNED')}
            className="provider-dashboard__callout-btn"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="provider-dashboard__table-card">
        <div className="provider-dashboard__table-header">
          <h2 className="provider-dashboard__table-title">
            {selectedFilter === 'ALL' ? 'My Appointments' : `${selectedFilter} Appointments`} ({filtered.length})
          </h2>
          {selectedFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedFilter('ALL')}
              className="provider-dashboard__clear-filter"
            >
              Show All
            </button>
          )}
        </div>

        <div className="provider-dashboard__table-scroll">
          <table className="provider-dashboard__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Scheduled At</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Provider Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="provider-dashboard__empty-cell">
                    No appointments found for Provider #{providerId} in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((apt, idx) => {
                  const isActionLoading = actionLoadingId === apt.id;
                  return (
                    <tr
                      key={apt.id}
                      className={idx % 2 === 1 ? 'provider-dashboard__row--alt' : ''}
                    >
                      <td className="provider-dashboard__id-cell">#{apt.id}</td>
                      <td className="provider-dashboard__title-cell">{apt.title}</td>
                      <td>Customer #{apt.customer_id}</td>
                      <td className="provider-dashboard__nowrap">
                        {apt.scheduled_at ? new Date(apt.scheduled_at).toLocaleString() : '—'}
                      </td>
                      <td>{apt.duration_minutes || 0} min</td>
                      <td>
                        <StatusBadge status={apt.status} />
                      </td>
                      <td>
                        <div className="provider-dashboard__actions-cell">
                          {apt.status === 'ASSIGNED' && (
                            <>
                              <button
                                onClick={() => handleAccept(apt.id)}
                                disabled={isActionLoading}
                                className="provider-dashboard__btn-accept"
                              >
                                {isActionLoading ? '…' : '✓ Accept'}
                              </button>
                              <button
                                onClick={() => handleReject(apt.id)}
                                disabled={isActionLoading}
                                className="provider-dashboard__btn-reject"
                              >
                                {isActionLoading ? '…' : '✕ Reject'}
                              </button>
                            </>
                          )}

                          {apt.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleStart(apt.id)}
                              disabled={isActionLoading}
                              className="provider-dashboard__btn-start"
                            >
                              {isActionLoading ? '…' : '▶ Start Session'}
                            </button>
                          )}

                          {apt.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleComplete(apt.id)}
                              disabled={isActionLoading}
                              className="provider-dashboard__btn-complete"
                            >
                              {isActionLoading ? '…' : '✓ Mark Complete'}
                            </button>
                          )}

                          <button
                            onClick={() => navigate(`/provider/appointments/${apt.id}`)}
                            className="provider-dashboard__btn-details"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
