import { configureStore } from '@reduxjs/toolkit';
import customerAppointmentsReducer from '../features/appointments/appointmentSlice';
import adminAppointmentsReducer from '../features/appointments/adminAppointmentSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    customerAppointments: customerAppointmentsReducer,
    adminAppointments: adminAppointmentsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
});

export default store;
