import express from 'express';
import {
    getWorkspaces,
    createWorkspace,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    addMember,
    removeMember,
    uploadLogo,
} from '../controllers/workspaceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router
    .route('/')
    .get(protect, getWorkspaces)
    .post(protect, authorize('ADMIN'), createWorkspace);

router
    .route('/:id')
    .get(protect, getWorkspaceById)
    .put(protect, authorize('ADMIN'), updateWorkspace)
    .delete(protect, authorize('ADMIN'), deleteWorkspace);

router
    .route('/:id/members')
    .post(protect, authorize('ADMIN'), addMember);

router
    .route('/:id/members/:userId')
    .delete(protect, authorize('ADMIN'), removeMember);

router
    .route('/:id/logo')
    .put(protect, authorize('ADMIN'), upload.single('logo'), uploadLogo);

export default router;
