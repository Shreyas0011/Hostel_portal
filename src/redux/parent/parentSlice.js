// src/redux/parent/parentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { parentApi } from '../../api/parentApi';

export const fetchWardDetailsThunk = createAsyncThunk(
  'parent/fetchWardDetails',
  async (studentId, { rejectWithValue }) => {
    try {
      const data = await parentApi.getWardDetails(studentId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  ward: null,
  loading: false,
  error: null,
};

const parentSlice = createSlice({
  name: 'parent',
  initialState,
  reducers: {
    clearParentError: (state) => {
      state.error = null;
    },
    clearParentState: (state) => {
      state.ward = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWardDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWardDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ward = action.payload;
      })
      .addCase(fetchWardDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearParentError, clearParentState } = parentSlice.actions;
export default parentSlice.reducer;
