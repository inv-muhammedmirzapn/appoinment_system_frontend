import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setAppointments,
  setLoading,
  setError,
} from "../../features/appointments/adminAppointmentSlice";
import { appointmentAPI } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import "./AdminDashboard.css";

const STATUSES = [
  "PENDING",
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

const STATUS_COLORS = {
  ALL: "#1e2a3a",
  PENDING: "#f59e0b",
  ASSIGNED: "#3b82f6",
  ACCEPTED: "#10b981",
  IN_PROGRESS: "#8b5cf6",
  COMPLETED: "#059669",
  CANCELLED: "#6b7280",
  REJECTED: "#ef4444",
};

function AssignModal({ appointment, onClose, onAssigned }) {
  const adminId = useSelector((s) => s.auth.adminId);
  const [providerId, setProviderId] = useState("");
  const [assignedBy, setAssignedBy] = useState(String(adminId || 1));
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState("");

  const isReassign = appointment.status === "REJECTED";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!providerId) return setErrorState("Provider ID is required");
    setLoading(true);
    setErrorState("");
    try {
      await appointmentAPI.assignProvider(appointment.id, {
        provider_id: parseInt(providerId, 10),
        assigned_by: assignedBy ? parseInt(assignedBy, 10) : undefined,
      });
      onAssigned();
      onClose();
    } catch (err) {
      setErrorState(err.message || "Failed to assign provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-modal__overlay" onClick={onClose}>
      <div className="assign-modal__card" onClick={(e) => e.stopPropagation()}>
        <h3 className="assign-modal__title">
          {isReassign ? "Re-assign Provider" : "Assign Provider"}
        </h3>
        <p className="assign-modal__subtitle">
          Appointment #{appointment.id} — {appointment.title}
        </p>
        {error && <div className="assign-modal__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="assign-modal__field">
            <label className="assign-modal__label">Provider ID *</label>
            <input
              type="number"
              min="1"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              placeholder="e.g. 11, 1, 2"
              className="assign-modal__input"
            />
          </div>
          <div className="assign-modal__field">
            <label className="assign-modal__label">
              Assigned By (Admin ID)
            </label>
            <input
              type="number"
              min="1"
              value={assignedBy}
              onChange={(e) => setAssignedBy(e.target.value)}
              placeholder="Enter admin ID"
              className="assign-modal__input"
            />
          </div>
          <div className="assign-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="assign-modal__btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="assign-modal__btn-submit"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? "Assigning…"
                : isReassign
                  ? "Re-assign Provider"
                  : "Assign Provider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector(
    (s) => s.adminAppointments,
  );

  const [sortStatus, setSortStatus] = useState("ALL");
  const [assignTarget, setAssignTarget] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await appointmentAPI.listAppointments({});
      const data = Array.isArray(res.data)
        ? res.data
        : (res.data.results ?? []);
      dispatch(setAppointments(data));
    } catch (err) {
      dispatch(setError(err.message || "Failed to load appointments"));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const counts = useMemo(() => {
    const c = { ALL: appointments.length };
    STATUSES.forEach((s) => {
      c[s] = appointments.filter((a) => a.status === s).length;
    });
    return c;
  }, [appointments]);

  const filtered = useMemo(() => {
    const list =
      sortStatus === "ALL"
        ? [...appointments]
        : appointments.filter((a) => a.status === sortStatus);
    return list.sort(
      (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status),
    );
  }, [appointments, sortStatus]);

  const statCards = [
    { label: "ALL", value: counts.ALL, color: STATUS_COLORS.ALL },
    ...STATUSES.map((s) => ({
      label: s,
      value: counts[s] || 0,
      color: STATUS_COLORS[s],
    })),
  ];

  if (loading && appointments.length === 0) {
    return (
      <div className="loading-center">
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div className="spinner" style={{ marginBottom: "12px" }} />
          <p>Loading appointments…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Admin Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Overview and management of all appointments
          </p>
        </div>
        <div className="admin-dashboard__header-actions">
          <button
            onClick={() => navigate("/admin/appointments")}
            className="admin-dashboard__btn-primary"
          >
            Search / Filter List
          </button>
          {/* <button
            onClick={fetchAll}
            className="admin-dashboard__btn-secondary"
          >
            Refresh
          </button> */}
        </div>
      </div>

      {error && <div className="admin-dashboard__error">{error}</div>}

      {/* Stat Cards */}
      <div className="admin-dashboard__stats">
        {statCards.map(({ label, value, color }) => {
          const isSelected = sortStatus === label;
          return (
            <div
              key={label}
              onClick={() => setSortStatus(label)}
              className="admin-dashboard__stat-card"
              style={{
                background: isSelected ? color : "#fff",
                color: isSelected ? "#fff" : "#1e2a3a",
                border: `2px solid ${color}`,
              }}
            >
              <div className="admin-dashboard__stat-val">{value}</div>
              <div className="admin-dashboard__stat-lbl">
                {label === "ALL" ? "Total" : label.replace("_", " ")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="admin-dashboard__section-header">
        <h2 className="admin-dashboard__section-title">
          {sortStatus === "ALL"
            ? "All Appointments"
            : `${sortStatus} Appointments`}
          <span className="admin-dashboard__count">({filtered.length})</span>
        </h2>
        {sortStatus !== "ALL" && (
          <button
            onClick={() => setSortStatus("ALL")}
            className="admin-dashboard__clear-filter"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="admin-dashboard__table-card">
        <div className="admin-dashboard__table-scroll">
          <table className="admin-dashboard__table">
            <thead>
              <tr>
                {[
                  "ID",
                  "Customer ID",
                  "Provider ID",
                  "Title",
                  "Status",
                  "Scheduled At",
                  "Actions",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "15px",
                    }}
                  >
                    No appointments found for this status.
                  </td>
                </tr>
              ) : (
                filtered.map((apt, idx) => (
                  <tr key={apt.id} className={idx % 2 === 1 ? "alt" : ""}>
                    <td className="admin-dashboard__id-cell">#{apt.id}</td>
                    <td>Customer #{apt.customer_id}</td>
                    <td>
                      {apt.provider_id ? (
                        `Provider #${apt.provider_id}`
                      ) : (
                        <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="admin-dashboard__title-cell">{apt.title}</td>
                    <td>
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="admin-dashboard__nowrap">
                      {apt.scheduled_at
                        ? new Date(apt.scheduled_at).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      <div className="admin-dashboard__actions-cell">
                        <button
                          onClick={() =>
                            navigate(`/admin/appointments/${apt.id}`)
                          }
                          className="admin-dashboard__btn-view"
                        >
                          View
                        </button>
                        {(apt.status === "PENDING" ||
                          apt.status === "REJECTED") && (
                          <button
                            onClick={() => setAssignTarget(apt)}
                            className="admin-dashboard__btn-assign"
                            style={{
                              background:
                                apt.status === "REJECTED"
                                  ? "#ef4444"
                                  : "#f59e0b",
                            }}
                          >
                            {apt.status === "REJECTED" ? "Re-assign" : "Assign"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {assignTarget && (
        <AssignModal
          appointment={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={fetchAll}
        />
      )}
    </div>
  );
}
