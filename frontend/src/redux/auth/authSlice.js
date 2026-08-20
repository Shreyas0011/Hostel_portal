// src/redux/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authApi.login(email, password);
      const token = data.accessToken || data.token;
      localStorage.setItem('hostel_portal_token', token);
      return { ...data, accessToken: token };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(errMsg);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      localStorage.removeItem('hostel_portal_token');
      return true;
    } catch (err) {
      localStorage.removeItem('hostel_portal_token');
      return rejectWithValue(err.message || 'Logout failed');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    restoreSession: (state) => {
      // Session restoration from token if required, but Redux Persist handles persistence automatically.
      const token = localStorage.getItem('hostel_portal_token');
      if (token && state.user) {
        state.token = token;
        state.isAuthenticated = true;
      } else if (!token) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login Thunk
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout Thunk
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, restoreSession } = authSlice.actions;
export default authSlice.reducer;
