const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/* ---------------- GET CONVERSATIONS ---------------- */
router.get('/conversations', auth, async (req, res) => {
    const userId = req.user;

    const conversations = await Conversation.find({
        participants: userId,
    })
        .populate('participants', 'fullName profileImage')
        .sort({ lastMessageAt: -1 });

    const result = await Promise.all(
        conversations.map(async c => {
            const unreadCount = await Message.countDocuments({
                conversationId: c.conversationId,
                receiverId: userId,
                read: false,
            });

            return {
                conversationId: c.conversationId,
                participants: c.participants,
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt,
                unreadCount,
            };
        })
    );

    res.json(result);
});

/* ---------------- GET MESSAGES ---------------- */
router.get('/messages/:conversationId', auth, async (req, res) => {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
        .populate('senderId', 'fullName profileImage')
        .sort({ createdAt: 1 });

    res.json({ messages });
});

/* ---------------- SEND MESSAGE ---------------- */
router.post('/messages/:conversationId', auth, async (req, res) => {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user;

    if (!content?.trim()) {
        return res.status(400).json({ message: 'Empty message' });
    }

    const [a, b] = conversationId.split('_');
    const receiverId = a === senderId ? b : a;

    const message = await Message.create({
        conversationId,
        senderId,
        receiverId,
        content,
        read: false,
    });

    await Conversation.findOneAndUpdate(
        { conversationId },
        {
            $setOnInsert: { conversationId, participants: [senderId, receiverId] },
            lastMessage: content.slice(0, 100),
            lastMessageAt: new Date(),
        },
        { upsert: true }
    );

    res.status(201).json(message);
});

/* ---------------- MARK AS READ ---------------- */
router.post('/read/:conversationId', auth, async (req, res) => {
    await Message.updateMany(
        {
            conversationId: req.params.conversationId,
            receiverId: req.user,
            read: false,
        },
        { $set: { read: true } }
    );

    res.json({ success: true });
});

module.exports = router;
