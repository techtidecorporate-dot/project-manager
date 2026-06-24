import express from 'express';
import {
    getMilestones,
    createMilestone,
    getMilestoneById,
    updateMilestone,
    deleteMilestone,
} from '../controllers/milestoneController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
    .route('/')
    .get(protect, getMilestones)
    .post(protect, authorize('ADMIN', 'PM'), createMilestone);

router
    .route('/:id')
    .get(protect, getMilestoneById)
    .put(protect, authorize('ADMIN', 'PM'), updateMilestone)
    .delete(protect, authorize('ADMIN'), deleteMilestone);

export default router;
