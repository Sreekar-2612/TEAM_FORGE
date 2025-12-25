const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        participants: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.length === 2;
                },
                message: 'Conversation must have exactly 2 participants',
            },
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        lastMessage: {
            type: String,
            default: '',
            maxlength: 100,
        },
    },
    { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
