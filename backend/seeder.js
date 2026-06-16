import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const seedData = async () => {
    try {
        await User.deleteMany();

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'ADMIN',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=ea445a&color=fff',
        });

        console.log('Admin User Created!');
        console.log('Email: admin@example.com');
        console.log('Password: password123');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
