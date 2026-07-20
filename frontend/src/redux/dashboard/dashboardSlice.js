// src/redux/dashboard/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wardenApi } from '../../api/wardenApi';
import axiosInstance from '../../api/axios';
import { fetchDirectoryThunk } from '../student/studentSlice';

export const fetchWardenStatsThunk = createAsyncThunk(
  'dashboard/fetchWardenStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await wardenApi.getStats();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchWardenBedsThunk = createAsyncThunk(
  'dashboard/fetchWardenBeds',
  async (_, { rejectWithValue }) => {
    try {
      const data = await wardenApi.getBeds();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const resetDatabaseThunk = createAsyncThunk(
  'dashboard/resetDatabase',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/database/reset');
      dispatch(fetchDirectoryThunk());
      dispatch(fetchWardenStatsThunk());
      dispatch(fetchWardenBedsThunk());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const reseedMealsThunk = createAsyncThunk(
  'dashboard/reseedMeals',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/database/reseed-meals');
      dispatch(fetchDirectoryThunk());
      dispatch(fetchWardenStatsThunk());
      dispatch(fetchWardenBedsThunk());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  stats: null,
  beds: [],
  studentActiveTab: 'meals',
  parentActiveTab: 'meals',
  wardenActiveTab: 'dining',
  adminActiveTab: 'menu',
  superActiveTab: 'dashboard',
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStudentTab: (state, action) => { state.studentActiveTab = action.payload; },
    setParentTab: (state, action) => { state.parentActiveTab = action.payload; },
    setWardenTab: (state, action) => { state.wardenActiveTab = action.payload; },
    setAdminTab: (state, action) => { state.adminActiveTab = action.payload; },
    setSuperTab: (state, action) => { state.superActiveTab = action.payload; },
    clearDashboardError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchWardenStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWardenStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchWardenStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Beds
      .addCase(fetchWardenBedsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWardenBedsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.beds = action.payload;
      })
      .addCase(fetchWardenBedsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Operations
      .addCase(resetDatabaseThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetDatabaseThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetDatabaseThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setStudentTab,
  setParentTab,
  setWardenTab,
  setAdminTab,
  setSuperTab,
  clearDashboardError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
