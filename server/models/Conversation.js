const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
    {
        conversationId: { type: String, required: true, unique: true },
        participants: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            required: true,
            validate: arr => arr.length === 2,
        },
        lastMessage: { type: String, maxlength: 100 },
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
