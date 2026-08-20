"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMealAttendance = exports.saveMealBooking = void 0;
const MealBooking_1 = require("../models/MealBooking");
const MealAttendance_1 = require("../models/MealAttendance");
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
        attendance[mealKey] = status;
        await attendance.save();
        res.json({ success: true, attendance });
    }
    catch (error) {
        next(error);
    }
};
exports.markMealAttendance = markMealAttendance;
