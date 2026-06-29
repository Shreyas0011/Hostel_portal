// src/api/studentApi.js
import axiosInstance from './axios';

export const studentApi = {
  getProfile: async (studentId) => {
    const response = await axiosInstance.get(`/students/${studentId}`);
    return response.data;
  },
  getDirectory: async () => {
    const response = await axiosInstance.get('/students');
    return response.data;
  },
  register: async (studentData) => {
    const response = await axiosInstance.post('/students', studentData);
    return response.data;
  }
};
