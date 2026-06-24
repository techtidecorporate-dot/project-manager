import asyncHandler from 'express-async-handler';
import Department from '../models/Department.js';
import Project from '../models/Project.js';

// @desc    Get all departments (filtered by workspace)
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
    let query = {};

    if (req.query.workspaceId) {
        query.workspace = req.query.workspaceId;
    }

    const departments = await Department.find(query)
        .populate('workspace', 'name')
        .populate('head', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });

    res.json(departments);
});

// @desc    Create a department
// @route   POST /api/departments
// @access  Private (Admin/PM)
const createDepartment = asyncHandler(async (req, res) => {
    const { name, description, workspace, head, members } = req.body;

    const department = await Department.create({
        name,
        description,
        workspace,
        head,
        members,
    });

    const populated = await Department.findById(department._id)
        .populate('workspace', 'name')
        .populate('head', 'name email')
        .populate('members', 'name email role');

    res.status(201).json(populated);
});

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id)
        .populate('workspace', 'name')
        .populate('head', 'name email')
        .populate('members', 'name email role');

    if (!department) {
        res.status(404);
        throw new Error('Department not found');
    }

    res.json(department);
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin/PM)
const updateDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        res.status(404);
        throw new Error('Department not found');
    }

    department.name = req.body.name || department.name;
    department.description = req.body.description || department.description;
    department.head = req.body.head || department.head;
    if (req.body.members) department.members = req.body.members;

    const updated = await department.save();

    const populated = await Department.findById(updated._id)
        .populate('workspace', 'name')
        .populate('head', 'name email')
        .populate('members', 'name email role');

    res.json(populated);
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        res.status(404);
        throw new Error('Department not found');
    }

    await Project.updateMany(
        { department: department._id },
        { $unset: { department: '' } }
    );

    await department.deleteOne();
    res.json({ message: 'Department removed' });
});

export {
    getDepartments,
    createDepartment,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
};
