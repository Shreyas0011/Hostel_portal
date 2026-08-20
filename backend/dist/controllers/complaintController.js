"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveComplaint = exports.createComplaint = exports.getComplaints = void 0;
const HostelComplaint_1 = require("../models/HostelComplaint");
const errorHandler_1 = require("../middleware/errorHandler");
const getComplaints = async (req, res, next) => {
    try {
        const { studentId } = req.query;
        const filter = {};
        if (studentId)
            filter.studentId = studentId;
        const complaints = await HostelComplaint_1.HostelComplaint.find(filter).sort({ createdAt: -1 }).lean();
        res.json({ success: true, complaints });
    }
    catch (error) {
        next(error);
    }
};
exports.getComplaints = getComplaints;
const createComplaint = async (req, res, next) => {
    try {
        const { studentId, category, subject, details, attachments } = req.body;
        if (!studentId || !category || !subject || !details) {
            throw new errorHandler_1.AppError('Missing required complaint fields', 400);
        }
        const complaintId = `CMP-${Date.now()}`;
        const dateReported = new Date().toISOString().split('T')[0];
        const complaint = await HostelComplaint_1.HostelComplaint.create({
            complaintId,
            studentId,
            category,
            subject,
            details,
            status: 'Pending',
            dateReported,
            attachments: attachments || [],
        });
        res.status(201).json({ success: true, complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.createComplaint = createComplaint;
const resolveComplaint = async (req, res, next) => {
    try {
        const { complaintId } = req.params;
        const { responseText } = req.body;
        const complaint = await HostelComplaint_1.HostelComplaint.findOne({ complaintId });
        if (!complaint)
            throw new errorHandler_1.AppError('Complaint ticket not found', 404);
        complaint.status = 'Closed';
        complaint.response = responseText || 'Resolved by Administrator';
        await complaint.save();
        res.json({ success: true, complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.resolveComplaint = resolveComplaint;
