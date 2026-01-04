import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import InviteModal from '../components/InviteModal';
import { teamAPI, chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import TeamMembersPanel from '../components/TeamMembersPanel';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './TeamChat.css';

export default function TeamChat() {
    const { teamId } = useParams();
    const { user } = useAuth();
    const [team, setTeam] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const [matches, setMatches] = useState([]);
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
        const loadTeam = async () => {
            try {
                const res = await teamAPI.getTeam(teamId);
                setTeam(res);
            } catch (err) {
                console.error('Failed to load team', err);
            }
        };

        loadTeam();
    }, [teamId]);

    useEffect(() => {
        if (!team) return;
        if (String(adminId) !== String(user._id)) return;

        loadPendingInvites();
    }, [team?._id]);



    useEffect(() => {
        const loadMatches = async () => {
            try {
                const res = await chatAPI.getMatches();
                setMatches(res.data || []);
            } catch (err) {
                console.error('Failed to load matches for invites', err);
            }
        };

        loadMatches();
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const updatedTeam = await teamAPI.getTeam(teamId);
                setTeam(updatedTeam);
            } catch (err) {
                console.error('Failed to refresh team', err);
            }
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, [teamId]);



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

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await teamAPI.getTeamMessages(teamId);
                setMessages((res.data || []).map(normalizeMessage));
            } catch (err) {
                console.error('Failed to poll team messages');
            }
        }, 3000);

        return () => clearInterval(interval);
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

    const scrollBottom = () =>
        setTimeout(() => bottomRef.current?.scrollIntoView(), 50);

    const handleSend = async () => {
        if (!input.trim()) return;

        try {
            await teamAPI.sendTeamMessage(teamId, { content: input });

            const res = await teamAPI.getTeamMessages(teamId);
            setMessages((res.data || []).map(normalizeMessage));
            setInput('');
            scrollBottom();
        } catch (err) {
            console.error('Failed to send team message', err);
        }
    };

    const normalizeMessage = (m) => ({
        teamId: m.teamId,
        senderId:
            typeof m.senderId === 'object'
                ? m.senderId._id
                : m.senderId,
        senderName:
            typeof m.senderId === 'object'
                ? m.senderId.fullName
                : m.senderName || 'Member',
        senderAvatar:
            typeof m.senderId === 'object'
                ? m.senderId.profileImage
                : '',
        content: m.content,
        createdAt: m.createdAt,
    });



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

    if (!team || !user) {
        return (
            <>
                <Navbar />
                <div className="team-chat-loading">Loading team…</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="team-chat-layout">
                <div className="team-chat-main">
                    <div className="team-chat-page">
                        <div className="team-chat-header">
                            <h2>{team.name}</h2>
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
                                    key={m._id || m.createdAt}
                                    className={`team-message ${String(m.senderId) === String(user._id)
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
                    currentUserId={user._id}
                    pendingInvites={pendingInvites}
                    onInviteClick={() => setShowInvite(true)}
                    onApprove={approveInvite}
                    onReject={rejectInvite}
                />

                {showInvite && (
                    <InviteModal
                        team={team}
                        matches={matches}
                        pendingInvites={pendingInvites}
                        currentUserId={user._id}
                        onClose={() => setShowInvite(false)}
                    />
                )}


            </div>

        </>
    );
}
