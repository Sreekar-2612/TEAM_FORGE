import { useState } from 'react'
import Navbar from '../components/Navbar'
import './Chat.css'

function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        text: newMessage,
        sender: 'You',
        timestamp: new Date().toLocaleTimeString()
      }])
      setNewMessage('')
    }
  }

  return (
    <>
      <Navbar />
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-header">
            <h1>Team Chat</h1>
            <p>Communicate with your matched teammates</p>
          </div>

          <div className="chat-placeholder">
            <div className="chat-icon">💬</div>
            <h2>Chat Feature Coming Soon</h2>
            <p>Team-based messaging will be available here</p>
            <div className="chat-info">
              <p>This feature will include:</p>
              <ul>
                <li>Real-time messaging with matches</li>
                <li>Team-based group chats</li>
                <li>Project collaboration boards</li>
                <li>File sharing capabilities</li>
              </ul>
            </div>
          </div>

          {/* Chat UI (commented out until backend is ready) */}
          {false && (
            <div className="chat-window">
              <div className="messages-list">
                {messages.map((msg) => (
                  <div key={msg.id} className="message">
                    <div className="message-header">
                      <span className="message-sender">{msg.sender}</span>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                ))}
              </div>
              <form className="message-input" onSubmit={handleSend}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Chat

