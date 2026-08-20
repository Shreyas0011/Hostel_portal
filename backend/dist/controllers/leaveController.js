"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaves = exports.rejectLeave = exports.approveLeave = exports.cancelLeave = exports.applyLeave = void 0;
const HostelLeave_1 = require("../models/HostelLeave");
const errorHandler_1 = require("../middleware/errorHandler");
const applyLeave = async (req, res, next) => {
    try {
        const { studentId, startDate, endDate, reason, type, submittedBy, startTime, endTime, isOvernight } = req.body;
        if (!studentId || !startDate || !endDate || !reason || !type) {
            throw new errorHandler_1.AppError('Missing required leave request parameters', 400);
        }
        const leaveId = `LV-${Date.now()}`;
        const newLeave = await HostelLeave_1.HostelLeave.create({
            leaveId,
            studentId,
            startDate,
            endDate,
            startTime,
            endTime,
            type,
            reason,
            submittedBy: submittedBy || 'student',
            status: submittedBy === 'parent' ? 'approved' : 'pending',
            isOvernight: !!isOvernight,
        });
        res.status(201).json({ success: true, leave: newLeave });
    }
    catch (error) {
        next(error);
    }
};
exports.applyLeave = applyLeave;
const cancelLeave = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const leave = await HostelLeave_1.HostelLeave.findOne({ leaveId });
        if (!leave)
            throw new errorHandler_1.AppError('Leave request not found', 404);
        leave.status = 'cancelled';
        await leave.save();
        res.json({ success: true, message: 'Leave request cancelled', leave });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelLeave = cancelLeave;
const approveLeave = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const leave = await HostelLeave_1.HostelLeave.findOne({ leaveId });
        if (!leave)
            throw new errorHandler_1.AppError('Leave request not found', 404);
        leave.status = 'approved';
        await leave.save();
        res.json({ success: true, message: 'Leave request approved', leave });
    }
    catch (error) {
        next(error);
    }
};
exports.approveLeave = approveLeave;
const rejectLeave = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const leave = await HostelLeave_1.HostelLeave.findOne({ leaveId });
        if (!leave)
            throw new errorHandler_1.AppError('Leave request not found', 404);
        leave.status = 'rejected';
        await leave.save();
        res.json({ success: true, message: 'Leave request rejected', leave });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectLeave = rejectLeave;
const getLeaves = async (req, res, next) => {
    try {
        const { studentId } = req.query;
        const filter = {};
        if (studentId)
            filter.studentId = studentId;
        const leaves = await HostelLeave_1.HostelLeave.find(filter).sort({ createdAt: -1 }).lean();
        res.json({ success: true, leaves });
    }
    catch (error) {
        next(error);
    }
};
exports.getLeaves = getLeaves;
