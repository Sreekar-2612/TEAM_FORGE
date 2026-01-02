import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import InviteModal from '../components/InviteModal';
import { teamAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import TeamMembersPanel from '../components/TeamMembersPanel';
import { onUserOnline, onUserOffline } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import {
    connectSocket,
    joinTeam,
    leaveTeam,
    sendTeamMessage,
    onTeamMessage,
    offEvent,
} from '../services/socket';
import Navbar from '../components/Navbar';
import './TeamChat.css';

export default function TeamChat() {
    const { teamId } = useParams();
    const { user } = useAuth();
    const [team, setTeam] = useState(null);
    const [onlineSet, setOnlineSet] = useState(new Set());
    const [showInvite, setShowInvite] = useState(false);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const navigate = useNavigate();
    const bottomRef = useRef(null);
    const adminId = team
        ? (typeof team.admin === 'object'
            ? team.admin._id
            : team.admin)
        : null;

    /* -------------------------------
       INIT
    -------------------------------- */

    useEffect(() => {
        if (!team || !user) return;

        const adminId =
            typeof team.admin === 'object'
                ? team.admin._id
                : team.admin;

        if (adminId !== user._id) return;

        loadPendingInvites();
    }, [team?._id, user?._id]);

    useEffect(() => {
        joinTeam(teamId);
        onTeamMessage(handleIncoming);

        return () => {
            leaveTeam(teamId);
            offEvent('team_message', handleIncoming);
        };
    }, [teamId]);

    useEffect(() => {
        teamAPI.getTeam(teamId).then(setTeam);

        onUserOnline(id =>
            setOnlineSet(prev => new Set(prev).add(id))
        );

        onUserOffline(id =>
            setOnlineSet(prev => {
                const s = new Set(prev);
                s.delete(id);
                return s;
            })
        );
    }, [teamId]);

    useEffect(() => {
        if (!team || !user) return;

        if (adminId !== user._id) return;

        const interval = setInterval(() => {
            refreshTeamState();
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, [team, user]);




    useEffect(() => {
        const loadMessages = async () => {
            try {
                const res = await teamAPI.getTeamMessages(teamId);

                const normalized = (res.data || []).map(m => ({
                    teamId,
                    senderId: m.senderId?._id?.toString(), // ✅ STRING
                    senderName: m.senderId?.fullName || 'Member',
                    senderAvatar: m.senderId?.profileImage || '',
                    content: m.content,
                    createdAt: m.createdAt,
                }));

                normalized.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );

                setMessages(normalized);
                scrollBottom();
            } catch (err) {
                console.error('Failed to load team messages');
            }
        };

        loadMessages();
    }, [teamId]);


    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await teamAPI.getTeamMessages(teamId);

                const formatted = res.data.map(m => ({
                    teamId,
                    senderId: m.senderId._id,
                    senderName: m.senderId.fullName,
                    senderAvatar: m.senderId.profileImage,
                    content: m.content,
                    createdAt: m.createdAt,
                }));

                setMessages(formatted);
            } catch (err) {
                console.error('Failed to load team history', err);
            }
        };

        loadHistory();
    }, [teamId]);




    /* -------------------------------
       HANDLERS
    -------------------------------- */

    const refreshTeamState = async () => {
        try {
            const updatedTeam = await teamAPI.getTeam(teamId);
            setTeam(updatedTeam);
        } catch (err) {
            console.error('Failed to refresh team state', err);
        }
    };


    const handleIncoming = (msg) => {
        if (msg.teamId !== teamId) return;
        setMessages((prev) => [...prev, msg]);
        scrollBottom();
    };

    const scrollBottom = () =>
        setTimeout(() => bottomRef.current?.scrollIntoView(), 50);

    const handleSend = () => {
        if (!input.trim()) return;

        sendTeamMessage(teamId, input);
        setInput('');
    };

    const loadPendingInvites = async () => {
        try {
            const res = await teamAPI.getPendingInvites(team._id);
            console.log('PENDING INVITES FROM API:', res.data);
            setPendingInvites(res.data || []);
        } catch (err) {
            console.error('Failed to load pending invites', err);
        }
    };

    const approveInvite = async (userId) => {
        await teamAPI.approveInvite(teamId, userId);
        await loadPendingInvites();
    };

    const rejectInvite = async (userId) => {
        await teamAPI.rejectInvite(teamId, userId);
        await loadPendingInvites();
    };




    /* -------------------------------
       RENDER
    -------------------------------- */
    return (
        <>
            <Navbar />
            <div className="team-chat-layout">
                <div className="team-chat-main">
                    <div className="team-chat-page">
                        <div className="team-chat-header">
                            <h2>Team Chat</h2>
                            <div className="team-chat-actions">
                                <button
                                    className="project-btn"
                                    onClick={() => navigate(`/teams/${teamId}/project`)}
                                >
                                    Project Board
                                </button>

                                {adminId === user._id && (
                                    <button
                                        className="invite-btn"
                                        onClick={() => setShowInvite(true)}
                                    >
                                        Invite Members
                                    </button>
                                )}
                            </div>

                        </div>
                        <div className="team-chat-messages">
                            {messages.map((m, idx) => (
                                <div
                                    key={idx}
                                    className={`team-message ${m.senderId?.toString() === user._id?.toString()
                                        ? 'sent'
                                        : 'received'
                                        }`}
                                >
                                    <strong>{m.senderName}</strong>
                                    <p>{m.content}</p>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        <div className="team-chat-input">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message…"
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend}>Send</button>
                        </div>
                    </div>
                </div>

                <TeamMembersPanel
                    team={team}
                    onlineSet={onlineSet}
                    currentUserId={user._id}
                    pendingInvites={pendingInvites}
                    onInviteClick={() => setShowInvite(true)}
                    onApprove={approveInvite}
                    onReject={rejectInvite}
                />

                {showInvite && (
                    <InviteModal
                        team={team}
                        onClose={() => setShowInvite(false)}
                    />
                )}

            </div>

        </>
    );
}
