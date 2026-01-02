import { useEffect, useState } from 'react';
import { teamAPI } from '../services/api';
import { getAvatarSrc } from '../services/avatar';
import './InviteModal.css';

export default function InviteModal({ team, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const res = await teamAPI.getMatchedUsers(team._id);
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to load matched users');
        } finally {
            setLoading(false);
        }
    };

    const invite = async (userId) => {
        try {
            setError(null);
            await teamAPI.inviteUser(team._id, userId);
            load();
        } catch (err) {
            if (err.response?.status === 429) {
                const mins = err.response.data?.remainingMinutes;
                setError(
                    mins
                        ? `You can invite this user again in ${mins} minute(s).`
                        : 'You must wait before inviting this user again.'
                );
            } else {
                setError('Failed to send invite.');
            }
        }
    };

    return (
        <div className="invite-modal-backdrop">
            <div className="invite-modal">

                {/* HEADER */}
                <div className="invite-modal-header">
                    <h3>Invite matched users</h3>
                    <button className="invite-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div className="invite-modal-body">
                    {error && <div className="invite-error">{error}</div>}

                    {loading && <div className="invite-empty">Loading…</div>}

                    {!loading && users.length === 0 && (
                        <div className="invite-empty">
                            No eligible users
                        </div>
                    )}

                    {users.map((u) => (
                        <div key={u._id} className="invite-user">
                            <img
                                src={getAvatarSrc(u.profileImage)}
                                alt={u.fullName}
                                className="invite-avatar"
                            />

                            <div className="invite-info">
                                <div className="invite-name">
                                    {u.fullName}
                                </div>
                            </div>

                            <button
                                className="invite-btn"
                                onClick={() => invite(u._id)}
                            >
                                Invite
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
