import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = 'An unexpected error occurred';

    if (typeof data === 'string') {
      message = data;
    } else if (data?.error) {
      message = data.error;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.message) {
      message = data.message;
    } else if (data && typeof data === 'object') {
      const entries = Object.entries(data);
      if (entries.length > 0) {
        const [field, val] = entries[0];
        const valStr = Array.isArray(val) ? val.join(' ') : String(val);
        message = `${field}: ${valStr}`;
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export const appointmentAPI = {
  createAppointment(data) {
    return axiosInstance.post('/appointments/', data);
  },

  getAppointment(id) {
    return axiosInstance.get(`/appointments/${id}/`);
  },

  listAppointments(params = {}) {
    return axiosInstance.get('/appointments/list/', { params });
  },

  updateAppointment(id, data) {
    return axiosInstance.patch(`/appointments/${id}/update/`, data);
  },

  assignProvider(id, data) {
    return axiosInstance.post(`/appointments/${id}/assign/`, data);
  },

  acceptAppointment(id, data) {
    return axiosInstance.post(`/appointments/${id}/accept/`, data);
  },

  rejectAppointment(id, data) {
    return axiosInstance.post(`/appointments/${id}/reject/`, data);
  },

  startAppointment(id, data) {
    return axiosInstance.post(`/appointments/${id}/start/`, data);
  },

  completeAppointment(id, data) {
    return axiosInstance.post(`/appointments/${id}/complete/`, data);
  },

  cancelAppointment(id, data) {
    return axiosInstance.post(`/appointments/${id}/cancel/`, data);
  },

  rescheduleAppointment(id, data) {
    return axiosInstance.post(`/appointments/${id}/reschedule/`, data);
  },

  updateAppointmentStatus(id, data) {
    return axiosInstance.patch(`/appointments/${id}/status/`, data);
  },
};

export default axiosInstance;
