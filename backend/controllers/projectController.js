import Project from '../models/Project.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        let projects;

        if (req.user.role === 'ADMIN') {
            // Admins see everything with phases populated
            projects = await Project.find({})
                .populate('team manager')
                .populate('phases.developer', 'name email')
                .populate('phases.sqa', 'name email')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'CLIENT') {
            // Clients see only projects matching their companyName
            if (!req.user.companyName) {
                projects = [];
            } else {
                projects = await Project.find({ client: req.user.companyName })
                    .populate('team manager')
                    .populate('phases.developer', 'name email')
                    .populate('phases.sqa', 'name email')
                    .sort({ createdAt: -1 });
            }
        } else if (req.user.role === 'PM') {
            // PMs can see all projects to manage/divide them
            projects = await Project.find({})
                .populate('team manager')
                .populate('phases.developer', 'name email')
                .populate('phases.sqa', 'name email')
                .sort({ createdAt: -1 });
        } else {
            // Developers/SQA see projects they are team members of OR assigned in phases
            // First get projects they're assigned to, then populate phases
            const allProjects = await Project.find({})
                .populate('team manager')
                .populate('phases.developer', 'name email')
                .populate('phases.sqa', 'name email')
                .sort({ createdAt: -1 });

            // Filter projects where user is in team OR assigned to a phase
            projects = allProjects.filter(p => {
                const isInTeam = p.team && p.team.some(t => t._id.toString() === req.user._id.toString());
                const isDevInPhases = p.phases && p.phases.some(ph =>
                    ph.developer && ph.developer._id && ph.developer._id.toString() === req.user._id.toString()
                );
                const isSQAInPhases = p.phases && p.phases.some(ph =>
                    ph.sqa && ph.sqa._id && ph.sqa._id.toString() === req.user._id.toString()
                );
                return isInTeam || isDevInPhases || isSQAInPhases;
            });
        }

        // Calculate progress for all projects before returning
        projects = projects.map(project => {
            if (project.phases && project.phases.length > 0) {
                const completedPhases = project.phases.filter(ph => ph.status === 'Completed').length;
                const totalPhases = project.phases.length;
                project.progress = Math.round((completedPhases / totalPhases) * 100);
            } else {
                project.progress = 0;
            }
            return project;
        });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Admin/PM)
const createProject = async (req, res) => {
    const {
        title,
        client,
        status,
        progress,
        startDate,
        deadline,
        documentName,
        documentURL
    } = req.body;

    try {
        const project = await Project.create({
            title,
            client, // This is the Company Name
            status: status || 'Planning',
            progress: progress || 0,
            startDate,
            deadline,
            documentName,
            documentURL,
            manager: req.user._id,
            updates: [
                {
                    time: new Date().toISOString().split('T')[0],
                    actor: req.user.name,
                    action: 'Project created'
                }
            ]
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security check for Clients
        if (req.user.role === 'CLIENT' && project.client !== req.user.companyName) {
            return res.status(401).json({ message: 'Not authorized to view this project' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (project) {
            await project.deleteOne();
            res.json({ message: 'Project removed' });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access   Private/Admin/PM/Developer/SQA
const updateProject = async (req, res) => {
    try {
        const {
            title,
            client,
            status,
            progress,
            startDate,
            deadline,
            documentName,
            documentURL,
            priority,
            description,
            phases,
            team
        } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is ADMIN, PM, or assigned to the project
        const isAdmin = req.user.role === 'ADMIN';
        const isPM = req.user.role === 'PM';

        // Check if user is developer or SQA assigned to any phase (by ID or name)
        const isAssignedDev = project.phases && project.phases.some(ph => {
            // Check by ID first
            let devId = typeof ph.developer === 'object' ? ph.developer._id.toString() : ph.developer;
            if (devId === req.user._id.toString()) return true;
            // Also check by name if developer is an object
            if (typeof ph.developer === 'object' && ph.developer.name) {
                return ph.developer.name.toLowerCase().trim() === req.user.name.toLowerCase().trim();
            }
            return false;
        });
        const isAssignedSQA = project.phases && project.phases.some(ph => {
            // Check by ID first
            let sqaId = typeof ph.sqa === 'object' ? ph.sqa._id.toString() : ph.sqa;
            if (sqaId === req.user._id.toString()) return true;
            // Also check by name if SQA is an object
            if (typeof ph.sqa === 'object' && ph.sqa.name) {
                return ph.sqa.name.toLowerCase().trim() === req.user.name.toLowerCase().trim();
            }
            return false;
        });

        if (!isAdmin && !isPM && !isAssignedDev && !isAssignedSQA) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        // Helper function to transform phases - convert populated objects to ObjectIds
        const transformPhases = (phasesArray) => {
            if (!phasesArray) return phasesArray;
            return phasesArray.map(phase => ({
                ...phase,
                developer: typeof phase.developer === 'object' && phase.developer?._id
                    ? phase.developer._id
                    : phase.developer,
                sqa: typeof phase.sqa === 'object' && phase.sqa?._id
                    ? phase.sqa._id
                    : phase.sqa
            }));
        };

        const applyScoringToPhases = (newPhases, oldPhases) => {
            return transformPhases(newPhases).map(newPhaseData => {
                const oldPhase = oldPhases.find(ph => ph.name === newPhaseData.name);
                const transformedPhase = { ...newPhaseData };

                if (oldPhase && newPhaseData.status !== oldPhase.status) {
                    // Developer completes work
                    if (newPhaseData.status === 'Completed (Dev)') {
                        transformedPhase.completedByDevAt = new Date();

                        // Point calculation
                        if (transformedPhase.deadline) {
                            const deadlineDate = new Date(transformedPhase.deadline);
                            if (new Date() <= deadlineDate) {
                                transformedPhase.points = 2;
                            } else {
                                transformedPhase.points = -1;
                            }
                        } else {
                            transformedPhase.points = 2;
                        }
                    }

                    // SQA reports error
                    if (newPhaseData.status === 'Error') {
                        transformedPhase.hasErrors = true;
                        transformedPhase.points = (oldPhase.points || 0) - 1;
                        transformedPhase.sqaPoints = 2;
                        transformedPhase.sqa = req.user._id;
                    }

                    // SQA approves
                    if (newPhaseData.status === 'Completed') {
                        transformedPhase.completedBySQAAt = new Date();

                        // Point calculation for SQA
                        let isOnTime = true;
                        if (oldPhase.completedByDevAt && oldPhase.sqaDays) {
                            const sqaDeadline = new Date(oldPhase.completedByDevAt);
                            sqaDeadline.setDate(sqaDeadline.getDate() + oldPhase.sqaDays);
                            if (new Date() > sqaDeadline) {
                                isOnTime = false;
                            }
                        } else if (transformedPhase.deadline) {
                            // Fallback to phase deadline if no sqaDays
                            if (new Date() > new Date(transformedPhase.deadline)) {
                                isOnTime = false;
                            }
                        }

                        if (isOnTime) {
                            transformedPhase.sqaPoints = 2;
                        } else {
                            transformedPhase.sqaPoints = -1;
                        }

                        // Also impact points for dev if they approved something that had errors? 
                        // Actually, just focus on the user's specific request for now.
                        transformedPhase.sqa = req.user._id;
                    }
                } else if (oldPhase) {
                    // Keep existing scores if status didn't change
                    transformedPhase.points = oldPhase.points;
                    transformedPhase.sqaPoints = oldPhase.sqaPoints;
                    transformedPhase.hasErrors = oldPhase.hasErrors;
                    transformedPhase.completedByDevAt = oldPhase.completedByDevAt;
                    transformedPhase.completedBySQAAt = oldPhase.completedBySQAAt;
                }
                return transformedPhase;
            });
        };

        // If developer/SQA, only allow updating phases (not project details)
        if (req.user.role === 'DEVELOPER' || req.user.role === 'SQA') {
            // Only update phases, keep other fields unchanged
            if (phases) {
                const oldPhases = [...project.phases];
                project.phases = applyScoringToPhases(phases, oldPhases);

                // --- TEAM SYNCHRONIZATION LOGIC ---
                if (project.phases && project.phases.length > 0) {
                    const phaseUserIds = new Set();
                    project.phases.forEach(ph => {
                        if (ph.developer) phaseUserIds.add(ph.developer.toString());
                        if (ph.sqa) phaseUserIds.add(ph.sqa.toString());
                    });

                    // Update project.team to include all phase-assigned users
                    const currentTeamIds = new Set(project.team.map(id => id.toString()));
                    phaseUserIds.forEach(userId => {
                        if (!currentTeamIds.has(userId)) {
                            project.team.push(userId);
                        }
                    });
                }
                // ----------------------------------

                // --- PROGRESS & STATUS LOGIC ---
                if (project.phases && project.phases.length > 0) {
                    const completedPhases = project.phases.filter(ph => ph.status === 'Completed').length;
                    const anyStartedPhases = project.phases.some(ph => ph.status !== 'Pending');
                    const totalPhases = project.phases.length;

                    project.progress = Math.round((completedPhases / totalPhases) * 100);

                    if (project.progress === 100) {
                        project.status = 'Completed';
                    } else if (anyStartedPhases) {
                        project.status = 'In Progress';
                    }
                }
                // ----------------------------------

                project.updates.push({
                    time: new Date().toISOString().split('T')[0],
                    actor: req.user.name,
                    action: `Phase status updated by ${req.user.role}. Progress: ${project.progress}%`
                });
            }
        } else {
            // Admin/PM can update all fields
            project.title = title || project.title;
            if (client) project.client = client;
            project.status = status || project.status;
            if (progress !== undefined) project.progress = progress;
            project.startDate = startDate || project.startDate;
            project.deadline = deadline || project.deadline;
            project.documentName = documentName || project.documentName;
            project.documentURL = documentURL || project.documentURL;
            project.priority = priority || project.priority;
            project.description = description || project.description;

            if (phases) {
                const oldPhases = [...project.phases];
                project.phases = applyScoringToPhases(phases, oldPhases);

                // --- TEAM SYNCHRONIZATION LOGIC ---
                if (project.phases && project.phases.length > 0) {
                    const phaseUserIds = new Set();
                    project.phases.forEach(ph => {
                        if (ph.developer) phaseUserIds.add(ph.developer.toString());
                        if (ph.sqa) phaseUserIds.add(ph.sqa.toString());
                    });

                    // Update project.team to include all phase-assigned users
                    const currentTeamIds = new Set(project.team.map(id => id.toString()));
                    phaseUserIds.forEach(userId => {
                        if (!currentTeamIds.has(userId)) {
                            project.team.push(userId);
                        }
                    });
                }
                // ----------------------------------

                // --- PROGRESS & STATUS LOGIC ---
                if (project.phases && project.phases.length > 0) {
                    const completedPhases = project.phases.filter(ph => ph.status === 'Completed').length;
                    const anyStartedPhases = project.phases.some(ph => ph.status !== 'Pending');
                    const totalPhases = project.phases.length;

                    project.progress = Math.round((completedPhases / totalPhases) * 100);

                    if (project.progress === 100) {
                        project.status = 'Completed';
                    } else if (anyStartedPhases) {
                        project.status = 'In Progress';
                    }
                }
                // ----------------------------------
            }
            if (team) project.team = team;

            project.updates.push({
                time: new Date().toISOString().split('T')[0],
                actor: req.user.name,
                action: 'Project updated'
            });
        }

        const updatedProject = await project.save();
        const populatedProject = await Project.findById(updatedProject._id)
            .populate('team manager')
            .populate('phases.developer', 'name email')
            .populate('phases.sqa', 'name email');
        res.json(populatedProject);
    } catch (error) {
        console.error('UpdateProject Error:', error.message, error.stack);
        res.status(400).json({ message: error.message });
    }
};

const getPendingProjects = async (req, res) => {
    try {
        let projects;

        if (req.user.role === 'ADMIN' || req.user.role === 'PM') {
            projects = await Project.find({ status: { $ne: 'Completed' } }).populate('team manager').sort({ createdAt: -1 });
        } else {
            return res.status(403).json({ message: 'Not authorized to view pending projects' });
        }

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getProjects, createProject, getProjectById, deleteProject, updateProject, getPendingProjects };
