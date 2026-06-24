import express from 'express';
import {
    getSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
} from '../controllers/subtaskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
    .route('/')
    .get(protect, getSubtasks)
    .post(protect, createSubtask);

router
    .route('/:id')
    .put(protect, updateSubtask)
    .delete(protect, deleteSubtask);

export default router;
