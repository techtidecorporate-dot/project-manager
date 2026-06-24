import mongoose from 'mongoose';

const milestoneSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending',
        },
        deadline: {
            type: Date,
        },
        completionPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        responsibleTeam: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const Milestone = mongoose.model('Milestone', milestoneSchema);

export default Milestone;
