// src/redux/meal/mealSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mealApi } from '../../api/mealApi';
import { fetchProfileThunk } from '../student/studentSlice';
import { fetchWardDetailsThunk } from '../parent/parentSlice';
import { fetchWardenStatsThunk } from '../dashboard/dashboardSlice';

export const fetchMenuThunk = createAsyncThunk(
  'meal/fetchMenu',
  async (_, { rejectWithValue }) => {
    try {
      const data = await mealApi.getMenu();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateMenuThunk = createAsyncThunk(
  'meal/updateMenu',
  async ({ key, menu }, { rejectWithValue }) => {
    try {
      const data = await mealApi.updateMenu(key, menu);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const resetMenuThunk = createAsyncThunk(
  'meal/resetMenu',
  async (_, { rejectWithValue }) => {
    try {
      const data = await mealApi.resetMenu();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateMealBookingsThunk = createAsyncThunk(
  'meal/updateMealBookings',
  async ({ studentId, date, meals, cancellationDetails }, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await mealApi.updateMealBookings(studentId, date, meals, cancellationDetails);
      // Reload profile/ward/warden details to keep everything in sync
      const state = getState();
      const currentUser = state.auth.user;
      if (currentUser) {
        if (currentUser.role === 'Student') {
          dispatch(fetchProfileThunk(studentId));
        } else if (currentUser.role === 'Parent') {
          dispatch(fetchWardDetailsThunk(studentId));
        } else if (currentUser.role === 'Warden' || currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin') {
          dispatch(fetchWardenStatsThunk());
        }
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  menuStore: null,
  loading: false,
  error: null,
  diningDate: new Date().toISOString().split('T')[0],
  diningSearch: '',
  adminMenuDay: 0,
};

const mealSlice = createSlice({
  name: 'meal',
  initialState,
  reducers: {
    setDiningFilters: (state, action) => {
      const { search, date } = action.payload;
      if (search !== undefined) state.diningSearch = search;
      if (date !== undefined) state.diningDate = date;
    },
    setAdminMenuDay: (state, action) => {
      state.adminMenuDay = action.payload;
    },
    clearMealError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Menu
      .addCase(fetchMenuThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.menuStore = action.payload;
      })
      .addCase(fetchMenuThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Menu
      .addCase(updateMenuThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMenuThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.menuStore = action.payload;
      })
      .addCase(updateMenuThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Menu
      .addCase(resetMenuThunk.fulfilled, (state) => {
        state.menuStore = {
          default: {
            breakfast: 'Masala Dosa, Chutney, Sambhar & Coffee',
            lunch: 'Jeera Rice, Dal Fry, Roti, Aloo Gobi & Buttermilk',
            snacks: 'Veg Samosa, Green Chutney & Tea',
            dinner: 'Veg Biryani, Raita, Paneer Butter Masala & Gulab Jamun'
          }
        };
      })
      // Bookings Update
      .addCase(updateMealBookingsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMealBookingsThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateMealBookingsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setDiningFilters, setAdminMenuDay, clearMealError } = mealSlice.actions;
export default mealSlice.reducer;
