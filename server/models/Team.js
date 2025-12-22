const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	leader: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	members: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	}],
	seekingSkills: {
		type: [String], // Skills the team is looking for
		default: [],
	},
	isFull: {
		type: Boolean,
		default: false,
	},
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
