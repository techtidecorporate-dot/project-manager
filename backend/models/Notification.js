import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['INVOICE', 'REQUEST', 'TASK', 'SYSTEM'],
            default: 'SYSTEM',
        },
        link: {
            type: String, // Path to redirect to when clicked
        },
        isRead: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
