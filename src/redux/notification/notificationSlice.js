// src/redux/notification/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: []
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const { message, type = 'info', id = Date.now() } = action.payload;
      state.toasts.push({ id, message, type });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    }
  }
});

export const { addToast, removeToast, clearToasts } = notificationSlice.actions;
export default notificationSlice.reducer;
