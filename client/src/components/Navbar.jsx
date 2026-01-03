import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { chatAPI, matchAPI } from '../services/api';
import './Navbar.css';

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadChats, setUnreadChats] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* -------------------------------
     CHAT UNREAD (SOURCE OF TRUTH)
  -------------------------------- */
  const fetchUnreadChats = async () => {
    try {
      const res = await chatAPI.getConversations();
      const total = (res.data || []).reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );
      setUnreadChats(total);
    } catch (err) {
      console.error('Failed to fetch unread chats', err);
    }
  };

  /* -------------------------------
     MATCH REQUESTS
  -------------------------------- */
  const fetchIncoming = async () => {
    try {
      const res = await matchAPI.getRequests();
      setIncomingCount(res.data.length);
    } catch (err) {
      console.error('Failed to fetch incoming requests');
    }
  };

  /* -------------------------------
     INIT + POLL
  -------------------------------- */
  useEffect(() => {
    fetchUnreadChats();
    fetchIncoming();

    const interval = setInterval(fetchUnreadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------
     REFRESH ON ROUTE CHANGE
  -------------------------------- */
  useEffect(() => {
    fetchUnreadChats();
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          🔗 CollabQuest
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">Discover</Link>

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

          <NavLink
            to="/teams"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-active' : ''}`
            }
          >
            Teams
          </NavLink>

          <Link to="/profile" className="nav-link">Profile</Link>

          <button onClick={handleLogout} className="nav-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
