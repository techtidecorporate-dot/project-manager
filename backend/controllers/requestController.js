import Request from '../models/Request.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
    try {
        let filter = {};
        if (req.query.projectId) {
            filter.project = req.query.projectId;
        }
        if (req.user.role !== 'ADMIN') {
            filter.user = req.user._id;
        }
        const requests = await Request.find(filter)
            .populate('user', 'name email role')
            .populate('project', 'title')
            .populate('messages.sender', 'name email role')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
    const { title, description, type, priority, category, project } = req.body;

    try {
        const request = await Request.create({
            title,
            description,
            type,
            priority,
            category: category || 'Request',
            project: project || undefined,
            user: req.user._id,
            messages: [
                {
                    sender: req.user._id,
                    content: description,
                }
            ]
        });

        // Notify Admins
        const admins = await User.find({ role: 'ADMIN' });
        for (const admin of admins) {
            await createNotification(
                admin._id,
                `New ${category || 'Support'} Request`,
                `${req.user.name} submitted a new ${category?.toLowerCase() || 'request'}: ${title}`,
                'REQUEST',
                '/admin/requests'
            );
        }

        const populated = await Request.findById(request._id)
            .populate('user', 'name email role')
            .populate('project', 'title')
            .populate('messages.sender', 'name email role');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add message/reply to request
// @route   POST /api/requests/:id/messages
// @access  Private
const addMessage = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (request) {
            const message = {
                sender: req.user._id,
                content: req.body.content,
            };

            request.messages.push(message);

            // If admin replies, maybe mark as open or in progress if it was pending
            if (req.user.role === 'ADMIN' && request.status === 'Pending') {
                request.status = 'Open';
            }

            await request.save();

            // Notify participants
            if (req.user.role === 'ADMIN') {
                // Fetch user to check their role for correct routing
                const targetUser = await User.findById(request.user);
                let path = '/client/tickets'; // Default for client

                if (targetUser.role === 'PM') path = '/pm/requests';
                else if (targetUser.role === 'DEVELOPER') path = '/developer/requests';
                else if (targetUser.role === 'SQA') path = '/sqa/requests';

                await createNotification(
                    request.user,
                    'New Reply to your Request',
                    `Admin has replied to: ${request.title}`,
                    'REQUEST',
                    path
                );
            } else {
                // Notify Admins when user replies
                const admins = await User.find({ role: 'ADMIN' });
                for (const admin of admins) {
                    await createNotification(
                        admin._id,
                        'New Message in Request',
                        `${req.user.name} replied to: ${request.title}`,
                        'REQUEST',
                        '/admin/requests'
                    );
                }
            }

            res.status(201).json(request);
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
const updateRequestStatus = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (request) {
            request.status = req.body.status;
            await request.save();

            // Notify user about status update
            const targetUser = await User.findById(request.user);
            if (targetUser) {
                let path = '/client/tickets';
                if (targetUser.role === 'PM') path = '/pm/requests';
                else if (targetUser.role === 'DEVELOPER') path = '/developer/requests';
                else if (targetUser.role === 'SQA') path = '/sqa/requests';

                await createNotification(
                    request.user,
                    'Request Status Updated',
                    `Your request "${request.title}" status has been updated to: ${request.status}`,
                    'REQUEST',
                    path
                );
            }

            res.json(request);
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { getRequests, createRequest, addMessage, updateRequestStatus };
