import asyncHandler from 'express-async-handler';
import Milestone from '../models/Milestone.js';

// @desc    Get all milestones (filtered by project)
// @route   GET /api/milestones
// @access  Private
const getMilestones = asyncHandler(async (req, res) => {
    let query = {};

    if (req.query.projectId) {
        query.project = req.query.projectId;
    }

    const milestones = await Milestone.find(query)
        .populate('project', 'title client')
        .sort({ createdAt: -1 });

    res.json(milestones);
});

// @desc    Create a milestone
// @route   POST /api/milestones
// @access  Private (Admin/PM)
const createMilestone = asyncHandler(async (req, res) => {
    const { name, description, project, status, deadline, completionPercentage, responsibleTeam } = req.body;

    const milestone = await Milestone.create({
        name,
        description,
        project,
        status,
        deadline,
        completionPercentage,
        responsibleTeam,
    });

    const populated = await Milestone.findById(milestone._id)
        .populate('project', 'title client');

    res.status(201).json(populated);
});

// @desc    Get milestone by ID
// @route   GET /api/milestones/:id
// @access  Private
const getMilestoneById = asyncHandler(async (req, res) => {
    const milestone = await Milestone.findById(req.params.id)
        .populate('project', 'title client');

    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    res.json(milestone);
});

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (Admin/PM)
const updateMilestone = asyncHandler(async (req, res) => {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    milestone.name = req.body.name || milestone.name;
    milestone.description = req.body.description || milestone.description;
    milestone.status = req.body.status || milestone.status;
    milestone.deadline = req.body.deadline || milestone.deadline;
    milestone.completionPercentage = req.body.completionPercentage ?? milestone.completionPercentage;
    milestone.responsibleTeam = req.body.responsibleTeam ?? milestone.responsibleTeam;

    const updated = await milestone.save();

    const populated = await Milestone.findById(updated._id)
        .populate('project', 'title client');

    res.json(populated);
});

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (Admin)
const deleteMilestone = asyncHandler(async (req, res) => {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    await milestone.deleteOne();
    res.json({ message: 'Milestone removed' });
});

export {
    getMilestones,
    createMilestone,
    getMilestoneById,
    updateMilestone,
    deleteMilestone,
};
