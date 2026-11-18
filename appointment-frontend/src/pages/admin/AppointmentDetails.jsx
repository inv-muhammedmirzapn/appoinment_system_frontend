import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedAppointment, clearSelectedAppointment, setLoading, setError } from '../../features/appointments/adminAppointmentSlice';
import { appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import './AdminAppointmentDetails.css';

const STATUSES = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];
const TERMINAL = ['COMPLETED', 'CANCELLED', 'REJECTED'];
const NON_TERMINAL = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'];

const STATUS_HERO_COLORS = {
  PENDING: '#f59e0b',
  ASSIGNED: '#3b82f6',
  ACCEPTED: '#10b981',
  IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#059669',
  CANCELLED: '#6b7280',
  REJECTED: '#ef4444',
};

function ActionCard({ title, children }) {
  return (
    <div className="admin-details__card">
      <h3 className="admin-details__card-title">{title}</h3>
      {children}
    </div>
  );
}

function FeedbackMsg({ msg }) {
  if (!msg) return null;
  const isError = msg.startsWith('Error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('invalid');
  return (
    <div className={`admin-details__feedback ${isError ? 'admin-details__feedback--error' : 'admin-details__feedback--success'}`}>
      {msg}
    </div>
  );
}

function AssignSection({ id, adminId, isReassign = false, onDone }) {
  const [providerId, setProviderId] = useState('');
  const [assignedBy, setAssignedBy] = useState(String(adminId || 1));
  const [loading, setLoadingState] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!providerId) return setMsg('Provider ID is required');
    setLoadingState(true); setMsg('');
    try {
      await appointmentAPI.assignProvider(id, {
        provider_id: parseInt(providerId, 10),
        assigned_by: assignedBy ? parseInt(assignedBy, 10) : undefined,
      });
      setMsg(isReassign ? 'Provider re-assigned successfully' : 'Provider assigned successfully');
      setProviderId('');
      onDone();
    } catch (err) {
      setMsg(err.message || 'Failed to assign provider');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <ActionCard title={isReassign ? 'Re-assign Provider' : 'Assign Provider'}>
      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
        {isReassign
          ? 'This appointment was rejected. Assign another active provider.'
          : 'Assign an active healthcare provider to this appointment.'}
      </p>
      <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
        <div>
          <label className="admin-details__form-label">Provider ID *</label>
          <input
            type="number"
            min="1"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            placeholder="e.g. 11, 1, 2"
            className="admin-details__form-input"
          />
        </div>
        <div>
          <label className="admin-details__form-label">Assigned By (Admin ID)</label>
          <input
            type="number"
            min="1"
            value={assignedBy}
            onChange={(e) => setAssignedBy(e.target.value)}
            placeholder="Admin ID"
            className="admin-details__form-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="admin-details__btn-action"
          style={{ background: isReassign ? '#f59e0b' : '#3b82f6' }}
        >
          {loading ? 'Assigning…' : isReassign ? 'Re-assign Provider' : 'Assign Provider'}
        </button>
      </form>
      <FeedbackMsg msg={msg} />
    </ActionCard>
  );
}

function ProviderLifecycleNotice({ status, providerId }) {
  const navigate = useNavigate();
  return (
    <div className="admin-details__provider-notice">
      <div className="admin-details__provider-notice-header">
        <h3 className="admin-details__provider-notice-title">
          Provider Status
        </h3>
      </div>
      <p className="admin-details__provider-notice-text">
        {status === 'ASSIGNED' && `Assigned to Provider #${providerId}. Awaiting provider response (Accept / Reject) in Provider Portal.`}
        {status === 'ACCEPTED' && `Accepted by Provider #${providerId}. Waiting for provider to start session.`}
        {status === 'IN_PROGRESS' && `Session currently in progress with Provider #${providerId}.`}
        {status === 'COMPLETED' && `Appointment completed by Provider #${providerId}.`}
        {status === 'REJECTED' && `Appointment was rejected by Provider #${providerId}. You can re-assign a new provider.`}
      </p>
      {['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(status) && (
        <button
          onClick={() => navigate('/provider/dashboard')}
          className="admin-details__btn-provider-portal"
        >
          Open Provider Portal →
        </button>
      )}
    </div>
  );
}

function CancelSection({ id, adminId, onDone }) {
  const [loading, setLoadingState] = useState(false);
  const [msg, setMsg] = useState('');
  const [confirm, setConfirm] = useState(false);

  const submit = async () => {
    setLoadingState(true); setMsg('');
    try {
      await appointmentAPI.cancelAppointment(id, { actor_id: Number(adminId) });
      setMsg('Appointment cancelled');
      setConfirm(false);
      onDone();
    } catch (err) {
      setMsg(err.message || 'Failed to cancel');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <ActionCard title="Cancel Appointment">
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="admin-details__btn-action"
          style={{ background: '#6b7280' }}
        >
          Cancel Appointment
        </button>
      ) : (
        <div>
          <p style={{ margin: '0 0 12px', color: '#374151', fontSize: '14px' }}>
            Are you sure you want to cancel this appointment as Admin #{adminId}? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={submit}
              disabled={loading}
              className="admin-details__btn-action"
              style={{ background: '#ef4444' }}
            >
              {loading ? 'Cancelling…' : 'Yes, Cancel Appointment'}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="admin-details__btn-action"
              style={{ background: '#ffffff', color: '#374151', border: '1px solid #d1d5db' }}
            >
              Go Back
            </button>
          </div>
        </div>
      )}
      <FeedbackMsg msg={msg} />
    </ActionCard>
  );
}

function RescheduleSection({ id, adminId, onDone }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoadingState] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!scheduledAt) return setMsg('Please select a date and time');
    setLoadingState(true); setMsg('');
    try {
      await appointmentAPI.rescheduleAppointment(id, {
        scheduled_at: new Date(scheduledAt).toISOString(),
        actor_id: Number(adminId),
      });
      setMsg('Appointment rescheduled successfully');
      setScheduledAt('');
      onDone();
    } catch (err) {
      setMsg(err.message || 'Failed to reschedule');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <ActionCard title="Reschedule Appointment">
      <form onSubmit={submit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label className="admin-details__form-label">New Date & Time *</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="admin-details__form-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="admin-details__btn-action"
          style={{ background: '#1e2a3a' }}
        >
          {loading ? 'Rescheduling…' : 'Reschedule'}
        </button>
      </form>
      <FeedbackMsg msg={msg} />
    </ActionCard>
  );
}

function UpdateStatusSection({ id, adminId, onDone }) {
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoadingState] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!newStatus) return setMsg('Please select a status');
    setLoadingState(true); setMsg('');
    try {
      await appointmentAPI.updateAppointmentStatus(id, {
        new_status: newStatus,
        actor_id: Number(adminId),
      });
      setMsg(`Status manually overridden to ${newStatus}`);
      setNewStatus('');
      onDone();
    } catch (err) {
      setMsg(err.message || 'Failed to update status');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <ActionCard title="Status Override (Admin Privileged)">
      <form onSubmit={submit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label className="admin-details__form-label">New Status *</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="admin-details__form-input"
            style={{ background: '#fff' }}
          >
            <option value="">Select status…</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="admin-details__btn-action"
          style={{ background: '#1e2a3a' }}
        >
          {loading ? 'Updating…' : 'Update Status'}
        </button>
      </form>
      <FeedbackMsg msg={msg} />
    </ActionCard>
  );
}

function EditDetailsSection({ id, adminId, appointment, onDone }) {
  const [title, setTitle] = useState(appointment.title || '');
  const [description, setDescription] = useState(appointment.description || '');
  const [duration, setDuration] = useState(appointment.duration_minutes || '');
  const [loading, setLoadingState] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoadingState(true); setMsg('');
    try {
      await appointmentAPI.updateAppointment(id, {
        title,
        description,
        duration_minutes: duration ? parseInt(duration, 10) : undefined,
        actor_id: Number(adminId),
      });
      setMsg('Details updated successfully');
      onDone();
    } catch (err) {
      setMsg(err.message || 'Failed to update details');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <ActionCard title="Edit Appointment Details">
      <form onSubmit={submit}>
        <div style={{ marginBottom: '12px' }}>
          <label className="admin-details__form-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Appointment title"
            className="admin-details__form-input admin-details__form-input--full"
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label className="admin-details__form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="admin-details__form-input admin-details__form-input--full"
            style={{ resize: 'vertical' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label className="admin-details__form-label">Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 30"
            className="admin-details__form-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="admin-details__btn-action"
          style={{ background: '#1e2a3a' }}
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
        <FeedbackMsg msg={msg} />
      </form>
    </ActionCard>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="admin-details__row">
      <div className="admin-details__row-label">{label}</div>
      <div className="admin-details__row-value">
        {value ?? <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>—</span>}
      </div>
    </div>
  );
}

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedAppointment, loading, error } = useSelector((s) => s.adminAppointments);
  const adminId = useSelector((s) => s.auth.adminId);

  const fetchAppointment = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await appointmentAPI.getAppointment(id);
      dispatch(setSelectedAppointment(res.data));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to load appointment'));
    }
  }, [id, dispatch]);

  useEffect(() => {
    let ignore = false;
    dispatch(clearSelectedAppointment());
    const loadData = async () => {
      try {
        dispatch(setLoading(true));
        const res = await appointmentAPI.getAppointment(id);
        if (!ignore) {
          dispatch(setSelectedAppointment(res.data));
        }
      } catch (err) {
        if (!ignore) {
          dispatch(setError(err.message || 'Failed to load appointment'));
        }
      }
    };
    loadData();
    return () => {
      ignore = true;
      dispatch(clearSelectedAppointment());
    };
  }, [id, dispatch]);

  if (loading && !selectedAppointment) {
    return (
      <div className="loading-center">
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div className="spinner" style={{ marginBottom: '12px' }} />
          <p>Loading appointment details…</p>
        </div>
      </div>
    );
  }

  if (error && !selectedAppointment) {
    return (
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/admin/appointments')}
          className="admin-details__back-btn"
        >
          ← Back to Appointments
        </button>
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '20px', borderRadius: '10px', fontWeight: 500 }}>
          {error}
        </div>
      </div>
    );
  }

  if (!selectedAppointment) return null;

  const apt = selectedAppointment;
  const status = apt.status;
  const isTerminal = TERMINAL.includes(status);
  const isNonTerminal = NON_TERMINAL.includes(status);
  const headerBg = STATUS_HERO_COLORS[status] || '#1e2a3a';

  return (
    <div className="admin-details">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/appointments')}
        className="admin-details__back-btn"
      >
        ← Back to Appointments
      </button>

      {/* Status Header */}
      <div
        className="admin-details__hero"
        style={{ background: headerBg }}
      >
        <div className="admin-details__hero-circle" />
        <div style={{ position: 'relative' }}>
          <div className="admin-details__hero-label">
            Appointment #{apt.id}
          </div>
          <h1 className="admin-details__hero-title">{apt.title}</h1>
          <div className="admin-details__hero-meta">
            <span className="admin-details__hero-badge">
              {status}
            </span>
            <span className="admin-details__hero-info">
              {apt.scheduled_at ? `Scheduled: ${new Date(apt.scheduled_at).toLocaleString()}` : ''}
            </span>
            <span className="admin-details__hero-info">
              Duration: {apt.duration_minutes || 0} minutes
            </span>
          </div>
        </div>
      </div>

      <div className="admin-details__grid">
        {/* Left: Details */}
        <div>
          <div className="admin-details__card">
            <h2 className="admin-details__card-title">
              Appointment Details
            </h2>
            <DetailRow label="ID" value={`#${apt.id}`} />
            <DetailRow label="Title" value={apt.title} />
            <DetailRow label="Description" value={apt.description || 'No description provided.'} />
            <DetailRow label="Status" value={<StatusBadge status={status} />} />
            <DetailRow label="Customer ID" value={`Customer #${apt.customer_id}`} />
            <DetailRow label="Provider ID" value={apt.provider_id ? `Provider #${apt.provider_id}` : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Unassigned</span>} />
            <DetailRow label="Scheduled At" value={apt.scheduled_at ? new Date(apt.scheduled_at).toLocaleString() : null} />
            <DetailRow label="Duration" value={apt.duration_minutes ? `${apt.duration_minutes} minutes` : null} />
          </div>

          {isTerminal && (
            <div className="admin-details__terminal-box">
              <strong>This appointment is marked as {status.toLowerCase()}.</strong>
              <br />Lifecycle workflow is concluded. Status override can still be applied if necessary.
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div>
          <h2 className="admin-details__section-title">
            Admin Actions & Provider Status
          </h2>

          {/* Provider Assignment / Re-assignment */}
          {(status === 'PENDING' || status === 'REJECTED') && (
            <AssignSection
              id={id}
              adminId={adminId}
              isReassign={status === 'REJECTED'}
              onDone={fetchAppointment}
            />
          )}

          {/* Provider Lifecycle Notice */}
          {status !== 'PENDING' && (
            <ProviderLifecycleNotice status={status} providerId={apt.provider_id} />
          )}

          {isNonTerminal && (
            <>
              <CancelSection id={id} adminId={adminId} onDone={fetchAppointment} />
              <RescheduleSection id={id} adminId={adminId} onDone={fetchAppointment} />
            </>
          )}

          {/* Always available admin tools */}
          <UpdateStatusSection id={id} adminId={adminId} onDone={fetchAppointment} />
          <EditDetailsSection id={id} adminId={adminId} appointment={apt} onDone={fetchAppointment} />
        </div>
      </div>
    </div>
  );
}
