// src/api/parentApi.js
import axiosInstance from './axios';

export const parentApi = {
  getWardDetails: async (studentId) => {
    const response = await axiosInstance.get(`/parents/ward/${studentId}`);
    return response.data;
  }
};
