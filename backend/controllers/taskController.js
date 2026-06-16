import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import { createNotification } from './notificationController.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    let query = {};

    // Filter by project if provided
    if (req.query.projectId) {
        query.project = req.query.projectId;
    }

    // Filter by status if provided
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by assignedTo if provided
    if (req.query.assignedTo) {
        query.assignedTo = req.query.assignedTo;
    }

    // PM can see all tasks, but maybe filter by their projects?
    // For now, let PM see all. If restricted, need logic here.
    // If DEV/SQA, only see assigned? Or project based.
    // Assuming simplistic approach for now.

    const tasks = await Task.find(query)
        .populate('project', 'title client')
        .populate('assignedTo', 'name email avatar')
        .sort({ updatedAt: -1 }); // Sort by latest update

    res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority, project, assignedTo, dueDate, tags } = req.body;

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        project,
        assignedTo,
        dueDate,
        tags,
        createdBy: req.user._id
    });

    if (task) {
        // Notify Assigned User
        if (assignedTo) {
            await createNotification(
                assignedTo,
                'New Task Assigned',
                `You have been assigned a new task: ${title}`,
                'TASK',
                '/developer/tasks' // Link will depend on role, but usually devs/sqa check their dashboard
            );
        }
        res.status(201).json(task);
    } else {
        res.status(400);
        throw new Error('Invalid task data');
    }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        // Scoring Logic
        if (req.body.status && req.body.status !== task.status) {
            // When developer moves to 'In Review' (completion of work)
            if (req.body.status === 'In Review' && task.status !== 'In Review' && task.status !== 'Completed') {
                const now = new Date();
                const dueDate = new Date(task.dueDate);

                if (now <= dueDate) {
                    task.points = 2;
                } else {
                    task.points = -1;
                }
                task.completedAt = now;
            }

            // When SQA moves to 'Completed' (Final Approval)
            if (req.body.status === 'Completed' && task.status !== 'Completed') {
                const now = new Date();
                const dueDate = task.dueDate ? new Date(task.dueDate) : null;

                if (dueDate && now <= dueDate) {
                    task.sqaPoints = 2;
                } else if (!dueDate) {
                    task.sqaPoints = 2; // Default if no due date
                } else {
                    task.sqaPoints = -1;
                }
            }
        }

        // When SQA reports a bug (can be done while in In Review)
        if (req.body.hasBugs === true && task.hasBugs === false) {
            task.points -= 1;
            task.sqaPoints = 2;
            task.hasBugs = true;
            task.bugReportedBy = req.user._id;

            // Notify Assigned Developer
            await createNotification(
                task.assignedTo,
                'Bug Reported',
                `A bug has been reported on your task: ${task.title}`,
                'TASK',
                '/developer/tasks'
            );
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.status = req.body.status || task.status;
        task.priority = req.body.priority || task.priority;
        task.assignedTo = req.body.assignedTo || task.assignedTo;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.tags = req.body.tags || task.tags;
        task.hasBugs = req.body.hasBugs !== undefined ? req.body.hasBugs : task.hasBugs;

        if (req.body.status && req.body.status !== task.status) {
            // Notify Task Creator (usually PM or Admin)
            await createNotification(
                task.createdBy,
                'Task Status Updated',
                `Task "${task.title}" moved to ${req.body.status}`,
                'TASK',
                '/tasks'
            );
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});

export { getTasks, createTask, updateTask, deleteTask };
