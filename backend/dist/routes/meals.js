"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mealController_1 = require("../controllers/mealController");
const router = (0, express_1.Router)();
router.post('/book', mealController_1.saveMealBooking);
router.post('/attendance', mealController_1.markMealAttendance);
exports.default = router;
