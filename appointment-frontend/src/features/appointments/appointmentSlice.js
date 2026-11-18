import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'customerAppointments',
  initialState,
  reducers: {
    setAppointments(state, action) {
      state.appointments = action.payload;
      state.loading = false;
      state.error = null;
    },

    setSelectedAppointment(state, action) {
      state.selectedAppointment = action.payload;
      state.loading = false;
      state.error = null;
    },

    clearSelectedAppointment(state) {
      state.selectedAppointment = null;
      state.error = null;
    },

    clearAppointments(state) {
      state.appointments = [];
      state.selectedAppointment = null;
      state.error = null;
    },

    addAppointment(state, action) {
      state.appointments.unshift(action.payload);
    },

    updateAppointmentInList(state, action) {
      const updated = action.payload;
      const index = state.appointments.findIndex((a) => a.id === updated.id);
      if (index !== -1) {
        state.appointments[index] = updated;
      }
      if (state.selectedAppointment?.id === updated.id) {
        state.selectedAppointment = updated;
      }
    },

    removeAppointment(state, action) {
      const id = action.payload;
      state.appointments = state.appointments.filter((a) => a.id !== id);
      if (state.selectedAppointment?.id === id) {
        state.selectedAppointment = null;
      }
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },

    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setAppointments,
  setSelectedAppointment,
  clearSelectedAppointment,
  clearAppointments,
  addAppointment,
  updateAppointmentInList,
  removeAppointment,
  setLoading,
  setError,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
