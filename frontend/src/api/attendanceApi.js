// src/api/attendanceApi.js
import axiosInstance from './axios';

export const attendanceApi = {
  logScan: async (studentId, type, note) => {
    const response = await axiosInstance.post('/attendance/scan', { studentId, type, note });
    return response.data;
  }
};
