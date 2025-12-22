import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          🔗 CollabQuest
        </Link>
        
        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">Discover</Link>
          <Link to="/matches" className="nav-link">Matches</Link>
          <Link to="/chat" className="nav-link">Chat</Link>
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

