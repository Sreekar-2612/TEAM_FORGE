import { getAvatarSrc } from '../services/avatar';
import './TeamMembersPanel.css';

export default function TeamMembersPanel({
    team,
    onlineSet = new Set(),
    currentUserId,
    onInviteClick,
    pendingInvites,
    onApprove,
    onReject,
}) {
    if (!team) return null;

    const adminId = typeof team.admin === 'object'
        ? team.admin._id
        : team.admin;

    const sortedMembers = [...team.members].sort((a, b) => {
        if (a._id === adminId) return -1;
        if (b._id === adminId) return 1;
        return 0;
    });

    console.log('TEAM MEMBERS PANEL:', {
        adminId,
        currentUserId,
        pendingInvites,
    });

    return (
        <div className="team-members-panel">
            <h3>Members</h3>

            {/* 🔒 POLICY INDICATOR */}
            {team.invitePolicy === 'admin_approval' && (
                <div className="invite-policy-note">
                    🔒 Member invites require admin approval
                </div>
            )}

            {sortedMembers.map(member => {
                const isAdmin = member._id === adminId;
                const isOnline = onlineSet.has(member._id);
                const isMe = member._id === currentUserId;

                return (
                    <div key={member._id} className="member-row">
                        <img
                            src={getAvatarSrc(member.profileImage)}
                            alt={member.fullName}
                            className="member-avatar"
                        />

                        <div className="member-info">
                            <div className="member-name-row">
                                <span className="member-name">{member.fullName}</span>

                                <div className="member-badges">
                                    {isMe && <span className="you-badge">You</span>}
                                    {isAdmin && <span className="admin-badge">Admin</span>}
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })}

            {adminId === currentUserId && (
                <>
                    <h4>Pending Join Requests</h4>
                    {pendingInvites.length === 0 && (
                        <p>No pending requests</p>
                    )}
                    {pendingInvites.map(p => (
                        <div key={p._id} className="invite-row">
                            <span>{p.user.fullName}</span>
                            <button onClick={() => onApprove(p.user._id)}>Approve</button>
                            <button onClick={() => onReject(p.user._id)}>Reject</button>
                        </div>
                    ))}
                </>
            )}

        </div>
    );
}
