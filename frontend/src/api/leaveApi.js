// src/api/leaveApi.js
import axiosInstance from './axios';

export const leaveApi = {
  applyLeave: async (studentId, leaveData) => {
    const response = await axiosInstance.post('/leaves', { studentId, ...leaveData });
    return response.data;
  },
  cancelLeave: async (studentId, leaveId) => {
    const response = await axiosInstance.post(`/leaves/${leaveId}/cancel`, { studentId });
    return response.data;
  },
  approveLeave: async (studentId, leaveId) => {
    const response = await axiosInstance.post(`/leaves/${leaveId}/approve`, { studentId });
    return response.data;
  },
  rejectLeave: async (studentId, leaveId) => {
    const response = await axiosInstance.post(`/leaves/${leaveId}/reject`, { studentId });
    return response.data;
  }
};
