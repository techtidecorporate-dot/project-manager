import Notification from '../models/Notification.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized');
        }
        notification.isRead = true;
        await notification.save();
        res.json({ message: 'Notification marked as read' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
});

// Helper function to create notification
const createNotification = async (userId, title, message, type, link) => {
    try {
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
};
