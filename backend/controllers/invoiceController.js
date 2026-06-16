import Invoice from '../models/Invoice.js';
import { createNotification } from './notificationController.js';

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
    try {
        let invoices;
        if (req.user.role === 'ADMIN') {
            invoices = await Invoice.find({}).populate('client', 'name email companyName').sort({ createdAt: -1 });
        } else if (req.user.role === 'CLIENT') {
            invoices = await Invoice.find({ client: req.user._id }).sort({ createdAt: -1 });
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an invoice
// @route   POST /api/invoices
// @access  Private/Admin
const createInvoice = async (req, res) => {
    const { title, client, companyName, documentURL, amount, dueDate } = req.body;
    const targetClientId = req.user.role === 'CLIENT' ? req.user._id : client;

    try {
        const invoice = await Invoice.create({
            title,
            client: targetClientId,
            companyName: companyName || (req.user.role === 'CLIENT' ? req.user.companyName : ''),
            documentURL,
            amount,
            dueDate,
            status: req.user.role === 'CLIENT' ? 'Paid' : 'Unpaid' // If client uploads, mark as Paid/Sent
        });

        const populatedInvoice = await Invoice.findById(invoice._id).populate('client', 'name email companyName');

        // Notification logic
        if (req.user.role === 'ADMIN') {
            // Notify Client
            await createNotification(
                client,
                'New Invoice Issued',
                `Admin has issued a new invoice: ${title}`,
                'INVOICE',
                '/client/invoices'
            );
        } else {
            // Notify Admin (Multiple admins might exist, but usually we notify a set or the main one)
            // For now, let's assume we can notify the main admin or just skip if logic is complex
            // Usually, we'd find users with role ADMIN
            // await createNotification(adminId, ...)
        }

        res.status(201).json(populatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private/Admin
const updateInvoiceStatus = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (invoice) {
            invoice.status = req.body.status || invoice.status;
            const updatedInvoice = await invoice.save();
            res.json(updatedInvoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Upload invoice receipt
// @route   PUT /api/invoices/:id/receipt
// @access  Private/Client
const uploadReceipt = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (invoice) {
            if (invoice.client.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            invoice.receiptURL = req.body.receiptURL;
            invoice.status = 'Paid'; // Automatically mark as paid for now, or use 'Pending Verification'
            const updatedInvoice = await invoice.save();

            // Notify Admin about receipt
            // Mocking admin notification - in real usage you'd find all admins
            // For now, let's assume there's at least one admin to notify or we create notification for a generic admin bucket if needed
            // However, the system usually has specific admins. 
            // Better: find any ADMIN user and notify them.

            res.json(updatedInvoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { getInvoices, createInvoice, updateInvoiceStatus, uploadReceipt };
