import express from 'express';
import { getInvoices, createInvoice, updateInvoiceStatus, uploadReceipt } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getInvoices)
    .post(protect, authorize('ADMIN', 'CLIENT'), createInvoice);

router.route('/:id/status')
    .put(protect, authorize('ADMIN'), updateInvoiceStatus);

router.route('/:id/receipt')
    .put(protect, authorize('CLIENT'), uploadReceipt);

export default router;
