import { useEffect, useState } from 'react';
import { teamAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Teams.css';

export default function Teams() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [invitePolicy, setInvitePolicy] = useState('open');
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [form, setForm] = useState({
        name: '',
        maxMembers: 4,
    });

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            const res = await teamAPI.getMyTeams();
            setTeams(res.data || []);
        } catch (err) {
            console.error('Failed to load teams', err);
        } finally {
            setLoading(false);
        }
    };

    const createTeam = async () => {
        if (!form.name.trim()) return;

        try {
            setCreating(true);

            await teamAPI.createTeam({
                name: form.name.trim(),
                maxMembers: form.maxMembers,
                invitePolicy, // 🔥 THIS IS THE KEY
            });


            setForm({ name: '', maxMembers: 4 });
            setInvitePolicy('open');
            loadTeams();
        } catch (err) {
            console.error('Create team failed', err.response?.data || err);
        } finally {
            setCreating(false);
        }
    };


    const leaveTeam = async (teamId) => {
        if (!confirm('Leave this team?')) return;

        try {
            await teamAPI.leaveTeam(teamId);
            loadTeams();
        } catch (err) {
            console.error('Leave failed', err);
        }
    };

    const copyInvite = (team, isAdminLink = true) => {
        const token = isAdminLink ? team.inviteToken : team.memberInviteToken;

        if (!token) {
            alert('Invite link not available yet. Please reload or contact admin.');
            return;
        }

        const url = `${window.location.origin}/join/${token}`;
        navigator.clipboard.writeText(url);

        alert(
            isAdminLink
                ? 'Admin invite link copied'
                : 'Member invite link copied'
        );
    };



    if (loading) return <div className="loading">Loading teams…</div>;

    return (
        <>
            <Navbar />
            <div className="teams-page">
                {/* CREATE TEAM */}
                <div className="team-create">
                    <input
                        placeholder="Team name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    <select
                        value={form.maxMembers}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                maxMembers: Number(e.target.value),
                            })
                        }
                    >
                        {[4, 6, 10, 20, 60].map((n) => (
                            <option key={n} value={n}>
                                {n} members
                            </option>
                        ))}
                    </select>

                    {/* 🔒 INVITE POLICY */}
                    <div className="invite-policy">
                        <label>
                            <input
                                type="radio"
                                value="open"
                                checked={invitePolicy === 'open'}
                                onChange={() => setInvitePolicy('open')}
                            />
                            Open Team
                        </label>

                        <label>
                            <input
                                type="radio"
                                value="admin_approval"
                                checked={invitePolicy === 'admin_approval'}
                                onChange={() => setInvitePolicy('admin_approval')}
                            />
                            Admin Approval
                        </label>
                    </div>

                    <button onClick={createTeam} disabled={creating}>
                        {creating ? 'Creating…' : 'Create Team'}
                    </button>
                </div>

                {/* TEAM LIST */}
                <div className="team-grid">
                    {teams.length === 0 && (
                        <p className="empty">You are not part of any team</p>
                    )}

                    {teams.map((team) => {
                        const adminId =
                            typeof team.admin === 'object'
                                ? team.admin._id
                                : team.admin;

                        const isAdmin = adminId === user._id;

                        return (
                            <div key={team._id} className="team-card">
                                <h3>
                                    {team.name}
                                    {isAdmin && <span className="admin-badge">Admin</span>}
                                </h3>

                                <p>
                                    Members: {team.members.length} / {team.maxMembers}
                                </p>

                                <p className="invite-policy-label">
                                    {team.invitePolicy === 'admin_approval'
                                        ? '🔒 Admin approval required'
                                        : '🔓 Open invites'}
                                </p>

                                <button
                                    onClick={() => navigate(`/teams/${team._id}/chat`)}
                                >
                                    Open Chat
                                </button>

                                <div className="team-actions">
                                    {isAdmin && (
                                        <button onClick={() => copyInvite(team, true)}>
                                            Copy Admin Invite
                                        </button>
                                    )}

                                    <button onClick={() => copyInvite(team, false)}>
                                        Copy Member Invite
                                    </button>

                                    <button
                                        className="danger"
                                        onClick={() => leaveTeam(team._id)}
                                    >
                                        Leave
                                    </button>
                                </div>


                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
