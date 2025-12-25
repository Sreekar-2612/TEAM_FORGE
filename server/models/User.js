const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	fullName: {
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
		enum: ['student', 'admin'],
		default: 'student',
	},
	bio: {
		type: String,
	},
	skills: {
		type: [String], // Array of strings e.g. ["JavaScript", "React"]
		default: [],
	},
	interests: {
		type: [String], // Array of strings e.g. ["AI", "FinTech"]
		default: [],
	},
	availability: {
		type: String,
		enum: ['High', 'Medium', 'Low'],
		default: 'Medium',
	},
	teams: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
	}],
	aiMatchScores: [
		{
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
			score: {
				type: Number, // 0–100
				required: true,
			},
			reasoning: {
				type: String, // optional, future use
			},
			updatedAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
