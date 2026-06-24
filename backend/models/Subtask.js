import mongoose from 'mongoose';

const subtaskSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        status: {
            type: String,
            enum: ['Todo', 'In Progress', 'Completed'],
            default: 'Todo',
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Subtask = mongoose.model('Subtask', subtaskSchema);

export default Subtask;
