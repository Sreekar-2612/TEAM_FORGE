const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/* =========================
   MATCH EXPLANATION
========================= */
const generateExplanation = (currentUser, candidate) => {
  const reasons = [];

  const commonSkills = currentUser.skills.filter(s =>
    candidate.skills.includes(s)
  );
  if (commonSkills.length > 0) {
    reasons.push(`skills like ${commonSkills.slice(0, 2).join(', ')}`);
  }

  const commonInterests = currentUser.interests.filter(i =>
    candidate.interests.includes(i)
  );
  if (commonInterests.length > 0) {
    reasons.push(`interests such as ${commonInterests.slice(0, 2).join(', ')}`);
  }

  if (currentUser.availability === candidate.availability) {
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
  let score = 0;

  const commonSkills = currentUser.skills.filter(skill =>
    candidate.skills.includes(skill)
  );
  score +=
    (commonSkills.length / Math.max(currentUser.skills.length, 1)) * 50;

  const commonInterests = currentUser.interests.filter(interest =>
    candidate.interests.includes(interest)
  );
  score +=
    (commonInterests.length /
      Math.max(currentUser.interests.length, 1)) *
    30;

  if (currentUser.availability === candidate.availability) {
    score += 20;
  } else if (
    (currentUser.availability === 'High' &&
      candidate.availability === 'Medium') ||
    (currentUser.availability === 'Medium' &&
      candidate.availability === 'High')
  ) {
    score += 10;
  }

  return Math.round(score);
};

/* =========================
   GET CANDIDATES
========================= */
router.get('/candidates', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user);
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
   SWIPE HANDLER (UNCHANGED)
========================= */
router.post('/swipe', auth, async (req, res) => {
  const { targetId, type } = req.body;

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
      if (!outgoing) {
        await Interaction.create({
          senderId: req.user,
          receiverId: targetId,
          type: 'like',
        });
      }

      const conversationId = [req.user, targetId].sort().join('_');

      await Conversation.updateOne(
        { conversationId },
        {
          $setOnInsert: {
            conversationId,
            participants: [req.user, targetId],
            lastMessage: 'You are now matched 🎉',
            lastMessageAt: new Date(),
          },
        },
        { upsert: true }
      );

      await Message.create({
        conversationId,
        senderId: req.user,
        receiverId: targetId,
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
