import asyncHandler from 'express-async-handler';
import Subtask from '../models/Subtask.js';

// @desc    Get all subtasks (filtered by task)
// @route   GET /api/subtasks
// @access  Private
const getSubtasks = asyncHandler(async (req, res) => {
    let query = {};

    if (req.query.taskId) {
        query.task = req.query.taskId;
    }

    const subtasks = await Subtask.find(query)
        .populate('task', 'title')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });

    res.json(subtasks);
});

// @desc    Create a subtask
// @route   POST /api/subtasks
// @access  Private
const createSubtask = asyncHandler(async (req, res) => {
    const { title, description, task, assignedTo } = req.body;

    const subtask = await Subtask.create({
        title,
        description,
        task,
        assignedTo,
    });

    const populated = await Subtask.findById(subtask._id)
        .populate('task', 'title')
        .populate('assignedTo', 'name email');

    res.status(201).json(populated);
});

// @desc    Update subtask
// @route   PUT /api/subtasks/:id
// @access  Private
const updateSubtask = asyncHandler(async (req, res) => {
    const subtask = await Subtask.findById(req.params.id);

    if (!subtask) {
        res.status(404);
        throw new Error('Subtask not found');
    }

    subtask.title = req.body.title || subtask.title;
    subtask.description = req.body.description || subtask.description;
    subtask.status = req.body.status || subtask.status;
    subtask.assignedTo = req.body.assignedTo || subtask.assignedTo;

    const updated = await subtask.save();

    const populated = await Subtask.findById(updated._id)
        .populate('task', 'title')
        .populate('assignedTo', 'name email');

    res.json(populated);
});

// @desc    Delete subtask
// @route   DELETE /api/subtasks/:id
// @access  Private
const deleteSubtask = asyncHandler(async (req, res) => {
    const subtask = await Subtask.findById(req.params.id);

    if (!subtask) {
        res.status(404);
        throw new Error('Subtask not found');
    }

    await subtask.deleteOne();
    res.json({ message: 'Subtask removed' });
});

export {
    getSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
};
