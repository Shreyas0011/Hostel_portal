import { Router } from 'express';
import { saveMealBooking, markMealAttendance } from '../controllers/mealController';

const router = Router();

router.post('/book', saveMealBooking);
router.post('/attendance', markMealAttendance);

export default router;
