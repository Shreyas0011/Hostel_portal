import { Request, Response, NextFunction } from 'express';
import { MealBooking } from '../models/MealBooking';
import { MealAttendance } from '../models/MealAttendance';
import { AppError } from '../middleware/errorHandler';

export const saveMealBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, date, meals, cancellationDetails } = req.body;
    if (!studentId || !date || !meals) {
      throw new AppError('Missing studentId, date, or meals object', 400);
    }

    let booking = await MealBooking.findOne({ studentId, date });
    if (booking) {
      booking.breakfast = !!meals.breakfast;
      booking.lunch = !!meals.lunch;
      booking.snacks = !!meals.snacks;
      booking.dinner = !!meals.dinner;
    } else {
      booking = new MealBooking({
        studentId,
        date,
        breakfast: !!meals.breakfast,
        lunch: !!meals.lunch,
        snacks: !!meals.snacks,
        dinner: !!meals.dinner,
        cancellations: [],
      });
    }

    if (cancellationDetails) {
      if (!booking.cancellations) booking.cancellations = [];
      booking.cancellations.push({
        id: `CAN-${Date.now()}`,
        meal: cancellationDetails.meal,
        reason: cancellationDetails.reason,
        timestamp: new Date(),
      });
    }

    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const markMealAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, date, mealKey, status } = req.body;
    if (!studentId || !date || !mealKey) {
      throw new AppError('Missing required parameters for meal attendance', 400);
    }

    let attendance = await MealAttendance.findOne({ studentId, date });
    if (!attendance) {
      attendance = new MealAttendance({ studentId, date });
    }

    (attendance as any)[mealKey] = status;
    await attendance.save();

    res.json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};
