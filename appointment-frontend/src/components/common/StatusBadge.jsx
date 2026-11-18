import './StatusBadge.css';

export default function StatusBadge({ status, className = '' }) {
  const normStatus = (status || '').toLowerCase();
  return (
    <span className={`status-badge status-badge--${normStatus} ${className}`.trim()}>
      {status ? status.replace('_', ' ') : '—'}
    </span>
  );
}

