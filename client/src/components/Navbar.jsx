import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { chatAPI } from '../services/api';
import { matchAPI } from '../services/api'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadChats, setUnreadChats] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const fetchUnreadChats = async () => {
    try {
      const res = await chatAPI.getConversations();
      const total = res.data.reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );
      setUnreadChats(total);
    } catch { }
  };

  const fetchIncoming = async () => {
    try {
      const res = await matchAPI.getRequests()
      setIncomingCount(res.data.length)
    } catch (err) {
      console.error('Failed to fetch incoming requests')
    }
  }

  useEffect(() => {
    fetchUnreadChats();

    const handler = () => fetchUnreadChats();
    window.addEventListener('refreshChats', handler);
    return () => window.removeEventListener('refreshChats', handler);
  }, []);


  useEffect(() => {
    fetchIncoming()

    const handler = () => fetchIncoming()
    window.addEventListener('refreshRequests', handler)
    return () => window.removeEventListener('refreshRequests', handler)
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          🔗 CollabQuest
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">Discover</Link>

          {/* 🔴 BADGE INSERTED HERE (ONLY CHANGE IN UI) */}
          <Link
            to="/matches"
            className="nav-link"
            onClick={() => setIncomingCount(0)}
          >
            Matches
            {incomingCount > 0 && (
              <span className="nav-badge">{incomingCount}</span>
            )}
          </Link>

          <Link to="/chat" className="nav-link">
            Chat
            {unreadChats > 0 && (
              <span className="nav-badge">{unreadChats}</span>
            )}
          </Link>

          <Link to="/profile" className="nav-link">Profile</Link>

          <button onClick={handleLogout} className="nav-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
