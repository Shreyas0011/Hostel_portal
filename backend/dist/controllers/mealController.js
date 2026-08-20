"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetMessMenu = exports.updateMessMenu = exports.getMessMenu = exports.markMealAttendance = exports.saveMealBooking = void 0;
const MealBooking_1 = require("../models/MealBooking");
const MealAttendance_1 = require("../models/MealAttendance");
const MessMenu_1 = require("../models/MessMenu");
const errorHandler_1 = require("../middleware/errorHandler");
const saveMealBooking = async (req, res, next) => {
    try {
        const { studentId, date, meals, cancellationDetails } = req.body;
        if (!studentId || !date || !meals) {
            throw new errorHandler_1.AppError('Missing studentId, date, or meals object', 400);
        }
        let booking = await MealBooking_1.MealBooking.findOne({ studentId, date });
        if (booking) {
            booking.breakfast = !!meals.breakfast;
            booking.lunch = !!meals.lunch;
            booking.snacks = !!meals.snacks;
            booking.dinner = !!meals.dinner;
        }
        else {
            booking = new MealBooking_1.MealBooking({
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
            if (!booking.cancellations)
                booking.cancellations = [];
            booking.cancellations.push({
                id: `CAN-${Date.now()}`,
                meal: cancellationDetails.meal,
                reason: cancellationDetails.reason,
                timestamp: new Date(),
            });
        }
        await booking.save();
        res.json({ success: true, booking });
    }
    catch (error) {
        next(error);
    }
};
exports.saveMealBooking = saveMealBooking;
const markMealAttendance = async (req, res, next) => {
    try {
        const { studentId, date, mealKey, status } = req.body;
        if (!studentId || !date || !mealKey) {
            throw new errorHandler_1.AppError('Missing required parameters for meal attendance', 400);
        }
        let attendance = await MealAttendance_1.MealAttendance.findOne({ studentId, date });
        if (!attendance) {
            attendance = new MealAttendance_1.MealAttendance({ studentId, date });
        }
        if (status === null || status === undefined || status === '') {
            attendance[mealKey] = null;
        }
        else {
            attendance[mealKey] = status;
        }
        await attendance.save();
        res.json({ success: true, attendance });
    }
    catch (error) {
        next(error);
    }
};
exports.markMealAttendance = markMealAttendance;
const getMessMenu = async (_req, res, next) => {
    try {
        const menus = await MessMenu_1.MessMenu.find().lean();
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
        const menuMap = {};
        menus.forEach((m) => {
            menuMap[m.key] = {
                breakfast: m.breakfast,
                lunch: m.lunch,
                snacks: m.snacks,
                dinner: m.dinner,
            };
        });
        res.json(menuMap);
    }
    catch (error) {
        next(error);
    }
};
exports.getMessMenu = getMessMenu;
const updateMessMenu = async (req, res, next) => {
    try {
        const { key, menu } = req.body;
        const menuKey = key || 'default';
        if (!menu)
            throw new errorHandler_1.AppError('Menu object is required', 400);
        let record = await MessMenu_1.MessMenu.findOne({ key: menuKey });
        if (!record) {
            record = new MessMenu_1.MessMenu({ key: menuKey, ...menu });
        }
        else {
            if (menu.breakfast)
                record.breakfast = menu.breakfast;
            if (menu.lunch)
                record.lunch = menu.lunch;
            if (menu.snacks)
                record.snacks = menu.snacks;
            if (menu.dinner)
                record.dinner = menu.dinner;
        }
        await record.save();
        res.json({ success: true, key: menuKey, menu: record });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMessMenu = updateMessMenu;
const resetMessMenu = async (_req, res, next) => {
    try {
        await MessMenu_1.MessMenu.deleteMany({});
        res.json({ success: true, message: 'Mess menu reset to default' });
    }
    catch (error) {
        next(error);
    }
};
exports.resetMessMenu = resetMessMenu;
