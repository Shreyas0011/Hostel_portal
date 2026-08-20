"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGateLogs = exports.logScan = void 0;
const GateLog_1 = require("../models/GateLog");
const errorHandler_1 = require("../middleware/errorHandler");
const logScan = async (req, res, next) => {
    try {
        const { studentId, type, note } = req.body;
        if (!studentId || !type) {
            throw new errorHandler_1.AppError('Missing studentId or scan type', 400);
        }
        const logId = `LOG-${studentId}-${Date.now()}`;
        const log = await GateLog_1.GateLog.create({
            logId,
            studentId,
            type,
            timestamp: new Date(),
            note: note || (type === 'entry' ? 'Hostel entry' : 'Hostel exit'),
        });
        res.status(201).json({ success: true, log });
    }
    catch (error) {
        next(error);
    }
};
exports.logScan = logScan;
const getGateLogs = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const logs = await GateLog_1.GateLog.find({ studentId }).sort({ timestamp: -1 }).lean();
        res.json({ success: true, logs });
    }
    catch (error) {
        next(error);
    }
};
exports.getGateLogs = getGateLogs;
