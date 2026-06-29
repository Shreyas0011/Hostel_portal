// src/api/healthApi.js
import axiosInstance from './axios';

export const healthApi = {
  saveRecord: async (studentId, recordData) => {
    const response = await axiosInstance.post('/health', { studentId, ...recordData });
    return response.data;
  },
  deleteRecord: async (studentId, recordId) => {
    const response = await axiosInstance.delete(`/health/${recordId}`, {
      params: { studentId }
    });
    return response.data;
  }
};
