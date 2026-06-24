import mongoose from 'mongoose';

const invoiceSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        companyName: {
            type: String,
        },
        documentURL: {
            type: String,
            required: true,
        },
        documentPublicId: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Unpaid', 'Paid', 'Sent', 'Overdue', 'Cancelled'],
            default: 'Unpaid',
        },
        dueDate: {
            type: Date,
        },
        amount: {
            type: Number,
        },
        receiptURL: {
            type: String,
        },
        receiptPublicId: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
