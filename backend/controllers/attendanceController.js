import Attendance from '../models/Attendance.js';
import AttendanceSettings from '../models/AttendanceSettings.js';
import asyncHandler from 'express-async-handler';

// @desc    Clock in
// @route   POST /api/attendance/clock-in
// @access  Private
const clockIn = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    let attendance = await Attendance.findOne({ user: req.user._id, date: today });

    if (attendance && (attendance.clockIn || attendance.clockOut)) {
        res.status(400);
        throw new Error('Already clocked in or attended today');
    }

    if (!attendance) {
        attendance = new Attendance({
            user: req.user._id,
            date: today,
            clockIn: new Date(),
            status: 'Clocked In',
        });
    } else {
        attendance.clockIn = new Date();
        attendance.status = 'Clocked In';
    }

    const savedAttendance = await attendance.save();
    res.status(201).json(savedAttendance);
});

// @desc    Start break
// @route   POST /api/attendance/start-break
// @access  Private
const startBreak = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });

    if (!attendance || attendance.status !== 'Clocked In') {
        res.status(400);
        throw new Error('Must be clocked in to start break');
    }

    if (attendance.totalBreakMinutes >= 60) {
        res.status(400);
        throw new Error('Break limit (60 mins) reached');
    }

    attendance.breaks.push({ start: new Date() });
    attendance.status = 'On Break';

    const savedAttendance = await attendance.save();
    res.json(savedAttendance);
});

// @desc    End break
// @route   POST /api/attendance/end-break
// @access  Private
const endBreak = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });

    if (!attendance || attendance.status !== 'On Break') {
        res.status(400);
        throw new Error('Not currently on break');
    }

    const currentBreak = attendance.breaks[attendance.breaks.length - 1];
    currentBreak.end = new Date();

    const breakDuration = Math.round((currentBreak.end - currentBreak.start) / 60000);
    attendance.totalBreakMinutes += breakDuration;
    attendance.status = 'Clocked In';

    const savedAttendance = await attendance.save();
    res.json(savedAttendance);
});

// @desc    Clock out
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });

    if (!attendance || attendance.status === 'Clocked Out') {
        res.status(400);
        throw new Error('Not clocked in or already clocked out');
    }

    if (attendance.status === 'On Break') {
        // End the break first
        const currentBreak = attendance.breaks[attendance.breaks.length - 1];
        currentBreak.end = new Date();
        const breakDuration = Math.round((currentBreak.end - currentBreak.start) / 60000);
        attendance.totalBreakMinutes += breakDuration;
    }

    attendance.clockOut = new Date();
    attendance.status = 'Clocked Out';

    // Calculate Points
    const settings = await AttendanceSettings.findOne();
    const workingHoursStart = settings?.workingHoursStart || "09:00";
    const workingHoursEnd = settings?.workingHoursEnd || "18:00";

    const [startH, startM] = workingHoursStart.split(':').map(Number);
    const [endH, endM] = workingHoursEnd.split(':').map(Number);

    const startTime = new Date(new Date().setHours(startH, startM, 0, 0));
    const endTime = new Date(new Date().setHours(endH, endM, 0, 0));

    let effectiveStart = attendance.clockIn > startTime ? attendance.clockIn : startTime;
    let effectiveEnd = attendance.clockOut < endTime ? attendance.clockOut : endTime;

    if (effectiveStart > endTime || effectiveEnd < startTime) {
        attendance.points = 0;
    } else {
        const workDurationMs = effectiveEnd - effectiveStart;
        const workMinutes = Math.max(0, (workDurationMs / 60000) - attendance.totalBreakMinutes);

        // Calculate points based on hours worked (1 point per hour)
        // We use the effective work minutes (clamped to working hours and minus breaks)
        attendance.points = parseFloat((workMinutes / 60).toFixed(2));
    }

    const savedAttendance = await attendance.save();
    res.json(savedAttendance);
});

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private
const getTodayAttendance = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });
    res.json(attendance);
});

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance/all
// @access  Private/Admin
const getAllAttendance = asyncHandler(async (req, res) => {
    const { month, startDate, endDate } = req.query;
    let query = {};

    if (month) {
        // month is YYYY-MM
        query.date = { $regex: new RegExp(`^${month}`) };
    } else if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceRecords = await Attendance.find(query)
        .populate('user', 'name role email')
        .sort({ date: -1 });

    res.json(attendanceRecords);
});

// @desc    Get attendance settings
// @route   GET /api/attendance/settings
// @access  Private
const getAttendanceSettings = asyncHandler(async (req, res) => {
    let settings = await AttendanceSettings.findOne();
    if (!settings) {
        settings = await AttendanceSettings.create({});
    }
    res.json(settings);
});

// @desc    Update attendance settings
// @route   PUT /api/attendance/settings
// @access  Private/Admin
const updateAttendanceSettings = asyncHandler(async (req, res) => {
    let settings = await AttendanceSettings.findOne();
    if (!settings) {
        settings = new AttendanceSettings(req.body);
    } else {
        settings.workingHoursStart = req.body.workingHoursStart || settings.workingHoursStart;
        settings.workingHoursEnd = req.body.workingHoursEnd || settings.workingHoursEnd;
        settings.offDays = req.body.offDays !== undefined ? req.body.offDays : settings.offDays;
        settings.attendanceStartFrom = req.body.attendanceStartFrom || settings.attendanceStartFrom;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

export {
    clockIn,
    startBreak,
    endBreak,
    clockOut,
    getTodayAttendance,
    getAllAttendance,
    getAttendanceSettings,
    updateAttendanceSettings
};
