// src/redux/complaint/complaintSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi } from '../../api/complaintApi';
import { fetchProfileThunk, fetchDirectoryThunk } from '../student/studentSlice';
import { fetchWardDetailsThunk } from '../parent/parentSlice';
import { fetchWardenStatsThunk } from '../dashboard/dashboardSlice';

export const reportComplaintThunk = createAsyncThunk(
  'complaint/reportComplaint',
  async ({ studentId, complaintData }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await complaintApi.reportComplaint(studentId, complaintData);
      const state = getState();
      const currentUser = state.auth.user;
      if (currentUser) {
        if (currentUser.role === 'Student') {
          dispatch(fetchProfileThunk(studentId));
        } else if (currentUser.role === 'Parent') {
          dispatch(fetchWardDetailsThunk(studentId));
        }
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const resolveComplaintThunk = createAsyncThunk(
  'complaint/resolveComplaint',
  async ({ studentId, complaintId, responseText }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await complaintApi.resolveComplaint(studentId, complaintId, responseText);
      dispatch(fetchDirectoryThunk());
      dispatch(fetchWardenStatsThunk());
      const state = getState();
      const wardId = state.parent.ward?.id;
      if (wardId === studentId) {
        dispatch(fetchWardDetailsThunk(studentId));
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    clearComplaintError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('complaint/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('complaint/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('complaint/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearComplaintError } = complaintSlice.actions;
export default complaintSlice.reducer;
