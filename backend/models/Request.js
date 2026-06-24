import mongoose from 'mongoose';

const requestSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['Chat', 'Complaint', 'Support', 'Feature', 'Bug', 'Other'],
            default: 'Chat',
        },
        status: {
            type: String,
            enum: ['Pending', 'Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Pending',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        messages: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                content: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        category: {
            type: String,
            enum: ['Request', 'Compliance'],
            default: 'Request',
        },
    },
    {
        timestamps: true,
    }
);

const Request = mongoose.model('Request', requestSchema);

export default Request;
