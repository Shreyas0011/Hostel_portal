"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mealController_1 = require("../controllers/mealController");
const router = (0, express_1.Router)();
// Meal Bookings
router.post('/book', mealController_1.saveMealBooking);
router.post('/bookings', mealController_1.saveMealBooking); // Alias for frontend compatibility
// Mess Attendance
router.post('/attendance', mealController_1.markMealAttendance);
// Mess Menu
router.get('/menu', mealController_1.getMessMenu);
router.post('/menu', mealController_1.updateMessMenu);
router.post('/menu/reset', mealController_1.resetMessMenu);
exports.default = router;
