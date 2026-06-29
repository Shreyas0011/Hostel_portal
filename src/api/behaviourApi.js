// src/api/behaviourApi.js
import axiosInstance from './axios';

export const behaviourApi = {
  updateLog: async (studentId, logData, actionType) => {
    const response = await axiosInstance.post('/behaviour', { studentId, logData, actionType });
    return response.data;
  }
};
