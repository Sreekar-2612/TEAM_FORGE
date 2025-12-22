const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
	teamId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
		required: true,
	},
	senderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
