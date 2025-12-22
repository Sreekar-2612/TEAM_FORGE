const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Interaction = require('../models/Interaction');


const calculateScore = (currentUser, candidate) => {
	let score = 0;

	const commonSkills = currentUser.skills.filter(skill => candidate.skills.includes(skill));
	if (commonSkills.length > 0) {
		const ratio = commonSkills.length / Math.max(currentUser.skills.length, 1);
		score += Math.min(ratio, 1) * 50;
	}

	const commonInterests = currentUser.interests.filter(interest =>
		candidate.interests.includes(interest)
	);

	if (commonInterests.length > 0) {
		const ratio = commonInterests.length / Math.max(currentUser.interests.length, 1);
		score += Math.min(ratio, 1) * 30;
	}

	if (currentUser.availability === candidate.availability) {
		score += 20
	} else if ((currentUser.availability === 'High' && candidate.availability === 'Medium') || (currentUser.availability === 'Medium' && candidate.availability === 'High')) {
		score += 10
	}
	return Math.round(score);
};


router.get('/candidates', auth, async (req, res) => {
	try {
		const currentUser = await User.findById(req.user);
		const interactions = await Interaction.find({ senderId: req.user });
		const swipedIds = interactions.map(i => i.receiverId.toString());


		swipedIds.push(req.user);
		const candidates = await User.find({
			_id: { $nin: swipedIds },
			role: 'student'
		}).select('-password');

		const scoredCandidates = candidates.map(candidate => {
			const score = calculateScore(currentUser, candidate);
			return { ...candidate.toObject(), compatibility: score };
		});
		scoredCandidates.sort((a, b) => b.compatibility - a.compatibility);
		res.json(scoredCandidates);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   POST /api/matches/swipe
// @desc    Record a Like or Pass
// @access  Private
router.post('/swipe', auth, async (req, res) => {
	const { targetId, type } = req.body; // type: 'like' or 'pass'
	try {
		let interaction = await Interaction.findOne({
			senderId: req.user,
			receiverId: targetId
		});
		if (interaction) {
			return res.status(400).json({ msg: 'Already swiped on this user' });
		}

		interaction = new Interaction({
			senderId: req.user,
			receiverId: targetId,
			type
		});
		await interaction.save();

		let isMatch = false;
		if (type === 'like') {
			const reverseInteraction = await Interaction.findOne({
				senderId: targetId,
				receiverId: req.user,
				type: 'like'
			});

			if (reverseInteraction) {
				isMatch = true;

			}
		}
		res.json({ success: true, isMatch });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});
module.exports = router;