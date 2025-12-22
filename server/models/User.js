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
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
