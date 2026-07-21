// src/api/wardenApi.js
import axiosInstance from './axios';

export const wardenApi = {
  getStats: async () => {
    const response = await axiosInstance.get('/warden/stats');
    return response.data;
  },
  getBeds: async () => {
    const response = await axiosInstance.get('/warden/beds');
    return response.data;
  },
  updateMealAttendance: async (studentId, date, mealKey, status) => {
    const response = await axiosInstance.post('/warden/meal-attendance', { studentId, date, mealKey, status });
    return response.data;
  }
};
