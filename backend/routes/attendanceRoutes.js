import express from 'express';
const router = express.Router();
import {
    clockIn,
    startBreak,
    endBreak,
    clockOut,
    getTodayAttendance,
    getAllAttendance,
    getAttendanceSettings,
    updateAttendanceSettings
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/today').get(protect, getTodayAttendance);
router.route('/all').get(protect, authorize('ADMIN'), getAllAttendance);
router.route('/clock-in').post(protect, clockIn);
router.route('/clock-out').post(protect, clockOut);
router.route('/start-break').post(protect, startBreak);
router.route('/end-break').post(protect, endBreak);
router.route('/settings')
    .get(protect, getAttendanceSettings)
    .put(protect, authorize('ADMIN'), updateAttendanceSettings);

export default router;
