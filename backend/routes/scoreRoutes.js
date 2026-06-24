import express from 'express';
const router = express.Router();
import { getMyScore, getAllScores, adjustScore } from '../controllers/scoreController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/me').get(protect, getMyScore);
router.route('/all').get(protect, authorize('ADMIN'), getAllScores);
router.route('/adjust').post(protect, authorize('ADMIN'), adjustScore);

export default router;
