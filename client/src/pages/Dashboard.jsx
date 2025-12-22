import { useState, useEffect } from 'react'
import { matchingAPI } from '../services/api'
import Navbar from '../components/Navbar'
import SwipeCard from '../components/SwipeCard'
import './Dashboard.css'

function Dashboard() {
  const [candidates, setCandidates] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [matchNotification, setMatchNotification] = useState(null)

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    try {
      setLoading(true)
      const response = await matchingAPI.getCandidates()
      setCandidates(response.data)
      setCurrentIndex(0)
    } catch (err) {
      setError('Failed to load candidates')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (action) => {
    if (currentIndex >= candidates.length) return

    const candidate = candidates[currentIndex]
    
    try {
      const response = await matchingAPI.swipe(candidate._id, action)
      
      if (response.data.isMatch) {
        setMatchNotification({
          name: candidate.fullName,
          message: "It's a match! 🎉"
        })
        setTimeout(() => setMatchNotification(null), 5000)
      }

      // Move to next candidate
      if (currentIndex < candidates.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // No more candidates
        setCandidates([])
        setCurrentIndex(0)
        loadCandidates()
      }
    } catch (err) {
      console.error('Swipe error:', err)
    }
  }

  const handlePass = () => handleSwipe('pass')
  const handleLike = () => handleSwipe('like')

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Finding your perfect teammates...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={loadCandidates}>Try Again</button>
        </div>
      </>
    )
  }

  if (candidates.length === 0) {
    return (
      <>
        <Navbar />
        <div className="dashboard-empty">
          <h2>No more candidates!</h2>
          <p>Check back later for new matches.</p>
          <button onClick={loadCandidates}>Refresh</button>
        </div>
      </>
    )
  }

  const currentCandidate = candidates[currentIndex]

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Discover Teammates</h1>
          <p>Swipe right to like, left to pass</p>
        </div>

        {matchNotification && (
          <div className="match-notification">
            <div className="match-content">
              <h2>{matchNotification.message}</h2>
              <p>You and {matchNotification.name} liked each other!</p>
            </div>
          </div>
        )}

        <div className="swipe-container">
          {candidates.slice(currentIndex, currentIndex + 3).map((candidate, idx) => (
            <SwipeCard
              key={candidate._id}
              candidate={candidate}
              index={idx}
              onLike={handleLike}
              onPass={handlePass}
            />
          ))}
        </div>

        <div className="swipe-actions">
          <button className="swipe-button pass" onClick={handlePass}>
            ✕ Pass
          </button>
          <button className="swipe-button like" onClick={handleLike}>
            ♥ Like
          </button>
        </div>
      </div>
    </>
  )
}

export default Dashboard

