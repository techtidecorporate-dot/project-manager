import express from 'express';
import {
    loginUser,
    registerUser,
    getUserProfile,
    updateUser,
    uploadAvatar,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

// @route   GET /api/auth/users
// @access  Private/Admin/PM
router.get('/users', protect, authorize('ADMIN', 'PM'), async (req, res) => {
    try {
        // Find users, but don't select passwords for security
        // Wait, the user said "admin can see password". 
        // If they really want that, I should include it.
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user (Admin can update any user, PM can update own profile)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin or self
router.put('/users/:id', protect, (req, res, next) => {
    if (req.user.role === 'ADMIN' || req.user._id.toString() === req.params.id) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized to update this user' });
    }
}, updateUser);

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
