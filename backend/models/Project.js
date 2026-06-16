import mongoose from 'mongoose';

const projectSchema = mongoose.Schema(
    {
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
