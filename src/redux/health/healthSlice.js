// src/redux/health/healthSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { healthApi } from '../../api/healthApi';
import { fetchDirectoryThunk } from '../student/studentSlice';
import { fetchWardDetailsThunk } from '../parent/parentSlice';

export const saveHealthRecordThunk = createAsyncThunk(
  'health/saveRecord',
  async ({ studentId, recordData }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await healthApi.saveRecord(studentId, recordData);
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

export const deleteHealthRecordThunk = createAsyncThunk(
  'health/deleteRecord',
  async ({ studentId, recordId }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await healthApi.deleteRecord(studentId, recordId);
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
  viewHealthStudentId: 'STU001', // Default student to show in logs
  loading: false,
  error: null,
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    setViewHealthStudentId: (state, action) => {
      state.viewHealthStudentId = action.payload;
    },
    clearHealthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('health/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('health/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('health/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { setViewHealthStudentId, clearHealthError } = healthSlice.actions;
export default healthSlice.reducer;
