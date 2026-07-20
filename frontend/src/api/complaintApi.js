// src/api/complaintApi.js
import axiosInstance from './axios';

export const complaintApi = {
  reportComplaint: async (studentId, complaintData) => {
    const response = await axiosInstance.post('/complaints', { studentId, ...complaintData });
    return response.data;
  },
  resolveComplaint: async (studentId, complaintId, responseText) => {
    const response = await axiosInstance.post(`/complaints/${complaintId}/resolve`, { studentId, responseText });
    return response.data;
  }
};
