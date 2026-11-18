import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { appointmentAPI } from '../../services/api';
import { setProviderId } from '../../features/auth/authSlice';
import StatusBadge from '../../components/common/StatusBadge';
import './ProviderAppointmentDetails.css';

function DetailRow({ label, value }) {
  return (
    <div className="provider-details__row">
      <div className="provider-details__row-label">{label}</div>
      <div className="provider-details__row-value">
        {value ?? <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>}
      </div>
    </div>
  );
}

export default function ProviderAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const providerId = useSelector((s) => s.auth.providerId || 11);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchAppointment = useCallback(async () => {
    try {
      setLoading(true);
      const res = await appointmentAPI.getAppointment(id);
      setAppointment(res.data);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to load appointment' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const handleAccept = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await appointmentAPI.acceptAppointment(id, { provider_id: Number(providerId) });
      setFeedback({ type: 'success', text: 'Appointment accepted successfully!' });
      await fetchAppointment();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to accept' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this appointment?')) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await appointmentAPI.rejectAppointment(id, { provider_id: Number(providerId) });
      setFeedback({ type: 'success', text: 'Appointment rejected.' });
      await fetchAppointment();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to reject' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await appointmentAPI.startAppointment(id, { provider_id: Number(providerId) });
      setFeedback({ type: 'success', text: 'Appointment session is now In Progress!' });
      await fetchAppointment();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to start' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await appointmentAPI.completeAppointment(id, { provider_id: Number(providerId) });
      setFeedback({ type: 'success', text: 'Appointment completed successfully!' });
      await fetchAppointment();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to complete' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !appointment) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading appointment details…
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="provider-details">
        <button
          onClick={() => navigate('/provider/dashboard')}
          className="provider-details__back-btn"
        >
          ← Back to Dashboard
        </button>
        <div className="provider-details__alert provider-details__alert--error">
          {feedback?.text || 'Appointment not found'}
        </div>
      </div>
    );
  }

  const isAssignedToMe = Number(appointment.provider_id) === Number(providerId);

  return (
    <div className="provider-details">
      <button
        onClick={() => navigate('/provider/dashboard')}
        className="provider-details__back-btn"
      >
        ← Back to Provider Dashboard
      </button>

      {/* Hero Banner */}
      <div className="provider-details__hero">
        <div className="provider-details__hero-label">
          Provider Clinical Session #{appointment.id}
        </div>
        <h1 className="provider-details__hero-title">
          {appointment.title}
        </h1>
        <div className="provider-details__hero-meta">
          <span className="provider-details__hero-status">
            {appointment.status}
          </span>
          <span className="provider-details__hero-info">
            Scheduled: {appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString() : '—'}
          </span>
          <span className="provider-details__hero-info">
            Duration: {appointment.duration_minutes || 0} minutes
          </span>
        </div>
      </div>

      {/* Mismatch Notice */}
      {!isAssignedToMe && (
        <div className="provider-details__mismatch">
          <div>
            <div className="provider-details__mismatch-title">
              Notice: Provider ID Mismatch
            </div>
            <div className="provider-details__mismatch-desc">
              This appointment is assigned to <strong>Provider #{appointment.provider_id}</strong>, but your active profile is <strong>Provider #{providerId}</strong>.
            </div>
          </div>
          <button
            onClick={() => dispatch(setProviderId(appointment.provider_id))}
            className="provider-details__mismatch-btn"
          >
            Switch to Provider #{appointment.provider_id}
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`provider-details__alert provider-details__alert--${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      <div className="provider-details__grid">
        {/* Left Column */}
        <div className="provider-details__card">
          <h2 className="provider-details__card-title">
            Appointment Information
          </h2>
          <DetailRow label="Appointment ID" value={`#${appointment.id}`} />
          <DetailRow label="Title" value={appointment.title} />
          <DetailRow label="Description" value={appointment.description || 'No description provided.'} />
          <DetailRow label="Customer" value={`Customer #${appointment.customer_id}`} />
          <DetailRow label="Assigned Provider" value={`Provider #${appointment.provider_id}`} />
          <DetailRow label="Scheduled Date & Time" value={appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString() : '—'} />
          <DetailRow label="Session Duration" value={`${appointment.duration_minutes || 0} minutes`} />
          <DetailRow label="Current Status" value={<StatusBadge status={appointment.status} />} />
        </div>

        {/* Right Column */}
        <div>
          <div className="provider-details__card">
            <h2 className="provider-details__card-title">
              Provider Actions
            </h2>

            {appointment.status === 'ASSIGNED' && (
              <div>
                <p className="provider-details__desc">
                  This appointment has been assigned to you. Please confirm whether you can accept or decline this session.
                </p>
                <div className="provider-details__btn-group">
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading || !isAssignedToMe}
                    className="provider-details__btn-accept"
                  >
                    {actionLoading ? 'Processing…' : '✓ Accept Appointment'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !isAssignedToMe}
                    className="provider-details__btn-reject"
                  >
                    {actionLoading ? 'Processing…' : '✕ Reject Appointment'}
                  </button>
                </div>
              </div>
            )}

            {appointment.status === 'ACCEPTED' && (
              <div>
                <p className="provider-details__desc">
                  You have accepted this appointment. When you are ready to begin the consultation, click below:
                </p>
                <button
                  onClick={handleStart}
                  disabled={actionLoading || !isAssignedToMe}
                  className="provider-details__btn-start"
                >
                  {actionLoading ? 'Starting…' : '▶ Begin Session (Start Appointment)'}
                </button>
              </div>
            )}

            {appointment.status === 'IN_PROGRESS' && (
              <div>
                <p className="provider-details__desc">
                  This session is currently active. Once finished, conclude the appointment:
                </p>
                <button
                  onClick={handleComplete}
                  disabled={actionLoading || !isAssignedToMe}
                  className="provider-details__btn-complete"
                >
                  {actionLoading ? 'Completing…' : '✓ Conclude & Mark Complete'}
                </button>
              </div>
            )}

            {appointment.status === 'COMPLETED' && (
              <div className="provider-details__status-box provider-details__status-box--completed">
                <span style={{ fontSize: '24px' }}>🎉</span>
                <div style={{ fontWeight: 700, color: '#166534', marginTop: '6px' }}>
                  Session Completed
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                  All provider actions have concluded.
                </div>
              </div>
            )}

            {appointment.status === 'REJECTED' && (
              <div className="provider-details__status-box provider-details__status-box--rejected">
                <div style={{ fontWeight: 700, color: '#991b1b' }}>
                  Appointment Rejected
                </div>
                <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px' }}>
                  Returned to administrator queue for re-assignment.
                </div>
              </div>
            )}

            {appointment.status === 'CANCELLED' && (
              <div className="provider-details__status-box provider-details__status-box--cancelled">
                <div style={{ fontWeight: 700, color: '#475569' }}>
                  Appointment Cancelled
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
