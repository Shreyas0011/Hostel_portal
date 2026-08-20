import { Router } from 'express';
import { saveMealBooking, markMealAttendance, getMessMenu, updateMessMenu, resetMessMenu } from '../controllers/mealController';

const router = Router();

// Meal Bookings
router.post('/book', saveMealBooking);
router.post('/bookings', saveMealBooking); // Alias for frontend compatibility

// Mess Attendance
router.post('/attendance', markMealAttendance);

// Mess Menu
router.get('/menu', getMessMenu);
router.post('/menu', updateMessMenu);
router.post('/menu/reset', resetMessMenu);

export default router;
