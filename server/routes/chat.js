const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Interaction = require('../models/Interaction');
const User = require('../models/User');

/**
 * GET /api/chat/conversations
 * Get all conversations for current user
 */
router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.user;

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate('participants', 'fullName email bio skills')
            .sort({ lastMessageAt: -1 });

        const result = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversationId: conv.conversationId,
                    receiverId: userId,
                    read: false,
                });

                return {
                    conversationId: conv.conversationId,
                    participants: conv.participants,
                    lastMessageAt: conv.lastMessageAt,
                    lastMessage: conv.lastMessage,
                    unreadCount,
                };
            })
        );

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * GET /api/chat/messages/:conversationId
 * Get messages for a conversation
 */
router.get('/messages/:conversationId', auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user;

        const userIds = conversationId.split('_');
        if (!userIds.includes(userId.toString())) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const before = req.query.before;

        const query = { conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('senderId', 'fullName')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            messages: messages.reverse(),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * GET /api/chat/matches
 * Get all matched users
 */
router.get('/matches', auth, async (req, res) => {
    try {
        // All likes sent by user
        const sentLikes = await Interaction.find({
            senderId: req.user,
            type: 'like',
        });

        const sentIds = sentLikes.map(i => i.receiverId.toString());

        // All likes received by user
        const receivedLikes = await Interaction.find({
            receiverId: req.user,
            type: 'like',
        });

        const receivedIds = receivedLikes.map(i => i.senderId.toString());

        // Mutual likes = matches
        const matchedIds = sentIds.filter(id =>
            receivedIds.includes(id)
        );

        if (matchedIds.length === 0) {
            return res.json([]);
        }

        const users = await User.find({
            _id: { $in: matchedIds },
        }).select('-password');

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/chat/requests
router.get('/requests', auth, async (req, res) => {
    try {
        const incomingLikes = await Interaction.find({
            receiverId: req.user,
            type: 'like',
        });

        const requesterIds = incomingLikes.map(i => i.senderId);

        const mutualLikes = await Interaction.find({
            senderId: req.user,
            receiverId: { $in: requesterIds },
            type: 'like',
        });

        const mutualIds = new Set(
            mutualLikes.map(i => i.receiverId.toString())
        );

        const requests = await User.find({
            _id: { $in: requesterIds, $nin: [...mutualIds] },
        }).select('-password');

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// GET /api/chat/pending
router.get('/pending', auth, async (req, res) => {
    try {
        const outgoingLikes = await Interaction.find({
            senderId: req.user,
            type: 'like',
        });

        const receiverIds = outgoingLikes.map(i => i.receiverId);

        const reverseLikes = await Interaction.find({
            senderId: { $in: receiverIds },
            receiverId: req.user,
            type: 'like',
        });

        const matchedIds = new Set(
            reverseLikes.map(i => i.senderId.toString())
        );

        const pending = await User.find({
            _id: { $in: receiverIds, $nin: [...matchedIds] },
        }).select('-password');

        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
