import express from 'express';
import {
    getDepartments,
    createDepartment,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
    .route('/')
    .get(protect, getDepartments)
    .post(protect, authorize('ADMIN', 'PM'), createDepartment);

router
    .route('/:id')
    .get(protect, getDepartmentById)
    .put(protect, authorize('ADMIN', 'PM'), updateDepartment)
    .delete(protect, authorize('ADMIN'), deleteDepartment);

export default router;
