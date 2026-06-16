import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String, // Format: YYYY-MM-DD
            required: true,
        },
        clockIn: {
            type: Date,
        },
        clockOut: {
            type: Date,
        },
        breaks: [
            {
                start: Date,
                end: Date,
            },
        ],
        totalBreakMinutes: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Clocked In', 'On Break', 'Clocked Out'],
            default: 'Clocked Out',
        },
        points: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
