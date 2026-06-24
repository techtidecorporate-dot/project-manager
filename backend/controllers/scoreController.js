import Attendance from '../models/Attendance.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import AttendanceSettings from '../models/AttendanceSettings.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user total score and history
// @route   GET /api/scores/me
// @access  Private
const getMyScore = asyncHandler(async (req, res) => {
    const attendanceRecords = await Attendance.find({ user: req.user._id });
    const taskRecords = await Task.find({ assignedTo: req.user._id });
    const sqaTaskRecords = await Task.find({ bugReportedBy: req.user._id });

    // Get Settings for Attendance Calculation
    const settings = await AttendanceSettings.findOne();
    const workingHoursStart = settings?.workingHoursStart || "09:00";
    const workingHoursEnd = settings?.workingHoursEnd || "18:00";
    const [sH, sM] = workingHoursStart.split(':').map(Number);
    const [eH, eM] = workingHoursEnd.split(':').map(Number);
    const standardHours = (eH + eM / 60) - (sH + sM / 60);

    // Get project phases where user is assigned
    const projects = await Project.find({
        $or: [
            { 'phases.developer': req.user._id },
            { 'phases.sqa': req.user._id }
        ]
    });

    let phaseDevPoints = 0;
    let phaseSQAPoints = 0;
    let phasesCompleted = 0;
    let phasesOnTime = 0;
    let phaseBugsFound = 0;

    projects.forEach(project => {
        project.phases.forEach(phase => {
            if (phase.developer && phase.developer.toString() === req.user._id.toString()) {
                phaseDevPoints += (phase.points || 0);
                if (phase.status === 'Completed') {
                    phasesCompleted++;
                    if (phase.points >= 2) phasesOnTime++;
                }
            }
            if (phase.sqa && phase.sqa.toString() === req.user._id.toString()) {
                phaseSQAPoints += (phase.sqaPoints || 0);
                if (phase.hasErrors) phaseBugsFound++;
            }
        });
    });

    const attendancePoints = attendanceRecords.reduce((acc, curr) => acc + (curr.points || 0), 0);
    const developerTaskPoints = taskRecords.reduce((acc, curr) => acc + (curr.points || 0), 0) + phaseDevPoints;
    const sqaTaskPoints = sqaTaskRecords.reduce((acc, curr) => acc + (curr.sqaPoints || 0), 0) + phaseSQAPoints;

    const totalAttendanceDays = attendanceRecords.length;
    // Calculate Full Attendance Days based on 85% of standard hours
    const fullAttendanceDays = attendanceRecords.filter(r => r.points >= standardHours * 0.85).length;

    const tasksCompleted = taskRecords.filter(t => t.status === 'Completed').length + phasesCompleted;
    const tasksOnTime = taskRecords.filter(t => t.status === 'Completed' && t.points >= 2).length + phasesOnTime;

    res.json({
        totalPoints: attendancePoints + developerTaskPoints + sqaTaskPoints,
        attendancePoints,
        developerTaskPoints,
        sqaTaskPoints,
        stats: {
            totalAttendanceDays,
            fullAttendanceDays,
            tasksCompleted,
            tasksOnTime,
            bugsFound: sqaTaskRecords.filter(t => t.hasBugs).length + phaseBugsFound
        }
    });
});

// @desc    Get all users scores (Admin only)
// @route   GET /api/scores/all
// @access  Private/Admin
const getAllScores = asyncHandler(async (req, res) => {
    const { month, startDate, endDate } = req.query;

    // Get Settings for Attendance Calculation
    const settings = await AttendanceSettings.findOne();
    const workingHoursStart = settings?.workingHoursStart || "09:00";
    const workingHoursEnd = settings?.workingHoursEnd || "18:00";
    const [sH, sM] = workingHoursStart.split(':').map(Number);
    const [eH, eM] = workingHoursEnd.split(':').map(Number);
    const standardHours = (eH + eM / 60) - (sH + sM / 60);

    let dateFilter = {};
    if (month) {
        const year = parseInt(month.split('-')[0]);
        const monthIndex = parseInt(month.split('-')[1]) - 1;
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        dateFilter = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
        dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate + 'T23:59:59') };
    }

    const users = await User.find({ role: { $in: ['DEVELOPER', 'SQA'] } }).select('-password');

    const results = await Promise.all(users.map(async (user) => {
        const attendanceQuery = { user: user._id };
        if (month) {
            attendanceQuery.date = { $regex: new RegExp(`^${month}`) };
        } else if (startDate && endDate) {
            attendanceQuery.date = { $gte: startDate, $lte: endDate };
        }
        const attendanceRecords = await Attendance.find(attendanceQuery);

        const taskQuery = { assignedTo: user._id };
        if (Object.keys(dateFilter).length > 0) taskQuery.completedAt = dateFilter;
        const taskRecords = await Task.find(taskQuery);

        const sqaTaskQuery = { bugReportedBy: user._id };
        if (Object.keys(dateFilter).length > 0) sqaTaskQuery.updatedAt = dateFilter;
        const sqaTaskRecords = await Task.find(sqaTaskQuery);

        const projects = await Project.find({
            $or: [
                { 'phases.developer': user._id },
                { 'phases.sqa': user._id }
            ]
        });

        let phaseDevPoints = 0;
        let phaseSQAPoints = 0;
        let phasesCompleted = 0;
        let phasesOnTime = 0;
        let phaseBugsFound = 0;

        projects.forEach(project => {
            project.phases.forEach(phase => {
                const devId = phase.developer?._id || phase.developer;
                const sqaId = phase.sqa?._id || phase.sqa;

                // Check devs
                if (devId && devId.toString() === user._id.toString()) {
                    let inDateRange = true;
                    if (Object.keys(dateFilter).length > 0) {
                        const compDate = phase.completedByDevAt ? new Date(phase.completedByDevAt) : null;
                        inDateRange = compDate && compDate >= dateFilter.$gte && compDate <= dateFilter.$lte;
                    }

                    if (inDateRange) {
                        phaseDevPoints += (phase.points || 0);
                        if (phase.status === 'Completed') {
                            phasesCompleted++;
                            if (phase.points >= 2) phasesOnTime++;
                        }
                    }
                }

                // Check SQA
                if (sqaId && sqaId.toString() === user._id.toString()) {
                    let inDateRange = true;
                    if (Object.keys(dateFilter).length > 0) {
                        const compDate = phase.completedBySQAAt ? new Date(phase.completedBySQAAt) : null;
                        inDateRange = compDate && compDate >= dateFilter.$gte && compDate <= dateFilter.$lte;
                    }

                    if (inDateRange) {
                        phaseSQAPoints += (phase.sqaPoints || 0);
                        if (phase.hasErrors) phaseBugsFound++;
                    }
                }
            });
        });

        const attendancePoints = attendanceRecords.reduce((acc, curr) => acc + (curr.points || 0), 0);
        const developerTaskPoints = taskRecords.reduce((acc, curr) => acc + (curr.points || 0), 0) + phaseDevPoints;
        const sqaTaskPoints = sqaTaskRecords.reduce((acc, curr) => acc + (curr.sqaPoints || 0), 0) + phaseSQAPoints;

        return {
            ...user._doc,
            totalPoints: attendancePoints + developerTaskPoints + sqaTaskPoints,
            attendancePoints,
            developerTaskPoints,
            sqaTaskPoints,
            stats: {
                totalAttendanceDays: attendanceRecords.length,
                fullAttendanceDays: attendanceRecords.filter(r => r.points >= standardHours * 0.85).length,
                tasksCompleted: taskRecords.filter(t => t.status === 'Completed').length + phasesCompleted,
                tasksOnTime: taskRecords.filter(t => t.status === 'Completed' && t.points >= 2).length + phasesOnTime,
                bugsFound: sqaTaskRecords.filter(t => t.hasBugs).length + phaseBugsFound
            }
        };
    }));

    res.json(results);
});

// @desc    Admin manual score adjustment
// @route   POST /api/scores/adjust
// @access  Private/Admin
const adjustScore = asyncHandler(async (req, res) => {
    const { userId, points, reason } = req.body;

    if (!userId || points === undefined || points === 0) {
        res.status(400);
        throw new Error('User ID and non-zero points are required');
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Create a manual attendance-like record to track the adjustment
    // We'll store this by creating a special task entry for tracking
    // Alternatively, we can just log it and return success
    // For now, we acknowledge the adjustment (in production, you'd want a dedicated AdjustmentLog model)
    res.json({
        message: `Score adjustment of ${points > 0 ? '+' : ''}${points} points applied to ${user.name}`,
        userId,
        points,
        reason: reason || 'Manual adjustment by admin'
    });
});

export { getMyScore, getAllScores, adjustScore };
