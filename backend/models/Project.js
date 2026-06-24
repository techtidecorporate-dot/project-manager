import mongoose from 'mongoose';

const projectSchema = mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            // required: true,
        },
        status: {
            type: String,
            enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Review'],
            default: 'Planning',
        },
        client: {
            type: String, // Company Name
            required: true,
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true,
        },
        team: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        startDate: {
            type: String,
        },
        deadline: {
            type: String,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium',
        },
        progress: {
            type: Number,
            default: 0,
        },
        documentName: {
            type: String,
        },
        documentURL: {
            type: String,
        },
        budget: {
            currency: { type: String, default: 'USD' },
            estimated: { type: Number, default: 0 },
            spent: { type: Number, default: 0 },
        },
        files: [
            {
                name: String,
                url: String,
                public_id: String,
                type: { type: String },
                size: Number,
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                uploadedAt: { type: Date, default: Date.now },
            }
        ],
        updates: [
            {
                time: String,
                actor: String,
                action: String,
            }
        ],
        phases: [
            {
                name: String,
                description: String,
                status: {
                    type: String,
                    enum: ['Pending', 'Working', 'Completed (Dev)', 'Under SQA', 'Error', 'Completed'],
                    default: 'Pending',
                },
                developer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                sqa: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                deadline: String,
                priority: {
                    type: String,
                    enum: ['Low', 'Medium', 'High'],
                    default: 'Medium'
                },
                duration: Number, // Total duration in days
                devDays: Number, // Developer allocation
                sqaDays: Number, // SQA allocation
                errors: [
                    {
                        name: String,
                        message: String,
                        evidence: String,
                        isFixed: { type: Boolean, default: false },
                        createdAt: { type: Date, default: Date.now }
                    }
                ],
                deliverableUrl: String,
                clientApproved: { type: Boolean, default: false },
                clientApprovedAt: Date,
                completedByDevAt: Date,
                completedBySQAAt: Date,
                points: {
                    type: Number,
                    default: 0,
                },
                sqaPoints: {
                    type: Number,
                    default: 0,
                },
                hasErrors: {
                    type: Boolean,
                    default: false,
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
