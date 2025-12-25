import { useState, useRef, useEffect } from 'react';
import './SwipeCard.css';

function SwipeCard({ candidate, index, onLike, onPass }) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isLeaving, setIsLeaving] = useState(false);

  const startPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    currentPosRef.current = currentPos;
  }, [currentPos]);

  const getAvailabilityColor = (availability) => {
    if (availability === 'High') return '#4caf50';
    if (availability === 'Medium') return '#ff9800';
    if (availability === 'Low') return '#f44336';
    return '#666';
  };

  if (index !== 0) {
    return (
      <div
        className="swipe-card"
        style={{
          transform: `rotate(${index * 2}deg) scale(${1 - index * 0.05})`,
          opacity: 1 - index * 0.3,
          zIndex: 10 - index,
        }}
      >
        <div className="card-header">
          <div className="compatibility-badge">
            {candidate.compatibility}% Match
            {candidate.matchExplanation && (
              <span className="match-info" title={candidate.matchExplanation}>
                ✨
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleStart = (x, y) => {
    setIsDragging(true);
    startPosRef.current = { x, y };
    setCurrentPos({ x: 0, y: 0 });
  };

  const handleMove = (x, y) => {
    if (!isDragging) return;
    setCurrentPos({
      x: x - startPosRef.current.x,
      y: y - startPosRef.current.y,
    });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    const { x } = currentPosRef.current;

    if (Math.abs(x) > 100) {
      setIsLeaving(true);
      setTimeout(() => (x > 0 ? onLike() : onPass()), 300);
    } else {
      setCurrentPos({ x: 0, y: 0 });
    }
    setIsDragging(false);
  };

  return (
    <div
      className={`swipe-card active ${isLeaving ? 'leaving' : ''}`}
      style={{
        transform: `translate(${currentPos.x}px, ${currentPos.y}px) rotate(${currentPos.x * 0.1}deg)`,
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onTouchStart={(e) =>
        handleStart(e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchMove={(e) =>
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchEnd={handleEnd}
    >
      <div className="card-header">
        <div className="compatibility-badge">
          {candidate.compatibility}% Match
          {candidate.matchExplanation && (
            <span className="match-info" title={candidate.matchExplanation}>
              ✨
            </span>
          )}
        </div>
      </div>

      <div className="card-content">
        <h2>{candidate.fullName}</h2>
        {candidate.bio && <p className="bio">{candidate.bio}</p>}
        <span
          className="availability-badge"
          style={{ backgroundColor: getAvailabilityColor(candidate.availability) }}
        >
          {candidate.availability} Availability
        </span>
      </div>
    </div>
  );
}

export default SwipeCard;
