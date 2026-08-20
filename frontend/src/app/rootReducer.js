import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlice';
import studentReducer from '../redux/student/studentSlice';
import parentReducer from '../redux/parent/parentSlice';
import mealReducer from '../redux/meal/mealSlice';
import complaintReducer from '../redux/complaint/complaintSlice';
import healthReducer from '../redux/health/healthSlice';
import behaviourReducer from '../redux/behaviour/behaviourSlice';
import notificationReducer from '../redux/notification/notificationSlice';
import dashboardReducer from '../redux/dashboard/dashboardSlice';
import leaveReducer from '../redux/leave/leaveSlice';
import attendanceReducer from '../redux/attendance/attendanceSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  student: studentReducer,
  parent: parentReducer,
  meal: mealReducer,
  complaint: complaintReducer,
  health: healthReducer,
  behaviour: behaviourReducer,
  notification: notificationReducer,
  dashboard: dashboardReducer,
  leave: leaveReducer,
  attendance: attendanceReducer,
});

export default rootReducer;
