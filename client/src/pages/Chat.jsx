import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import {
  connectSocket,
  disconnectSocket,
  joinConversation,
  sendMessage,
  sendTyping,
  markAsRead,
  onNewMessage,
  onUserTyping,
  onMessagesRead,
  onUserOnline,
  onUserOffline,
  offEvent,
} from '../services/socket';
import './Chat.css';

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [typingMap, setTypingMap] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const myUserId = user?._id;

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  /* -------------------------------
     INIT
  -------------------------------- */
  useEffect(() => {
    connectSocket();

    chatAPI.getConversations().then((res) => {
      setConversations(res.data);
      setLoading(false);
    });

    onNewMessage(handleNewMessage);
    onUserTyping(handleTyping);
    onMessagesRead(handleRead);
    onUserOnline((id) =>
      setOnlineUsers((prev) => new Set(prev).add(id))
    );
    onUserOffline((id) =>
      setOnlineUsers((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      })
    );

    return () => {
      offEvent('new_message', handleNewMessage);
      offEvent('user_typing', handleTyping);
      offEvent('messages_read', handleRead);
      offEvent('user_online');
      offEvent('user_offline');
      disconnectSocket();
    };
  }, []);

  /* -------------------------------
     OPEN CHAT FROM MATCHES
  -------------------------------- */
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (!userId || conversations.length === 0) return;

    const convo = conversations.find((c) =>
      c.participants.some((p) => p._id === userId)
    );

    if (convo) openConversation(convo.conversationId);
    setSearchParams({});
  }, [conversations]);

  /* -------------------------------
     HELPERS
  -------------------------------- */
  const openConversation = async (conversationId) => {
    setActiveId(conversationId);

    // 🔹 CLEAR UNREAD COUNT IMMEDIATELY (UI)
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conversationId
          ? { ...c, unreadCount: 0 }
          : c
      )
    );

    if (!messages[conversationId]) {
      const res = await chatAPI.getMessages(conversationId);
      setMessages((prev) => ({
        ...prev,
        [conversationId]: res.data.messages,
      }));
    }

    joinConversation(conversationId);
    markAsRead(conversationId);
    window.dispatchEvent(new Event('refreshChats'));
    scrollBottom();
  };


  const scrollBottom = () =>
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
      50
    );

  const getOtherUser = (convo) =>
    convo.participants.find((p) => p._id !== myUserId);

  /* -------------------------------
     SOCKET HANDLERS
  -------------------------------- */
  const handleNewMessage = (msg) => {
    // 1️⃣ Deduplicate messages
    setMessages((prev) => {
      const existing = prev[msg.conversationId] || [];
      if (existing.some((m) => m._id === msg._id)) return prev;

      return {
        ...prev,
        [msg.conversationId]: [...existing, msg].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        ),
      };
    });

    // 2️⃣ Correct unread logic
    setConversations((prev) =>
      prev
        .map((c) => {
          if (c.conversationId !== msg.conversationId) return c;

          const isActive = msg.conversationId === activeId;
          const isFromMe = msg.senderId?._id === myUserId;

          return {
            ...c,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            unreadCount: isActive || isFromMe ? 0 : c.unreadCount + 1,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        )
    );

    // 3️⃣ Mark read immediately if open
    if (msg.conversationId === activeId) {
      markAsRead(activeId);
    }

    window.dispatchEvent(new Event('refreshChats'));
    scrollBottom();
  };

  const handleTyping = ({ conversationId }) => {
    setTypingMap((p) => ({ ...p, [conversationId]: true }));
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(
      () => setTypingMap((p) => ({ ...p, [conversationId]: false })),
      2000
    );
  };

  const handleRead = ({ conversationId }) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conversationId
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  };

  /* -------------------------------
     SEND
  -------------------------------- */
  const handleSend = () => {
    if (!input.trim() || !activeId) return;

    const convo = conversations.find((c) => c.conversationId === activeId);
    if (!convo) return;

    const other = getOtherUser(convo);
    sendMessage(activeId, other._id, input);
    setInput('');
  };

  const handleTypingInput = () => {
    const convo = conversations.find((c) => c.conversationId === activeId);
    if (!convo) return;

    const other = getOtherUser(convo);
    sendTyping(activeId, other._id);
  };

  if (loading) return <div className="chat-loading">Loading chats…</div>;

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <div className="chat-sidebar">
        <h2>Messages</h2>

        {conversations.map((c) => {
          const other = getOtherUser(c);
          return (
            <div
              key={c.conversationId}
              className={`conversation ${activeId === c.conversationId ? 'active' : ''}`}
              onClick={() => openConversation(c.conversationId)}
            >
              <div className="name">
                {other.fullName}
                {onlineUsers.has(other._id) && <span className="online-dot" />}
              </div>
              <div className="preview">{c.lastMessage}</div>
              {c.unreadCount > 0 && (
                <span className="badge">{c.unreadCount}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* CHAT */}
      <div className="chat-main">
        {!activeId && (
          <div className="empty-chat">
            Select a conversation to start chatting
          </div>
        )}
        {activeId && (() => {
          const convo = conversations.find(c => c.conversationId === activeId);

          return (
            <>
              {convo?.matchExplanation && (
                <div className="match-explanation">
                  {convo.matchExplanation}
                </div>
              )}

              <div className="chat-messages">
                {(messages[activeId] || [])
                  .filter(m => m.conversationId === activeId)
                  .map((m) => (
                    <div
                      key={m._id}
                      className={`message ${m.system
                          ? 'system'
                          : m.senderId?._id === myUserId
                            ? 'sent'
                            : 'received'
                        }`}
                    >
                      {m.content}
                    </div>
                  ))}

                {typingMap[activeId] && (
                  <div className="typing">typing…</div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleTypingInput}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message…"
                />
                <button onClick={handleSend}>Send</button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
