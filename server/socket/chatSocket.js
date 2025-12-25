const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Interaction = require('../models/Interaction');
const onlineUsers = new Set();

const getConversationId = (a, b) => {
    return [a.toString(), b.toString()].sort().join('_');
};

const areMatched = async (userA, userB) => {
    const likeAB = await Interaction.findOne({
        senderId: userA,
        receiverId: userB,
        type: 'like',
    });

    const likeBA = await Interaction.findOne({
        senderId: userB,
        receiverId: userA,
        type: 'like',
    });

    return !!(likeAB && likeBA);
};

module.exports = (io) => {
    io.on('connection', (socket) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return socket.disconnect(true);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;
            socket.userId = userId;

            onlineUsers.add(socket.userId.toString());
            io.emit('user_online', socket.userId.toString());

            socket.join(userId.toString());
            console.log(`User ${userId} connected`);

            socket.on('typing', ({ conversationId, receiverId }) => {
                socket.to(receiverId.toString()).emit('user_typing', {
                    conversationId,
                    userId: socket.userId,
                });
            });


            /**
             * Join a conversation room
             */
            socket.on('join_conversation', ({ conversationId }) => {
                if (!conversationId || !conversationId.includes('_')) return;
                socket.join(conversationId);
            });

            /**
             * Send a message
             */
            socket.on('send_message', async ({ receiverId, content }) => {
                try {
                    if (!receiverId || !content?.trim()) return;

                    if (content.length > 2000) {
                        return socket.emit('error', { message: 'Message too long' });
                    }

                    const matched = await areMatched(userId, receiverId);
                    if (!matched) {
                        return socket.emit('error', {
                            message: 'You are not matched with this user',
                        });
                    }

                    const conversationId = getConversationId(userId, receiverId);

                    const message = await Message.create({
                        conversationId,
                        senderId: userId,
                        receiverId,
                        content,
                        read: false,
                    });

                    await Conversation.findOneAndUpdate(
                        { conversationId },
                        {
                            $setOnInsert: {
                                conversationId,
                                participants: [userId, receiverId],
                            },
                            lastMessage: content.slice(0, 100),
                            lastMessageAt: new Date(),
                        },
                        { upsert: true, new: true }
                    );

                    const populatedMessage = await message.populate(
                        'senderId',
                        'fullName'
                    );

                    io.to(userId.toString()).emit('new_message', populatedMessage);
                    io.to(receiverId.toString()).emit('new_message', populatedMessage);
                } catch (err) {
                    console.error(err);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            /**
             * Mark messages as read
             */
            socket.on('mark_read', async ({ conversationId }) => {
                try {
                    if (!conversationId) return;

                    await Message.updateMany(
                        {
                            conversationId,
                            receiverId: userId,
                            read: false,
                        },
                        { $set: { read: true } }
                    );

                    socket.broadcast.emit('messages_read', { conversationId });
                } catch (err) {
                    console.error(err);
                }
            });

            /**
             * Typing indicator
             */
            socket.on('typing', ({ conversationId, receiverId }) => {
                if (!conversationId || !receiverId) return;

                socket.to(receiverId.toString()).emit('user_typing', {
                    conversationId,
                    userId,
                });
            });

            socket.on('disconnect', () => {
                onlineUsers.delete(socket.userId.toString());
                io.emit('user_offline', socket.userId.toString());
                console.log(`User ${userId} disconnected`);
            });
        } catch (err) {
            console.error('Socket error:', err.message);
            socket.disconnect(true);
        }
    });
};
