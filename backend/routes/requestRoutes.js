import express from 'express';
import {
    getRequests,
    createRequest,
    addMessage,
    updateRequestStatus,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
    .route('/')
    .get(protect, getRequests)
    .post(protect, createRequest);

router
    .route('/:id/messages')
    .post(protect, addMessage);

router
    .route('/:id/status')
    .put(protect, authorize('ADMIN'), updateRequestStatus);

export default router;
