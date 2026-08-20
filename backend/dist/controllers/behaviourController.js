"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBehaviourLog = void 0;
const BehaviourLog_1 = require("../models/BehaviourLog");
const errorHandler_1 = require("../middleware/errorHandler");
const updateBehaviourLog = async (req, res, next) => {
    try {
        const { studentId, logData, actionType } = req.body;
        if (!studentId || !actionType) {
            throw new errorHandler_1.AppError('Missing studentId or actionType', 400);
        }
        if (actionType === 'add') {
            const logId = `OB-${studentId}-${Date.now()}`;
            const newLog = await BehaviourLog_1.BehaviourLog.create({
                logId,
                studentId,
                date: logData.date || new Date().toISOString().split('T')[0],
                category: logData.category || 'General',
                severity: logData.severity || 'neutral',
                description: logData.description || '',
                recordedBy: logData.recordedBy || 'System',
            });
            res.status(201).json({ success: true, log: newLog });
            return;
        }
        if (actionType === 'edit') {
            const log = await BehaviourLog_1.BehaviourLog.findOne({ logId: logData.id });
            if (!log)
                throw new errorHandler_1.AppError('Behaviour log entry not found', 404);
            if (logData.category)
                log.category = logData.category;
            if (logData.severity)
                log.severity = logData.severity;
            if (logData.description)
                log.description = logData.description;
            if (logData.date)
                log.date = logData.date;
            await log.save();
            res.json({ success: true, log });
            return;
        }
        if (actionType === 'delete') {
            await BehaviourLog_1.BehaviourLog.deleteOne({ logId: logData.id });
            res.json({ success: true, message: 'Behaviour log deleted' });
            return;
        }
        throw new errorHandler_1.AppError('Invalid actionType', 400);
    }
    catch (error) {
        next(error);
    }
};
exports.updateBehaviourLog = updateBehaviourLog;
