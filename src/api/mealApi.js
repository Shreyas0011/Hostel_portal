// src/api/mealApi.js
import axiosInstance from './axios';

export const mealApi = {
  getMenu: async () => {
    const response = await axiosInstance.get('/meals/menu');
    return response.data;
  },
  updateMenu: async (key, menu) => {
    const response = await axiosInstance.post('/meals/menu', { key, menu });
    return response.data;
  },
  resetMenu: async () => {
    const response = await axiosInstance.post('/meals/menu/reset');
    return response.data;
  },
  updateMealBookings: async (studentId, date, meals, cancellationDetails = null) => {
    const response = await axiosInstance.post('/meals/bookings', {
      studentId,
      date,
      meals,
      cancellationDetails
    });
    return response.data;
  }
};
