// src/redux/leave/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaveApi } from '../../api/leaveApi';
import { fetchProfileThunk, fetchDirectoryThunk } from '../student/studentSlice';
import { fetchWardDetailsThunk } from '../parent/parentSlice';
import { fetchWardenStatsThunk } from '../dashboard/dashboardSlice';

export const applyLeaveThunk = createAsyncThunk(
  'leave/applyLeave',
  async ({ studentId, leaveData }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await leaveApi.applyLeave(studentId, leaveData);
      const state = getState();
      const currentUser = state.auth.user;
      if (currentUser) {
        if (currentUser.role === 'Student') {
          dispatch(fetchProfileThunk(studentId));
        } else if (currentUser.role === 'Parent') {
          dispatch(fetchWardDetailsThunk(studentId));
        } else {
          dispatch(fetchDirectoryThunk());
          dispatch(fetchWardenStatsThunk());
        }
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const cancelLeaveThunk = createAsyncThunk(
  'leave/cancelLeave',
  async ({ studentId, leaveId }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await leaveApi.cancelLeave(studentId, leaveId);
      const state = getState();
      const currentUser = state.auth.user;
      if (currentUser) {
        if (currentUser.role === 'Student') {
          dispatch(fetchProfileThunk(studentId));
        } else if (currentUser.role === 'Parent') {
          dispatch(fetchWardDetailsThunk(studentId));
        } else {
          dispatch(fetchDirectoryThunk());
          dispatch(fetchWardenStatsThunk());
        }
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const approveLeaveThunk = createAsyncThunk(
  'leave/approveLeave',
  async ({ studentId, leaveId }, { dispatch, getState, rejectWithValue }) => {
    try {
      console.log("approveLeaveThunk executing:", { studentId, leaveId });
      const data = await leaveApi.approveLeave(studentId, leaveId);
      console.log("approveLeaveThunk API call returned:", data);
      dispatch(fetchDirectoryThunk());
      dispatch(fetchWardenStatsThunk());
      // If we are currently looking at student details modal, re-trigger fetch
      const state = getState();
      const wardId = state.parent.ward?.id;
      if (wardId === studentId) {
        dispatch(fetchWardDetailsThunk(studentId));
      }
      return data;
    } catch (err) {
      console.error("approveLeaveThunk failed:", err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const rejectLeaveThunk = createAsyncThunk(
  'leave/rejectLeave',
  async ({ studentId, leaveId }, { dispatch, getState, rejectWithValue }) => {
    try {
      console.log("rejectLeaveThunk executing:", { studentId, leaveId });
      const data = await leaveApi.rejectLeave(studentId, leaveId);
      console.log("rejectLeaveThunk API call returned:", data);
      dispatch(fetchDirectoryThunk());
      dispatch(fetchWardenStatsThunk());
      const state = getState();
      const wardId = state.parent.ward?.id;
      if (wardId === studentId) {
        dispatch(fetchWardDetailsThunk(studentId));
      }
      return data;
    } catch (err) {
      console.error("rejectLeaveThunk failed:", err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const today = new Date();
const initialState = {
  loading: false,
  error: null,
  calendarMonth: today.getMonth(),
  calendarYear: today.getFullYear(),
  calendarSelectedDate: today.toISOString().split('T')[0],
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setCalendarMonth: (state, action) => {
      state.calendarMonth = action.payload;
    },
    setCalendarYear: (state, action) => {
      state.calendarYear = action.payload;
    },
    setCalendarSelectedDate: (state, action) => {
      state.calendarSelectedDate = action.payload;
    },
    clearLeaveError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('leave/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('leave/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('leave/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { setCalendarMonth, setCalendarYear, setCalendarSelectedDate, clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
