// src/redux/behaviour/behaviourSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { behaviourApi } from '../../api/behaviourApi';
import { fetchDirectoryThunk } from '../student/studentSlice';
import { fetchWardDetailsThunk } from '../parent/parentSlice';

export const updateBehaviourThunk = createAsyncThunk(
  'behaviour/updateLog',
  async ({ studentId, logData, actionType }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await behaviourApi.updateLog(studentId, logData, actionType);
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
  behaviourSearch: '',
  behaviourCategoryFilter: 'all',
  behaviourSeverityFilter: 'all',
  loading: false,
  error: null,
};

const behaviourSlice = createSlice({
  name: 'behaviour',
  initialState,
  reducers: {
    setBehaviourFilters: (state, action) => {
      const { search, categoryFilter, severityFilter } = action.payload;
      if (search !== undefined) state.behaviourSearch = search;
      if (categoryFilter !== undefined) state.behaviourCategoryFilter = categoryFilter;
      if (severityFilter !== undefined) state.behaviourSeverityFilter = severityFilter;
    },
    clearBehaviourError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateBehaviourThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBehaviourThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateBehaviourThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setBehaviourFilters, clearBehaviourError } = behaviourSlice.actions;
export default behaviourSlice.reducer;
