import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

/* -------------------------------
   CONNECTION
-------------------------------- */
export const connectSocket = () => {
    if (socket) return socket;

    const token = localStorage.getItem('token');

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('Socket connected');
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/* -------------------------------
   EMITS
-------------------------------- */
export const joinConversation = (conversationId) => {
    socket?.emit('join_conversation', { conversationId });
};

export const sendMessage = (conversationId, receiverId, content) => {
    socket?.emit('send_message', {
        conversationId,
        receiverId,
        content,
    });
};

export const markAsRead = (conversationId) => {
    socket?.emit('mark_read', { conversationId });
};

export const sendTyping = (conversationId, receiverId) => {
    socket?.emit('typing', { conversationId, receiverId });
};

/* -------------------------------
   LISTENERS
-------------------------------- */
export const onNewMessage = (cb) => {
    socket?.on('new_message', cb);
};

export const onUserTyping = (cb) => {
    socket?.on('user_typing', cb);
};

export const onMessagesRead = (cb) => {
    socket?.on('messages_read', cb);
};

export const onUserOnline = (cb) => {
    socket?.on('user_online', cb);
};

export const onUserOffline = (cb) => {
    socket?.on('user_offline', cb);
};

/* -------------------------------
   CLEANUP
-------------------------------- */
export const offEvent = (event, cb) => {
    socket?.off(event, cb);
};
