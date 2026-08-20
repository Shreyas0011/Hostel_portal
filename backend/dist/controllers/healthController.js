"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthRecords = exports.deleteHealthRecord = exports.saveHealthRecord = void 0;
const HealthRecord_1 = require("../models/HealthRecord");
const errorHandler_1 = require("../middleware/errorHandler");
const saveHealthRecord = async (req, res, next) => {
    try {
        const { studentId, recordId, symptoms, temperature, status, note } = req.body;
        if (!studentId || !symptoms) {
            throw new errorHandler_1.AppError('Missing studentId or symptoms', 400);
        }
        let record;
        if (recordId) {
            record = await HealthRecord_1.HealthRecord.findOne({ recordId });
            if (record) {
                record.symptoms = symptoms;
                record.temperature = temperature || record.temperature;
                record.status = status || record.status;
                record.note = note || record.note;
                await record.save();
            }
        }
        if (!record) {
            const d = new Date();
            const newRecordId = recordId || `HR-${Date.now()}`;
            record = await HealthRecord_1.HealthRecord.create({
                recordId: newRecordId,
                studentId,
                date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                symptoms,
                temperature: temperature || '98.6 °F',
                status: status || 'Under Observation',
                note: note || '',
            });
        }
        res.status(201).json({ success: true, healthRecord: record });
    }
    catch (error) {
        next(error);
    }
};
exports.saveHealthRecord = saveHealthRecord;
const deleteHealthRecord = async (req, res, next) => {
    try {
        const { recordId } = req.params;
        await HealthRecord_1.HealthRecord.deleteOne({ recordId });
        res.json({ success: true, message: 'Health record deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteHealthRecord = deleteHealthRecord;
const getHealthRecords = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const records = await HealthRecord_1.HealthRecord.find({ studentId }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, records });
    }
    catch (error) {
        next(error);
    }
};
exports.getHealthRecords = getHealthRecords;
