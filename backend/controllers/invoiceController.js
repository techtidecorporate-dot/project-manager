import Invoice from '../models/Invoice.js';
import { createNotification } from './notificationController.js';
import uploadToCloudinary from '../utils/fileUpload.js';

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
        let finalDocumentURL = documentURL;
        let documentPublicId = null;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'invoices');
            finalDocumentURL = result.secure_url;
            documentPublicId = result.public_id;
        }

        const invoice = await Invoice.create({
            title,
            client: targetClientId,
            companyName: companyName || (req.user.role === 'CLIENT' ? req.user.companyName : ''),
            documentURL: finalDocumentURL,
            documentPublicId,
            amount,
            dueDate,
            status: req.user.role === 'CLIENT' ? 'Paid' : 'Unpaid'
        });

        const populatedInvoice = await Invoice.findById(invoice._id).populate('client', 'name email companyName');

        if (req.user.role === 'ADMIN') {
            await createNotification(
                client,
                'New Invoice Issued',
                `Admin has issued a new invoice: ${title}`,
                'INVOICE',
                '/client/invoices'
            );
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
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (invoice.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let receiptURL = invoice.receiptURL;
        let receiptPublicId = invoice.receiptPublicId;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'receipts');
            receiptURL = result.secure_url;
            receiptPublicId = result.public_id;
        }

        invoice.receiptURL = receiptURL;
        invoice.receiptPublicId = receiptPublicId;
        invoice.status = 'Paid';
        const updatedInvoice = await invoice.save();

        res.json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { getInvoices, createInvoice, updateInvoiceStatus, uploadReceipt };
