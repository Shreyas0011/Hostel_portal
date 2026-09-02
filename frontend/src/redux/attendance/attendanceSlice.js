// src/redux/attendance/attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceApi } from '../../api/attendanceApi';
import { fetchDirectoryThunk } from '../student/studentSlice';
import { fetchWardDetailsThunk } from '../parent/parentSlice';

export const logScanThunk = createAsyncThunk(
  'attendance/logScan',
  async ({ studentId, type, note }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await attendanceApi.logScan(studentId, type, note);
      dispatch(fetchDirectoryThunk());
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
  viewAttendanceStudentId: null, // resolved dynamically from directory[0] in consumer components
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setViewAttendanceStudentId: (state, action) => {
      state.viewAttendanceStudentId = action.payload;
    },
    clearAttendanceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logScanThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logScanThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(logScanThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setViewAttendanceStudentId, clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
