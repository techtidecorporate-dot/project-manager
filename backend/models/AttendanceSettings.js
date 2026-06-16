import mongoose from 'mongoose';

const attendanceSettingsSchema = mongoose.Schema(
    {
        workingHoursStart: {
            type: String, // e.g., "09:00"
            default: "09:00",
        },
        workingHoursEnd: {
            type: String, // e.g., "18:00"
            default: "18:00",
        },
        offDays: {
            type: [Number], // 0-6 (Sunday-Saturday)
            default: [0, 6], // Saturday and Sunday by default
        },
        attendanceStartFrom: {
            type: Date,
            default: new Date('2024-01-01'),
        }
    },
    {
        timestamps: true,
    }
);

const AttendanceSettings = mongoose.model('AttendanceSettings', attendanceSettingsSchema);

export default AttendanceSettings;
