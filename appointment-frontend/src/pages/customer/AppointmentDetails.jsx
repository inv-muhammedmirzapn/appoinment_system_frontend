import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedAppointment, updateAppointmentInList } from '../../features/appointments/appointmentSlice';
import { appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import './CustomerPages.css';

function DetailRow({ label, value }) {
  return (
    <div className="customer-detail-row">
      <span className="customer-detail-row__label">{label}</span>
      <span className="customer-detail-row__value">{value ?? '—'}</span>
    </div>
  );
}

const ACTIONABLE_STATUSES = ['PENDING', 'ASSIGNED', 'ACCEPTED'];

export default function CustomerAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedAppointment } = useSelector((s) => s.customerAppointments);
  const customerId = useSelector((s) => s.auth.customerId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Reschedule state
  const [rescheduleAt, setRescheduleAt] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await appointmentAPI.getAppointment(id);
        dispatch(setSelectedAppointment(response.data));
      } catch (err) {
        setError(err.message || 'Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, dispatch]);

  const appt = selectedAppointment;

  const openCancelModal = () => {
    setCancelError('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    if (cancelling) return;
    setShowCancelModal(false);
    setCancelError('');
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const response = await appointmentAPI.cancelAppointment(id, { actor_id: Number(customerId) });
      const updated = response.data;
      dispatch(setSelectedAppointment(updated));
      dispatch(updateAppointmentInList(updated));
      setShowCancelModal(false);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleAt) {
      setRescheduleError('Please select a new date and time.');
      return;
    }
    setRescheduling(true);
    setRescheduleError('');
    setRescheduleSuccess('');
    try {
      const response = await appointmentAPI.rescheduleAppointment(id, {
        scheduled_at: new Date(rescheduleAt).toISOString(),
        actor_id: Number(customerId),
      });
      const updated = response.data;
      dispatch(setSelectedAppointment(updated));
      dispatch(updateAppointmentInList(updated));
      setRescheduleSuccess('Appointment rescheduled successfully!');
      setRescheduleAt('');
    } catch (err) {
      setRescheduleError(err.message || 'Failed to reschedule appointment.');
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-container">
        <button
          onClick={() => navigate('/customer/appointments')}
          className="customer-header__btn-back"
          style={{ marginBottom: '16px' }}
        >
          ← Back to Appointments
        </button>
        <div className="customer-alert customer-alert--error">
          {error}
        </div>
      </div>
    );
  }

  if (!appt) return null;

  const isActionable = ACTIONABLE_STATUSES.includes(appt.status);

  return (
    <div className="customer-container--detail">
      {/* Back button */}
      <button
        onClick={() => navigate('/customer/appointments')}
        className="customer-header__btn-back"
        style={{ marginBottom: '20px' }}
      >
        ← Back to Appointments
      </button>

      {/* Detail Card */}
      <div className="customer-card">
        {/* Status Header */}
        <div className="customer-card__header customer-detail-header">
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
              APPOINTMENT #{appt.id}
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {appt.title}
            </h1>
          </div>
          <StatusBadge status={appt.status} />
        </div>

        {/* Details */}
        <div className="customer-detail-body">
          <DetailRow label="Description" value={appt.description || 'No description provided.'} />
          <DetailRow label="Scheduled At" value={appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleString() : '—'} />
          <DetailRow label="Duration" value={appt.duration_minutes ? `${appt.duration_minutes} minutes` : '—'} />
          <DetailRow label="Customer ID" value={appt.customer_id} />
          <DetailRow label="Assigned Provider" value={appt.provider_id ? `Provider #${appt.provider_id}` : 'Not yet assigned'} />
        </div>

        {/* Actions */}
        <div className="customer-detail-actions">
          {isActionable ? (
            <>
              {/* Cancel */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Cancel Appointment
                </h3>
                <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#64748b' }}>
                  If you are unable to attend, you can cancel this appointment.
                </p>
                <button
                  onClick={openCancelModal}
                  disabled={cancelling}
                  className="btn btn-danger"
                  style={{ padding: '10px 24px', opacity: cancelling ? 0.6 : 1 }}
                >
                  Cancel Appointment
                </button>
              </div>

              {/* Reschedule */}
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Reschedule Appointment
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#64748b' }}>
                  Select a new date and time for this booking.
                </p>
                {rescheduleError && (
                  <div className="customer-alert customer-alert--error">
                    {rescheduleError}
                  </div>
                )}
                {rescheduleSuccess && (
                  <div className="customer-alert customer-alert--success">
                    {rescheduleSuccess}
                  </div>
                )}
                <form onSubmit={handleReschedule} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                      New Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={rescheduleAt}
                      onChange={(e) => setRescheduleAt(e.target.value)}
                      className="customer-form-input"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={rescheduling}
                    className="customer-header__btn"
                    style={{ padding: '9px 20px', whiteSpace: 'nowrap', opacity: rescheduling ? 0.6 : 1 }}
                  >
                    {rescheduling ? 'Saving...' : 'Reschedule'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '20px 24px', color: '#64748b', fontSize: '0.95rem' }}>
              This appointment is <strong>{appt.status}</strong>. No customer modifications can be made.
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        loading={cancelling}
        error={cancelError}
        onConfirm={handleCancel}
        onClose={closeCancelModal}
      />
    </div>
  );
}
