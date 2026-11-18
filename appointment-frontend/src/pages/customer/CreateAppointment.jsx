import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addAppointment } from '../../features/appointments/appointmentSlice';
import { appointmentAPI } from '../../services/api';
import './CustomerPages.css';

export default function CreateAppointment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customerId = useSelector((s) => s.auth.customerId);

  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: '30',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required.';
    if (!form.scheduled_at) newErrors.scheduled_at = 'Scheduled date and time are required.';
    if (!form.duration_minutes || Number(form.duration_minutes) < 1)
      newErrors.duration_minutes = 'Duration must be at least 1 minute.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        customer_id: Number(customerId),
        title: form.title.trim(),
        description: form.description.trim(),
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: Number(form.duration_minutes),
      };
      const response = await appointmentAPI.createAppointment(payload);
      const newAppt = response.data;
      dispatch(addAppointment(newAppt));
      navigate(`/customer/appointments/${newAppt.id}`);
    } catch (err) {
      setServerError(err.message || 'Failed to create appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="customer-container--narrow">
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/customer/appointments')}
          className="customer-header__btn-back"
          style={{ marginBottom: '12px' }}
        >
          ← Back to Appointments
        </button>
        <h1 className="customer-header__title">Book New Appointment</h1>
        <p className="customer-header__subtitle">
          Scheduling as Customer #{customerId}. Fill in the details below.
        </p>
      </div>

      {/* Form Card */}
      <div className="customer-card customer-form-card">
        {serverError && (
          <div className="customer-alert customer-alert--error">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="customer-form-field" style={{ marginBottom: '20px' }}>
            <label className="customer-form-label" htmlFor="title">
              Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Medical Consultation / Support Meeting"
              className="customer-form-input"
              style={{ borderColor: errors.title ? '#ef4444' : undefined }}
            />
            {errors.title && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="customer-form-field" style={{ marginBottom: '20px' }}>
            <label className="customer-form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional notes or details about this appointment..."
              rows={4}
              className="customer-form-input"
              style={{ resize: 'vertical', minHeight: '90px' }}
            />
          </div>

          {/* Scheduled At */}
          <div className="customer-form-field" style={{ marginBottom: '20px' }}>
            <label className="customer-form-label" htmlFor="scheduled_at">
              Scheduled Date & Time <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
              value={form.scheduled_at}
              onChange={handleChange}
              className="customer-form-input"
              style={{ borderColor: errors.scheduled_at ? '#ef4444' : undefined }}
            />
            {errors.scheduled_at && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{errors.scheduled_at}</p>
            )}
          </div>

          {/* Duration */}
          <div className="customer-form-field" style={{ marginBottom: '28px' }}>
            <label className="customer-form-label" htmlFor="duration_minutes">
              Duration (minutes) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="duration_minutes"
              name="duration_minutes"
              value={form.duration_minutes}
              onChange={handleChange}
              className="customer-form-input"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes (1 hour)</option>
              <option value="90">90 minutes (1.5 hours)</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="customer-header__btn"
            style={{ width: '100%', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Booking Appointment…' : 'Confirm & Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
