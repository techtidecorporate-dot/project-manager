import mongoose from 'mongoose';

const taskSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Todo', 'In Progress', 'In Review', 'Completed'],
            default: 'Todo',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        milestone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Milestone',
        },
        phase: {
            type: String,
        },
        parentTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            default: null,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dueDate: {
            type: Date,
        },
        tags: [String],
        points: {
            type: Number,
            default: 0,
        },
        hasBugs: {
            type: Boolean,
            default: false,
        },
        bugReportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        sqaPoints: {
            type: Number,
            default: 0,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
