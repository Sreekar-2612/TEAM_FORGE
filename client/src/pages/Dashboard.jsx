import { useState, useEffect } from 'react';
import { matchingAPI, teamAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SwipeCard from '../components/SwipeCard';
import './Dashboard.css';

function Dashboard() {
  const [candidates, setCandidates] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [matchNotification, setMatchNotification] = useState(false)
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    loadCandidates()
  }, [])

  useEffect(() => {
    teamAPI.getMyTeams().then(res => {
      setTeams(res.data || []);
    });
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true)
      const res = await matchingAPI.getCandidates()
      setCandidates(res.data)
      setCurrentIndex(0)
    } catch (err) {
      setError('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = (action) => {
    if (currentIndex >= candidates.length) return;

    const candidate = candidates[currentIndex];

    // 1️⃣ Advance UI immediately
    setCurrentIndex(i => i + 1);

    // 2️⃣ Fire API in background
    matchingAPI
      .swipe(candidate._id, action)
      .then(res => {
        if (res.data.isMatch) {
          setMatchNotification({
            name: candidate.fullName,
            message: "It's a match! 🎉",
          });
          setTimeout(() => setMatchNotification(null), 4000);
        }
      })
      .catch(err => {
        console.error('Swipe error:', err);
      });
  };


  const handleLike = () => handleSwipe('like')
  const handlePass = () => handleSwipe('pass')

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-loading">
          <div className="spinner" />
          <p>Finding teammates…</p>
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
          <button onClick={loadCandidates}>Retry</button>
        </div>
      </>
    )
  }

  if (candidates.length === 0) {
    return (
      <>
        <Navbar />
        <div className="dashboard-wrapper">
          <div className="dashboard-empty">
            <h2>No more candidates</h2>
            <button onClick={loadCandidates}>Refresh</button>
          </div>
        </div>
      </>
    )
  }

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
            <h2>{matchNotification.message}</h2>
            <p>You and {matchNotification.name} liked each other</p>
          </div>
        )}

        <div className="swipe-container">
          {candidates
            .slice(currentIndex, currentIndex + 3)
            .map((candidate, idx) => (
              <SwipeCard
                key={candidate._id}
                candidate={candidate}
                index={idx}
                onLike={handleLike}
                onPass={handlePass}
              />
            ))}
        </div>
      </div>
    </>
  )
}

export default Dashboard
