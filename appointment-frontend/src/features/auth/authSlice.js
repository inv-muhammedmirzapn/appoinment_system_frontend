import { createSlice } from '@reduxjs/toolkit';

const getStoredInt = (key, fallback) => {
  const val = localStorage.getItem(key);
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const initialState = {
  customerId: getStoredInt('customerId', 1),
  adminId: getStoredInt('adminId', 1),
  providerId: getStoredInt('providerId', 11),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCustomerId(state, action) {
      const val = parseInt(action.payload, 10);
      state.customerId = Number.isNaN(val) ? action.payload : val;
      localStorage.setItem('customerId', String(action.payload));
    },
    setAdminId(state, action) {
      const val = parseInt(action.payload, 10);
      state.adminId = Number.isNaN(val) ? action.payload : val;
      localStorage.setItem('adminId', String(action.payload));
    },
    setProviderId(state, action) {
      const val = parseInt(action.payload, 10);
      state.providerId = Number.isNaN(val) ? action.payload : val;
      localStorage.setItem('providerId', String(action.payload));
    },
  },
});

export const { setCustomerId, setAdminId, setProviderId } = authSlice.actions;
export default authSlice.reducer;
