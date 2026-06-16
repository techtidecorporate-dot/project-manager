import express from 'express';
import {
    getProjects,
    createProject,
    getProjectById,
    deleteProject,
    updateProject,
    getPendingProjects,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
    .route('/')
    .get(protect, getProjects)
    .post(protect, authorize('ADMIN', 'PM'), createProject);

router
    .route('/pending')
    .get(protect, authorize('ADMIN', 'PM'), getPendingProjects);

router
    .route('/:id')
    .get(protect, getProjectById)
    .delete(protect, authorize('ADMIN'), deleteProject)
    .put(protect, authorize('ADMIN', 'PM', 'DEVELOPER', 'SQA'), updateProject);

export default router;
