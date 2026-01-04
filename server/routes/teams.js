const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const auth = require('../middleware/auth');
const requireCompleteProfile = require('../middleware/requireCompleteProfile');
const requireTeamAdmin = require('../middleware/requireTeamAdmin');
const Conversation = require('../models/Conversation');
const TeamMessage = require('../models/TeamMessage');
const Team = require('../models/Team');
const User = require('../models/User');


const ensureMemberInviteToken = async (team) => {
    if (!team.memberInviteToken) {
        team.memberInviteToken = crypto.randomBytes(16).toString('hex');
        await team.save();
    }
};

/* =========================
   CREATE TEAM
========================= */
router.post('/', auth, requireCompleteProfile, async (req, res) => {
    try {
        const { name, maxMembers, invitePolicy } = req.body;

        if (!name || !maxMembers) {
            return res.status(400).json({ message: 'Name and team size required' });
        }

        if (![4, 6, 10, 20, 60].includes(maxMembers)) {
            return res.status(400).json({ message: 'Invalid team size' });
        }

        if (invitePolicy && !['open', 'admin_approval'].includes(invitePolicy)) {
            return res.status(400).json({ message: 'Invalid invite policy' });
        }


        const inviteToken = crypto.randomBytes(16).toString('hex');
        const memberInviteToken = crypto.randomBytes(16).toString('hex');

        const team = await Team.create({
            name,
            admin: req.user,
            members: [req.user],
            maxMembers,
            inviteToken,
            memberInviteToken,
            invitePolicy: invitePolicy || 'open',
        });

        await User.findByIdAndUpdate(req.user, {
            $addToSet: { teams: team._id },
        });

        res.status(201).json(team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Team creation failed' });
    }
});

/* =========================
   GET MY TEAMS
========================= */
router.get('/mine', auth, async (req, res) => {
    try {
        const teams = await Team.find({
            members: req.user,
        })
            .populate('admin', 'fullName email')
            .populate('members', 'fullName email profileImage');

        for (const team of teams) {
            let changed = false;

            if (!team.inviteToken) {
                team.inviteToken = crypto.randomBytes(16).toString('hex');
                changed = true;
            }

            if (!team.memberInviteToken) {
                team.memberInviteToken = crypto.randomBytes(16).toString('hex');
                changed = true;
            }

            if (changed) {
                await team.save();
            }
        }

        // 🔑 re-fetch to guarantee fresh values
        const freshTeams = await Team.find({
            members: req.user,
        })
            .populate('admin', 'fullName email')
            .populate('members', 'fullName email profileImage');

        res.json(freshTeams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load teams' });
    }
});


/* =========================
   LEAVE TEAM
========================= */
router.post('/:teamId/leave', auth, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        team.members = team.members.filter(
            id => id.toString() !== req.user.toString()
        );

        await team.save();
        await User.findByIdAndUpdate(req.user, {
            $pull: { teams: team._id },
        });

        if (team.members.length === 0) {
            await team.deleteOne();
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to leave team' });
    }
});

/* =========================
   JOIN TEAM VIA INVITE
========================= */
router.post('/join/:token', auth, requireCompleteProfile, async (req, res) => {
    try {
        const team = await Team.findOne({
            $or: [
                { inviteToken: req.params.token },
                { memberInviteToken: req.params.token },
            ],
        });

        if (!team) {
            return res.status(404).json({ message: 'Invalid invite link' });
        }

        if (team.members.includes(req.user)) {
            return res.json({ status: 'already_member' });
        }

        if (team.members.length >= team.maxMembers) {
            return res.status(403).json({ message: 'Team is full' });
        }

        const isAdminLink = team.inviteToken === req.params.token;

        if (isAdminLink) {
            team.members.addToSet(req.user);
            team.pendingInvites = team.pendingInvites.filter(
                i => i.user.toString() !== req.user.toString()
            );

            await team.save();
            await User.findByIdAndUpdate(req.user, {
                $addToSet: { teams: team._id },
            });

            return res.json({ status: 'joined' });
        }

        if (team.invitePolicy === 'open') {
            team.members.addToSet(req.user);
            await team.save();
            await User.findByIdAndUpdate(req.user, {
                $addToSet: { teams: team._id },
            });

            return res.json({ status: 'joined' });
        }

        // 🔒 ADMIN APPROVAL REQUIRED — COOLDOWN ENFORCED

        const cooldown = team.inviteCooldowns.find(
            c => c.user.toString() === req.user.toString()
        );

        if (cooldown) {
            const elapsed = Date.now() - new Date(cooldown.rejectedAt).getTime();
            const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

            if (elapsed < COOLDOWN_MS) {
                const remainingMs = COOLDOWN_MS - elapsed;

                return res.status(429).json({
                    message: 'You must wait before requesting again',
                    remainingMs,
                    remainingMinutes: Math.ceil(remainingMs / 60000),
                });
            }
        }

        await Team.updateOne(
            {
                _id: team._id,
                "pendingInvites.user": { $ne: req.user }
            },
            {
                $push: {
                    pendingInvites: {
                        user: req.user,
                        invitedBy: team.admin,
                        createdAt: new Date(),
                    }
                }
            }
        );

        return res.json({ status: 'pending' });



    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to join team' });
    }
});

/* =========================
   UPDATE TEAM CAPACITY (ADMIN)
========================= */
router.put('/:teamId/capacity', auth, async (req, res) => {
    try {
        const { maxMembers } = req.body;
        const team = await Team.findById(req.params.teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (team.admin.toString() !== req.user.toString()) {
            return res.status(403).json({ message: 'Admin only action' });
        }

        if (![4, 6, 10, 20, 60].includes(maxMembers)) {
            return res.status(400).json({ message: 'Invalid team size' });
        }

        if (team.members.length > maxMembers) {
            return res.status(400).json({
                message: 'Current members exceed new capacity',
            });
        }

        team.maxMembers = maxMembers;
        await team.save();

        res.json(team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update capacity' });
    }
});

const requireTeamMember = async (req, res, next) => {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
        return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
        (id) => id.toString() === req.user.toString()
    );

    if (!isMember) {
        return res.status(403).json({ message: 'Not a team member' });
    }

    req.team = team;
    next();
};

/* =========================
   GET TEAM MESSAGES
========================= */
router.get(
    '/:teamId/messages',
    auth,
    requireCompleteProfile,
    requireTeamMember,
    async (req, res) => {
        try {
            const messages = await TeamMessage.find({
                teamId: req.params.teamId,
            })
                .populate('senderId', 'fullName profileImage')
                .sort({ createdAt: 1 });

            res.json(messages);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to load messages' });
        }
    }
);

/* =========================
   SEND TEAM MESSAGE
========================= */
router.post(
    '/:teamId/message',
    auth,
    requireCompleteProfile,
    requireTeamMember,
    async (req, res) => {
        try {
            const { content } = req.body;
            if (!content?.trim()) {
                return res.status(400).json({ message: 'Message empty' });
            }

            const msg = await TeamMessage.create({
                teamId: req.params.teamId,
                senderId: req.user,
                content,
            });

            const populated = await msg.populate(
                'senderId',
                'fullName profileImage'
            );

            res.status(201).json(populated);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Message send failed' });
        }
    }
);

/* =========================
   INVITE USER TO TEAM
========================= */
router.post('/:teamId/invite', auth, requireCompleteProfile, async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID required' });
        }

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (!team.members.includes(req.user)) {
            return res.status(403).json({ message: 'Not a team member' });
        }

        if (team.members.includes(userId)) {
            return res.status(400).json({ message: 'User already in team' });
        }

        const alreadyPending = team.pendingInvites.some(
            i => i.user.toString() === userId.toString()
        );
        if (alreadyPending) {
            return res.status(400).json({ message: 'User already invited' });
        }

        const conversationId = [req.user.toString(), userId.toString()]
            .sort()
            .join('_');

        const conversationExists = await Conversation.exists({ conversationId });

        if (!conversationExists) {
            return res.status(403).json({ message: 'User not matched' });
        }

        const isAdmin = team.admin.toString() === req.user.toString();

        if (isAdmin || team.invitePolicy === 'open') {
            team.members.addToSet(userId);
            await team.save();
            await User.findByIdAndUpdate(userId, {
                $addToSet: { teams: team._id },
            });
            return res.json({ status: 'joined' });
        }

        // 🔒 ADMIN APPROVAL REQUIRED — COOLDOWN ENFORCED

        const cooldown = team.inviteCooldowns.find(
            c => c.user.toString() === userId.toString()
        );

        if (cooldown) {
            const elapsed = Date.now() - new Date(cooldown.rejectedAt).getTime();
            const COOLDOWN_MS = 60 * 60 * 1000;

            if (elapsed < COOLDOWN_MS) {
                const remainingMs = COOLDOWN_MS - elapsed;

                return res.status(429).json({
                    message: 'User must wait before requesting again',
                    remainingMs,
                    remainingMinutes: Math.ceil(remainingMs / 60000),
                });
            }
        }

        await Team.updateOne(
            {
                _id: team._id,
                "pendingInvites.user": { $ne: userId }
            },
            {
                $push: {
                    pendingInvites: {
                        user: userId,
                        invitedBy: req.user,
                        createdAt: new Date(),
                    }
                }
            }
        );

        return res.json({ status: 'pending' });


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Invite failed' });
    }
});


/* =========================
   GET / APPROVE / REJECT PENDING INVITES
========================= */
router.get('/:teamId/invites', auth, requireTeamAdmin, async (req, res) => {
    const team = await Team.findById(req.params.teamId)
        .populate('pendingInvites.user', 'fullName profileImage')
        .populate('pendingInvites.invitedBy', 'fullName');

    res.json(team.pendingInvites);
});

router.post('/:teamId/invites/:userId/approve', auth, requireTeamAdmin, async (req, res) => {
    const team = req.team;
    const { userId } = req.params;

    team.pendingInvites = team.pendingInvites.filter(
        i => i.user.toString() !== userId
    );

    team.members.addToSet(userId);
    await team.save();

    await User.findByIdAndUpdate(userId, {
        $addToSet: { teams: team._id },
    });

    res.json({ success: true });
});


router.post('/:teamId/invites/:userId/reject', auth, requireTeamAdmin, async (req, res) => {
    const team = req.team;
    const { userId } = req.params;

    team.pendingInvites = team.pendingInvites.filter(
        i => i.user.toString() !== userId
    );

    team.inviteCooldowns.push({
        user: userId,
        rejectedAt: new Date(),
    });

    await team.save();
    res.json({ success: true });
});


/* =========================
   GET MATCHED USERS FOR TEAM INVITE (ADMIN)
========================= */
router.get('/:teamId/matched-users', auth, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) return res.status(404).json([]);

        const myId = req.user.toString();

        // 1️⃣ All my conversations
        const conversations = await Conversation.find({
            participants: myId,
        }).populate('participants', 'fullName profileImage');

        // 2️⃣ Extract matched users
        let matched = conversations
            .map(c =>
                c.participants.find(p => p._id.toString() !== myId)
            )
            .filter(Boolean);

        // 3️⃣ Exclude existing members
        const memberIds = team.members.map(m => m.toString());
        matched = matched.filter(u => !memberIds.includes(u._id.toString()));

        // 4️⃣ Exclude already invited users
        const invitedIds = team.invites?.map(i => i.user.toString()) || [];
        matched = matched.filter(u => !invitedIds.includes(u._id.toString()));

        res.json(matched);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});


/* =========================
   GET INVITE COOLDOWN STATUS
========================= */
router.get(
    '/:teamId/cooldown/:userId',
    auth,
    async (req, res) => {
        const { teamId, userId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const cooldown = team.inviteCooldowns.find(
            c => c.user.toString() === userId.toString()
        );

        if (!cooldown) {
            return res.json({ remainingMs: 0 });
        }

        const elapsed = Date.now() - new Date(cooldown.rejectedAt).getTime();
        const COOLDOWN_MS = 60 * 60 * 1000;

        if (elapsed >= COOLDOWN_MS) {
            return res.json({ remainingMs: 0 });
        }

        const remainingMs = COOLDOWN_MS - elapsed;

        res.json({
            remainingMs,
            remainingMinutes: Math.ceil(remainingMs / 60000),
        });
    }
);

module.exports = router;