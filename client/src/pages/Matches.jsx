import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { chatAPI, matchAPI, matchingAPI } from '../services/api';
import { getAvatarSrc } from '../services/avatar';
import './Matches.css';

export default function Matches() {

  const navigate = useNavigate();

  const [incoming, setIncoming] = useState([]);
  const [pending, setPending] = useState([]);
  const [matches, setMatches] = useState([]);
  const { user } = useAuth();
  const myId = String(user?.id || user?._id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(loadAll, 300);
    return () => clearTimeout(t);
  }, []);


  const loadAll = async () => {
    try {
      const [reqRes, pendRes, matchRes] = await Promise.all([
        matchAPI.getRequests(),
        matchAPI.getPending(),
        chatAPI.getMatches(),
      ]);

      console.log('INCOMING →', reqRes.data);
      console.log('PENDING →', pendRes.data);
      console.log('MATCHES →', matchRes.data);

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
    <>
      <Navbar />

      <div className="matches-container">

        {/* INCOMING */}
        <section>
          <h2>Incoming Requests</h2>
          {incoming.length === 0 && <p className="empty">No incoming requests</p>}

          <div className="card-grid">
            {incoming
              .filter(u => String(u._id) !== myId)
              .map(u => (
                <div key={u._id} className="match-card">
                  <img
                    className="avatar-img"
                    src={getAvatarSrc(u.profileImage)}
                    alt={u.fullName}
                  />
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

        {/* PENDING */}
        <section>
          <h2>Pending Requests</h2>
          {pending.length === 0 && <p className="empty">No pending requests</p>}

          <div className="card-grid">
            {pending
              .filter(u => String(u._id) !== myId)
              .map(u => (
            <div key={u._id} className="match-card muted">
              <img
                className="avatar-img"
                src={getAvatarSrc(u.profileImage)}
                alt={u.fullName}
              />
              <h3>{u.fullName}</h3>
              <p className="status">Waiting for response</p>
            </div>
            ))}
          </div>
        </section>

        {/* MATCHES */}
        <section>
          <h2>Matches</h2>
          {matches.length === 0 && <p className="empty">No matches yet</p>}

          <div className="card-grid">
            {matches.map((c) => {
              if (!c.participants || c.participants.length < 2) return null;

              const other = c.participants.find(
                (p) => String(p._id) !== myId
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
                  <img
                    className="avatar-img"
                    src={getAvatarSrc(other.profileImage)}
                    alt={other.fullName}
                  />
                  <h3>{other.fullName}</h3>
                  <p className="status">Matched</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}