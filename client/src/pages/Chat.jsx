import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useSearchParams } from 'react-router-dom';
import { getAvatarSrc } from '../services/avatar';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import './Chat.css';

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const myUserId = user?.id || user?._id;


  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const prevMsgCountRef = useRef(0);

  /* -------------------------------
     LOAD CONVERSATIONS
  -------------------------------- */
  const loadConversations = async () => {
    const res = await chatAPI.getConversations();
    setConversations(res.data || []);
  };

  useEffect(() => {
    (async () => {
      await loadConversations();
      setLoading(false);
    })();
  }, []);

  /* -------------------------------
     POLL CONVERSATIONS
  -------------------------------- */
  useEffect(() => {
    const interval = setInterval(loadConversations, 1000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------
     POLL MESSAGES (SMART SCROLL)
  -------------------------------- */
  useEffect(() => {
    if (!activeId) return;

    const fetchMessages = async () => {
      const res = await chatAPI.getMessages(activeId);
      const newMessages = res.data.messages || [];

      const prevCount = prevMsgCountRef.current;
      const newCount = newMessages.length;

      setMessages(prev => {
        const existing = prev[activeId] || [];

        // Keep optimistic messages not yet confirmed by server
        const optimistic = existing.filter(
          m => m._id?.startsWith('temp-')
        );

        return {
          ...prev,
          [activeId]: [...newMessages, ...optimistic],
        };
      });


      // 🔴 ONLY SCROLL IF NEW MESSAGE ARRIVED
      if (newCount > prevCount && shouldAutoScrollRef.current) {
        scrollBottom();
      }

      prevMsgCountRef.current = newCount;
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [activeId]);

  /* -------------------------------
     TRACK USER SCROLL
  -------------------------------- */
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 120;
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

      shouldAutoScrollRef.current = atBottom;
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  /* -------------------------------
     OPEN FROM MATCHES
  -------------------------------- */
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if (!conversationId) return;

    openConversation(conversationId);
    setSearchParams({});
  }, []);

  /* -------------------------------
     OPEN CHAT
  -------------------------------- */
  const openConversation = async (conversationId) => {
    setActiveId(conversationId);
    shouldAutoScrollRef.current = true;
    prevMsgCountRef.current = 0;

    // 1️⃣ Mark messages as read
    await chatAPI.readConversation(conversationId);

    // 2️⃣ Fetch messages
    const res = await chatAPI.getMessages(conversationId);
    setMessages(prev => ({
      ...prev,
      [conversationId]: res.data.messages,
    }));

    // 3️⃣ Refresh conversations (updates unreadCount)
    await loadConversations();

    scrollBottom();
  };


  const getOtherUser = convo => {
    if (!convo?.participants?.length) return null;
    return convo.participants.find(
      p => String(p._id) !== String(myUserId)
    ) || null;
  };

  /* -------------------------------
     SEND MESSAGE
  -------------------------------- */
  const handleSend = async () => {
    if (!input.trim() || !activeId) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      content: input,
      senderId: { _id: myUserId },
      createdAt: new Date().toISOString(),
    };

    // 🔴 INSTANT UI UPDATE
    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), optimisticMessage],
    }));

    setInput('');
    shouldAutoScrollRef.current = true;
    scrollBottom();

    try {
      const saved = await chatAPI.sendMessage(activeId, optimisticMessage.content);

      setMessages(prev => ({
        ...prev,
        [activeId]: prev[activeId].filter(m => m._id !== tempId),
      }));

    } catch (err) {
      // Optional: remove optimistic message on failure
      setMessages(prev => ({
        ...prev,
        [activeId]: prev[activeId].filter(m => m._id !== tempId),
      }));
    }
  };


  if (loading) {
    return (
      <>
        <Navbar />
        <div className="chat-loading">Loading chats…</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="chat-container">
        <div className="chat-sidebar">
          <h2>Messages</h2>

          {
            conversations.map(c => {
              const other = getOtherUser(c);
              if (!other) return null;

              return (
                <div key={c.conversationId}
                  className={`conversation ${activeId === c.conversationId ? 'active' : ''
                    }`}
                  onClick={() => openConversation(c.conversationId)}
                >
                  <img
                    className="chat-avatar"
                    src={getAvatarSrc(other.profileImage)}
                    alt={other.fullName}
                  />

                  <div className="conversation-info">
                    <div className="name">{other.fullName}</div>
                    <div className="preview">{c.lastMessage}</div>
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="badge">{c.unreadCount}</span>
                  )}
                </div>
              );
            })
          }
        </div>

        <div className="chat-main">
          {!activeId && (
            <div className="empty-chat">Select a conversation</div>
          )}

          {activeId && (
            <>
              <div
                className="chat-messages"
                ref={chatContainerRef}
              >
                {(messages[activeId] || []).map(m => (
                  <div
                    key={m._id}
                    className={`message ${m.senderId._id === myUserId ? 'sent' : 'received'
                      }`}
                  >
                    {m.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  autoFocus
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message…"
                />
                <button onClick={handleSend}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
