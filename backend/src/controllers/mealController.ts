import { Request, Response, NextFunction } from 'express';
import { MealBooking } from '../models/MealBooking';
import { MealAttendance } from '../models/MealAttendance';
import { MessMenu } from '../models/MessMenu';
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

    if (status === null || status === undefined || status === '') {
      (attendance as any)[mealKey] = null;
    } else {
      (attendance as any)[mealKey] = status;
    }

    await attendance.save();
    res.json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

export const getMessMenu = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const menus = await MessMenu.find().lean();
    if (menus.length === 0) {
      const defaultMenu = {
        key: 'default',
        breakfast: 'Masala Dosa, Chutney, Sambhar & Coffee',
        lunch: 'Jeera Rice, Dal Fry, Roti, Aloo Gobi & Buttermilk',
        snacks: 'Veg Samosa, Green Chutney & Tea',
        dinner: 'Veg Biryani, Raita, Paneer Butter Masala & Gulab Jamun',
      };
      res.json({ default: defaultMenu });
      return;
    }

    const menuMap: Record<string, any> = {};
    menus.forEach((m) => {
      menuMap[m.key] = {
        breakfast: m.breakfast,
        lunch: m.lunch,
        snacks: m.snacks,
        dinner: m.dinner,
      };
    });
    res.json(menuMap);
  } catch (error) {
    next(error);
  }
};

export const updateMessMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { key, menu } = req.body;
    const menuKey = key || 'default';
    if (!menu) throw new AppError('Menu object is required', 400);

    let record = await MessMenu.findOne({ key: menuKey });
    if (!record) {
      record = new MessMenu({ key: menuKey, ...menu });
    } else {
      if (menu.breakfast) record.breakfast = menu.breakfast;
      if (menu.lunch) record.lunch = menu.lunch;
      if (menu.snacks) record.snacks = menu.snacks;
      if (menu.dinner) record.dinner = menu.dinner;
    }

    await record.save();
    res.json({ success: true, key: menuKey, menu: record });
  } catch (error) {
    next(error);
  }
};

export const resetMessMenu = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await MessMenu.deleteMany({});
    res.json({ success: true, message: 'Mess menu reset to default' });
  } catch (error) {
    next(error);
  }
};
