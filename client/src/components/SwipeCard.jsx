import { useState, useRef, useEffect } from 'react'
import './SwipeCard.css'

function SwipeCard({ candidate, index, onLike, onPass }) {
  const [isDragging, setIsDragging] = useState(false)
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [isLeaving, setIsLeaving] = useState(false)
  const startPosRef = useRef({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'High': return '#4caf50'
      case 'Medium': return '#ff9800'
      case 'Low': return '#f44336'
      default: return '#666'
    }
  }

  // Only allow dragging the top card
  if (index !== 0) {
    const rotation = index * 2
    const scale = 1 - index * 0.05
    const opacity = 1 - index * 0.3

    return (
      <div
        className="swipe-card"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          opacity,
          zIndex: 10 - index
        }}
      >
        <div className="card-header">
          <div className="compatibility-badge">
            {candidate.compatibility}% Match
          </div>
        </div>
        <div className="card-content">
          <h2>{candidate.fullName}</h2>
          {candidate.bio && <p className="bio">{candidate.bio}</p>}
          <div className="availability">
            <span 
              className="availability-badge"
              style={{ backgroundColor: getAvailabilityColor(candidate.availability) }}
            >
              {candidate.availability} Availability
            </span>
          </div>
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="skills-section">
              <h3>Skills</h3>
              <div className="skills-list">
                {candidate.skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
          {candidate.interests && candidate.interests.length > 0 && (
            <div className="interests-section">
              <h3>Interests</h3>
              <div className="interests-list">
                {candidate.interests.map((interest, idx) => (
                  <span key={idx} className="interest-tag">{interest}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleStart = (clientX, clientY) => {
    setIsDragging(true)
    startPosRef.current = { x: clientX, y: clientY }
    setCurrentPos({ x: 0, y: 0 })
  }

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return
    
    const deltaX = clientX - startPosRef.current.x
    const deltaY = clientY - startPosRef.current.y
    
    setCurrentPos({ x: deltaX, y: deltaY })
  }

  const currentPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    currentPosRef.current = currentPos
  }, [currentPos])

  const handleEnd = () => {
    if (!isDragging) return

    const pos = currentPosRef.current
    const threshold = 100
    const absX = Math.abs(pos.x)
    const absY = Math.abs(pos.y)

    if (absX > threshold || absY > threshold) {
      setIsLeaving(true)
      
      // Determine direction
      if (pos.x > 0) {
        // Swiped right - Like
        setTimeout(() => {
          onLike()
        }, 300)
      } else {
        // Swiped left - Pass
        setTimeout(() => {
          onPass()
        }, 300)
      }
    } else {
      // Snap back
      setCurrentPos({ x: 0, y: 0 })
    }
    
    setIsDragging(false)
  }

  // Mouse events
  const onMouseDown = (e) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  // Touch events
  const onTouchStart = (e) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const onTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const onTouchEnd = () => {
    handleEnd()
  }

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => {
        handleMove(e.clientX, e.clientY)
      }
      
      const handleMouseUp = () => {
        handleEnd()
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const rotation = currentPos.x * 0.1
  const opacity = isLeaving ? 0 : 1
  const scale = isLeaving ? 0.8 : 1

  // Determine swipe direction for overlay
  const showLikeOverlay = currentPos.x > 50
  const showPassOverlay = currentPos.x < -50

  return (
    <div
      ref={cardRef}
      className={`swipe-card active ${isLeaving ? 'leaving' : ''}`}
      style={{
        transform: `translate(${currentPos.x}px, ${currentPos.y}px) rotate(${rotation}deg) scale(${scale})`,
        opacity,
        zIndex: 10
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {showLikeOverlay && (
        <div className="swipe-overlay like-overlay">
          <div className="overlay-content">LIKE</div>
        </div>
      )}
      {showPassOverlay && (
        <div className="swipe-overlay pass-overlay">
          <div className="overlay-content">PASS</div>
        </div>
      )}

      <div className="card-header">
        <div className="compatibility-badge">
          {candidate.compatibility}% Match
        </div>
      </div>

      <div className="card-content">
        <h2>{candidate.fullName}</h2>
        {candidate.bio && <p className="bio">{candidate.bio}</p>}
        
        <div className="availability">
          <span 
            className="availability-badge"
            style={{ backgroundColor: getAvailabilityColor(candidate.availability) }}
          >
            {candidate.availability} Availability
          </span>
        </div>

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="skills-section">
            <h3>Skills</h3>
            <div className="skills-list">
              {candidate.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {candidate.interests && candidate.interests.length > 0 && (
          <div className="interests-section">
            <h3>Interests</h3>
            <div className="interests-list">
              {candidate.interests.map((interest, idx) => (
                <span key={idx} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SwipeCard
