import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['ADMIN', 'PM', 'DEVELOPER', 'SQA', 'CLIENT'],
            default: 'DEVELOPER',
        },
        avatar: {
            type: String,
            default: '',
        },
        companyName: {
            type: String,
        },
        position: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Method to match password (plain text comparison)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return enteredPassword === this.password;
};

const User = mongoose.model('User', userSchema);

export default User;
