"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const router = (0, express_1.Router)();
router.post('/scan', attendanceController_1.logScan);
router.get('/logs/:studentId', attendanceController_1.getGateLogs);
exports.default = router;
