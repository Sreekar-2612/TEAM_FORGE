import { useMemo } from 'react';
import { getAvatarSrc } from '../services/avatar';
import { teamAPI } from '../services/api';
import './InviteModal.css';

export default function InviteModal({
    team,
    matches = [],
    pendingInvites = [],
    currentUserId,
    onClose,
}) {
    if (!team || !currentUserId) return null;

    const adminId =
        typeof team.admin === 'object'
            ? team.admin._id
            : team.admin;

    const isAdmin = String(adminId) === String(currentUserId);


    const teamMemberIds = new Set(
        (team.members || []).map(m => String(m._id))
    );

    const pendingIds = new Set(
        pendingInvites.map(i => String(i.user?._id || i.user))
    );


    const eligibleUsers = useMemo(() => {
        return matches
            .map(c => {
                if (!c?.participants) return null;
                return c.participants.find(
                    p => String(p._id) !== String(currentUserId)
                );
            })
            .filter(Boolean)
            .filter(u =>
                !teamMemberIds.has(String(u._id)) &&
                !pendingIds.has(String(u._id)) // 🔥 THIS WAS MISSING
            );
    }, [matches, teamMemberIds, pendingIds, currentUserId]);


    const invite = async (userId) => {
        try {
            await teamAPI.inviteUser(team._id, userId);
            alert('Invite sent');
        } catch (err) {
            alert('Failed to send invite');
        }
    };

    return (
        <div className="invite-modal-backdrop">
            <div className="invite-modal">

                <div className="invite-modal-header">
                    <h3>Invite matched users</h3>
                    <button className="invite-close" onClick={onClose}>✕</button>
                </div>

                <div className="invite-modal-body">
                    {eligibleUsers.length === 0 && (
                        <div className="invite-empty">No eligible users</div>
                    )}

                    {eligibleUsers.map(u => (
                        <div key={u._id} className="invite-user">
                            <img
                                src={getAvatarSrc(u.profileImage)}
                                alt={u.fullName}
                                className="invite-avatar"
                            />

                            <div className="invite-info">
                                <div className="invite-name">{u.fullName}</div>
                            </div>

                            <button
                                className="invite-btn"
                                disabled={!isAdmin}
                                onClick={() => invite(u._id)}
                            >
                                {isAdmin ? 'Invite' : 'Admin only'}
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
