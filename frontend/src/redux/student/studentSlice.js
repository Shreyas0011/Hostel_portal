// src/redux/student/studentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentApi } from '../../api/studentApi';
import { wardenApi } from '../../api/wardenApi';

export const fetchProfileThunk = createAsyncThunk(
  'student/fetchProfile',
  async (studentId, { rejectWithValue }) => {
    try {
      const data = await studentApi.getProfile(studentId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchDirectoryThunk = createAsyncThunk(
  'student/fetchDirectory',
  async (_, { rejectWithValue }) => {
    try {
      const data = await studentApi.getDirectory();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const registerStudentThunk = createAsyncThunk(
  'student/registerStudent',
  async (studentData, { dispatch, rejectWithValue }) => {
    try {
      const data = await studentApi.register(studentData);
      dispatch(fetchDirectoryThunk());
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateMealAttendanceThunk = createAsyncThunk(
  'student/updateMealAttendance',
  async ({ studentId, date, mealKey, status }, { dispatch, rejectWithValue }) => {
    try {
      const data = await wardenApi.updateMealAttendance(studentId, date, mealKey, status);
      // Await the re-fetch sequentially so Redux always gets persisted data
      await dispatch(fetchDirectoryThunk());
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  profile: null,
  directory: [],
  loading: false,
  error: null,
  // Filters & Pagination for Directory
  directorySearch: '',
  directoryBlockFilter: 'all',
  directoryPage: 1,
  directoryPageSize: 5,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setDirectoryFilters: (state, action) => {
      const { search, blockFilter, page } = action.payload;
      if (search !== undefined) state.directorySearch = search;
      if (blockFilter !== undefined) state.directoryBlockFilter = blockFilter;
      if (page !== undefined) state.directoryPage = page;
    },
    resetDirectoryFilters: (state) => {
      state.directorySearch = '';
      state.directoryBlockFilter = 'all';
      state.directoryPage = 1;
    },
    clearStudentError: (state) => {
      state.error = null;
    },
    // Optimistic local update — applied instantly on click before API responds
    optimisticSetAttendance: (state, action) => {
      const { studentId, date, mealKey, status } = action.payload;
      const student = state.directory.find(s => s.id === studentId);
      if (student) {
        if (!student.mealAttendance) student.mealAttendance = [];
        let entry = student.mealAttendance.find(a => a.date === date);
        if (entry) {
          if (!status) delete entry[mealKey];
          else entry[mealKey] = status;
        } else if (status) {
          student.mealAttendance.push({ date, [mealKey]: status });
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Directory
      .addCase(fetchDirectoryThunk.pending, (state) => {
        // Do not set loading=true here to avoid UI flicker during background re-fetches
        state.error = null;
      })
      .addCase(fetchDirectoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.directory = action.payload;
      })
      .addCase(fetchDirectoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register Student
      .addCase(registerStudentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerStudentThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerStudentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDirectoryFilters,
  resetDirectoryFilters,
  clearStudentError,
  optimisticSetAttendance,
} = studentSlice.actions;

export default studentSlice.reducer;
