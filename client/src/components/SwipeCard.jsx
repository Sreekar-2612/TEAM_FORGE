import { useState, useRef, useEffect } from 'react';
import { getAvatarSrc } from '../services/avatar';
import './SwipeCard.css';


const [leaving, setLeaving] = useState(null);

const resolveImage = (img) => {
  if (!img) return getAvatarSrc(null);
  if (img.startsWith('http')) return img;
  return `${import.meta.env.VITE_API_URL}${img}`;
};

function SwipeCard({ candidate, index, onLike, onPass }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const startRef = useRef({ x: 0, y: 0 });

  const startDrag = (x, y) => {
    if (index !== 0) return;
    setDragging(true);
    startRef.current = { x, y };
  };

  const moveDrag = (x, y) => {
    if (!dragging || index !== 0) return;
    setPos({
      x: x - startRef.current.x,
      y: y - startRef.current.y,
    });
  };

  const endDrag = () => {
    if (!dragging || index !== 0 || leaving) return;
    setDragging(false);

    if (pos.x > 120) {
      setLeaving('like');
      setTimeout(onLike, 250);
    } else if (pos.x < -120) {
      setLeaving('pass');
      setTimeout(onPass, 250);
    } else {
      setPos({ x: 0, y: 0 });
    }
  };


  useEffect(() => {
    if (!dragging) return;

    const mm = (e) => moveDrag(e.clientX, e.clientY);
    const mu = () => endDrag();
    const tm = (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    const tu = () => endDrag();

    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    window.addEventListener('touchmove', tm);
    window.addEventListener('touchend', tu);

    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend', tu);
    };
  }, [dragging, pos]);

  const style =
    index === 0
      ? {
        transform:
          leaving === 'like'
            ? 'translateX(120vw) rotate(20deg)'
            : leaving === 'pass'
              ? 'translateX(-120vw) rotate(-20deg)'
              : `translate(${pos.x}px, ${pos.y}px) rotate(${pos.x * 0.08}deg)`,
        transition: leaving ? 'transform 0.25s ease-out' : 'none',
        zIndex: 20,
      }
      : {
        transform: `rotate(${index * 2}deg) scale(${1 - index * 0.05})`,
        opacity: 1 - index * 0.3,
        zIndex: 10 - index,
      };


  return (
    <div
      className={`swipe-card ${index === 0 ? 'active' : ''} ${index === 0 && pos.x > 40 ? 'like' : index === 0 && pos.x < -40 ? 'pass' : ''
        }`}
      style={style}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
    >
      {/* HEADER */}
      <div className="card-header">
        <div className="compatibility-badge">
          <span>{candidate.compatibility}% Match ✨</span>

          {candidate.matchExplanation && (
            <span className="why-wrapper">
              Why?
              <span className="why-tooltip">
                {candidate.matchExplanation}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* IMAGE */}
      <img
        className="card-image"
        src={resolveImage(candidate.profileImage)}
        alt={candidate.fullName}
        draggable="false"
      />

      {/* TINT */}
      <div className="image-tint" />

      <div className="hover-info">
        <div>
          <strong>Skills:</strong>{' '}
          {candidate.skills?.slice(0, 2).join(', ') || '—'}
        </div>
        <div>
          <strong>Interests:</strong>{' '}
          {candidate.interests?.slice(0, 2).join(', ') || '—'}
        </div>
        <div>
          <strong>Availability:</strong> {candidate.availability}
        </div>
      </div>


      {/* FOOTER */}
      <div className="card-overlay">
        <div className="card-text">
          <h2>{candidate.fullName}</h2>
          {candidate.bio && <p className="bio">{candidate.bio}</p>}
        </div>

      </div>
    </div>
  );
}

export default SwipeCard;
