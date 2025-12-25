import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, matchAPI, matchingAPI } from '../services/api';
import './Matches.css';

export default function Matches() {
  const navigate = useNavigate();

  const [incoming, setIncoming] = useState([]);
  const [pending, setPending] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = localStorage.getItem('userId'); 
  // ⚠️ This must already be stored on login/signup

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [reqRes, pendRes, matchRes] = await Promise.all([
        matchAPI.getRequests(),
        matchAPI.getPending(),
        chatAPI.getMatches(),
      ]);

      setIncoming(reqRes.data || []);
      setPending(pendRes.data || []);
      setMatches(matchRes.data || []);
    } catch (err) {
      console.error('Failed to load matches', err);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (userId) => {
    try {
      await matchingAPI.swipe(userId, 'like');
      loadAll();
    } catch (err) {
      console.error('Accept failed', err);
    }
  };

  const ignoreRequest = async (userId) => {
    try {
      await matchingAPI.swipe(userId, 'pass');
      loadAll();
    } catch (err) {
      console.error('Ignore failed', err);
    }
  };

  if (loading) {
    return <div className="matches-container">Loading...</div>;
  }

  return (
    <div className="matches-container">
      <h1>Your Connections</h1>

      {/* INCOMING REQUESTS */}
      <section>
        <h2>Incoming Requests</h2>
        {incoming.length === 0 && <p className="empty">No incoming requests</p>}

        <div className="card-grid">
          {incoming.map((u) => (
            <div key={u._id} className="match-card">
              <div className="avatar">{u.fullName[0]}</div>
              <h3>{u.fullName}</h3>

              <div className="actions">
                <button
                  className="accept"
                  onClick={() => acceptRequest(u._id)}
                >
                  Accept
                </button>
                <button
                  className="reject"
                  onClick={() => ignoreRequest(u._id)}
                >
                  Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PENDING REQUESTS */}
      <section>
        <h2>Pending Requests</h2>
        {pending.length === 0 && <p className="empty">No pending requests</p>}

        <div className="card-grid">
          {pending.map((u) => (
            <div key={u._id} className="match-card muted">
              <div className="avatar">{u.fullName[0]}</div>
              <h3>{u.fullName}</h3>
              <p className="status">Waiting for response</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIRMED MATCHES */}
      <section>
        <h2>Matches</h2>
        {matches.length === 0 && <p className="empty">No matches yet</p>}

        <div className="card-grid">
          {matches.map((c) => {
            if (!Array.isArray(c.participants)) return null;

            const other = c.participants.find(
              (p) => p._id !== currentUserId
            );

            if (!other) return null;

            return (
              <div
                key={c.conversationId}
                className="match-card clickable"
                onClick={() =>
                  navigate(`/chat?conversationId=${c.conversationId}`)
                }
              >
                <div className="avatar">{other.fullName[0]}</div>
                <h3>{other.fullName}</h3>
                <p className="status">Matched</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
