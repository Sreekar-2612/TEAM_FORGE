import { useState, useEffect } from 'react'
import { matchingAPI, userAPI } from '../services/api'
import Navbar from '../components/Navbar'
import './Matches.css'

function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      // For now, we'll show a placeholder since we need to implement match retrieval
      // In a real app, you'd have an endpoint like GET /api/matches
      setMatches([])
    } catch (error) {
      console.error('Failed to load matches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="matches-loading">Loading matches...</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="matches-page">
        <div className="matches-container">
          <div className="matches-header">
            <h1>Your Matches</h1>
            <p>People who liked you back</p>
          </div>

          {matches.length === 0 ? (
            <div className="no-matches">
              <div className="no-matches-icon">💔</div>
              <h2>No matches yet</h2>
              <p>Keep swiping to find your perfect teammates!</p>
            </div>
          ) : (
            <div className="matches-grid">
              {matches.map((match) => (
                <div key={match._id} className="match-card">
                  <h3>{match.fullName}</h3>
                  <p className="match-email">{match.email}</p>
                  {match.bio && <p className="match-bio">{match.bio}</p>}
                  {match.skills && match.skills.length > 0 && (
                    <div className="match-skills">
                      {match.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  )}
                  <button className="chat-button">Start Chat</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Matches

