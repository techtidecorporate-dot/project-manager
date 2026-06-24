import asyncHandler from 'express-async-handler';
import Workspace from '../models/Workspace.js';
import Department from '../models/Department.js';
import Project from '../models/Project.js';
import uploadToCloudinary from '../utils/fileUpload.js';

// @desc    Get all workspaces for current user
// @route   GET /api/workspaces
// @access  Private
const getWorkspaces = asyncHandler(async (req, res) => {
    const workspaces = await Workspace.find({
        $or: [
            { owner: req.user._id },
            { 'members.user': req.user._id },
        ],
    })
        .populate('owner', 'name email')
        .populate('members.user', 'name email role')
        .sort({ createdAt: -1 });

    res.json(workspaces);
});

// @desc    Create a workspace
// @route   POST /api/workspaces
// @access  Private (Admin)
const createWorkspace = asyncHandler(async (req, res) => {
    const { name, description, logo } = req.body;

    const workspace = await Workspace.create({
        name,
        description,
        logo,
        owner: req.user._id,
        members: [{ user: req.user._id, role: req.user.role }],
    });

    res.status(201).json(workspace);
});

// @desc    Get workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
const getWorkspaceById = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members.user', 'name email role');

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    res.json(workspace);
});

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private (Admin/Owner)
const updateWorkspace = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    if (workspace.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized to update this workspace');
    }

    workspace.name = req.body.name || workspace.name;
    workspace.description = req.body.description || workspace.description;
    workspace.logo = req.body.logo || workspace.logo;

    if (req.body.members) {
        workspace.members = req.body.members;
    }

    const updated = await workspace.save();
    res.json(updated);
});

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private (Admin/Owner)
const deleteWorkspace = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    if (workspace.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized to delete this workspace');
    }

    await Department.deleteMany({ workspace: workspace._id });
    await Project.deleteMany({ workspace: workspace._id });
    await workspace.deleteOne();

    res.json({ message: 'Workspace removed' });
});

// @desc    Add member to workspace
// @route   POST /api/workspaces/:id/members
// @access  Private (Admin/Owner)
const addMember = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    const { userId, role } = req.body;

    const alreadyMember = workspace.members.find(
        m => m.user.toString() === userId
    );

    if (alreadyMember) {
        res.status(400);
        throw new Error('User is already a member');
    }

    workspace.members.push({ user: userId, role });
    await workspace.save();

    res.json(workspace);
});

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:id/members/:userId
// @access  Private (Admin/Owner)
const removeMember = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    workspace.members = workspace.members.filter(
        m => m.user.toString() !== req.params.userId
    );

    await workspace.save();
    res.json(workspace);
});

// @desc    Upload workspace logo
// @route   PUT /api/workspaces/:id/logo
// @access  Private (Admin/Owner)
const uploadLogo = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    if (workspace.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized to update this workspace');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const result = await uploadToCloudinary(req.file.buffer, 'workspace_logos');
    workspace.logo = result.secure_url;
    const updated = await workspace.save();
    res.json({ logo: updated.logo });
});

export {
    getWorkspaces,
    createWorkspace,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    addMember,
    removeMember,
    uploadLogo,
};
