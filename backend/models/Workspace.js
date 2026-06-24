import mongoose from 'mongoose';

const workspaceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        logo: {
            type: String,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                role: {
                    type: String,
                    enum: ['ADMIN', 'PM', 'DEVELOPER', 'SQA', 'CLIENT'],
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
