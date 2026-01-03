const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const requireCompleteProfile = require('../middleware/requireCompleteProfile');

/* =========================
   SAFE NORMALIZER
========================= */
const normalizeUser = (u) => ({
    skills: Array.isArray(u.skills) ? u.skills : [],
    interests: Array.isArray(u.interests) ? u.interests : [],
    availability: u.availability || '',
});

/* =========================
   MATCH EXPLANATION
========================= */
const generateExplanation = (currentUser, candidate) => {
    const cu = normalizeUser(currentUser);
    const ca = normalizeUser(candidate);

    const reasons = [];

    const commonSkills = cu.skills.filter(s => ca.skills.includes(s));
    if (commonSkills.length) {
        reasons.push(`skills like ${commonSkills.slice(0, 2).join(', ')}`);
    }

    const commonInterests = cu.interests.filter(i =>
        ca.interests.includes(i)
    );
    if (commonInterests.length) {
        reasons.push(`interests such as ${commonInterests.slice(0, 2).join(', ')}`);
    }

    if (cu.availability && cu.availability === ca.availability) {
        reasons.push('similar availability');
    }

    return reasons.length
        ? `Matched because you share ${reasons.join(' and ')}`
        : 'General profile compatibility';
};

/* =========================
   SCORE CALCULATION
========================= */
const calculateScore = (currentUser, candidate) => {
    const cu = normalizeUser(currentUser);
    const ca = normalizeUser(candidate);

    let score = 0;

    if (cu.skills.length) {
        const commonSkills = cu.skills.filter(s => ca.skills.includes(s));
        score += (commonSkills.length / cu.skills.length) * 50;
    }

    if (cu.interests.length) {
        const commonInterests = cu.interests.filter(i =>
            ca.interests.includes(i)
        );
        score += (commonInterests.length / cu.interests.length) * 30;
    }

    if (cu.availability && cu.availability === ca.availability) {
        score += 20;
    } else if (
        (cu.availability === 'High' && ca.availability === 'Medium') ||
        (cu.availability === 'Medium' && ca.availability === 'High')
    ) {
        score += 10;
    }

    return Math.round(score);
};

/* =========================
   GET CANDIDATES
========================= */
router.get('/candidates', auth, requireCompleteProfile, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user);
        if (!currentUser) {
            return res.status(401).json({ msg: 'User not found' });
        }

        const interactions = await Interaction.find({ senderId: req.user });
        const swipedIds = interactions.map(i => i.receiverId.toString());
        swipedIds.push(req.user.toString());

        const candidates = await User.find({
            _id: { $nin: swipedIds },
            role: 'student',
        }).select('-password');

        const enriched = candidates.map(c => ({
            ...c.toObject(),
            compatibility: calculateScore(currentUser, c),
            matchExplanation: generateExplanation(currentUser, c),
        }));

        enriched.sort((a, b) => b.compatibility - a.compatibility);
        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/* =========================
   INCOMING REQUESTS
   (They liked you, you haven't responded)
========================= */
router.get('/incoming', auth, async (req, res) => {
    try {
        const incoming = await Interaction.find({
            receiverId: req.user,
            senderId: { $ne: me },
            type: 'like',
        }).populate('senderId', 'fullName profileImage');

        res.json(incoming.map(i => i.senderId));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch incoming requests' });
    }
});

/* =========================
   PENDING REQUESTS
   (You liked them, they haven't responded)
========================= */
router.get('/pending', auth, async (req, res) => {
    try {
        const pending = await Interaction.find({
            senderId: req.user,
            receiverId: { $ne:me },
            type: 'like',
        }).populate('receiverId', 'fullName profileImage');

        res.json(pending.map(i => i.receiverId));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch pending requests' });
    }
});


/* =========================
   SWIPE HANDLER
========================= */
router.post('/swipe', auth, requireCompleteProfile, async (req, res) => {
    const { targetId, type } = req.body;

    const me = new mongoose.Types.ObjectId(req.user);
    const them = new mongoose.Types.ObjectId(targetId);


    try {
        const incoming = await Interaction.findOne({
            senderId: targetId,
            receiverId: req.user,
            type: 'like',
        });

        const outgoing = await Interaction.findOne({
            senderId: req.user,
            receiverId: targetId,
        });

        if (type === 'pass' && incoming) {
            await incoming.deleteOne();
            return res.json({ success: true, ignored: true });
        }

        if (type === 'like' && incoming) {

            // ✅ DELETE INTERACTIONS — NOW ACTUALLY MATCHES
            await Interaction.deleteMany({
                $or: [
                    { senderId: me, receiverId: them },
                    { senderId: them, receiverId: me },
                ],
            });

            const conversationId = [me.toString(), them.toString()].sort().join('_');

            await Conversation.updateOne(
                { conversationId },
                {
                    $setOnInsert: {
                        conversationId,
                        participants: [me, them],
                        lastMessage: 'You are now matched 🎉',
                        lastMessageAt: new Date(),
                    },
                },
                { upsert: true }
            );

            await Message.create({
                conversationId,
                senderId: me,
                receiverId: them,
                content: 'You are now matched 🎉',
                read: false,
            });

            return res.json({ success: true, isMatch: true });
        }

        if (outgoing) {
            return res.status(400).json({ msg: 'Already swiped on this user' });
        }

        await Interaction.create({
            senderId: req.user,
            receiverId: targetId,
            type,
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
