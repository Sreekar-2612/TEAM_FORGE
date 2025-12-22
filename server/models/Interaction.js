const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
	senderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	receiverId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User', // Could also be a Team ID in future iterations
		required: true,
	},
	type: {
		type: String,
		enum: ['like', 'pass'],
		required: true,
	},
}, { timestamps: true });

// Ensure a user can only interact with another user once
InteractionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model('Interaction', InteractionSchema);
