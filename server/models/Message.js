const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
	{
		conversationId: { type: String, index: true },
		senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		content: { type: String, trim: true, maxlength: 2000 },
		read: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, read: 1 });

module.exports = mongoose.model('Message', MessageSchema);
