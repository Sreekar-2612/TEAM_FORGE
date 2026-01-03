require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const teamRoutes = require('./routes/teams');
const teamProjectRoutes = require('./routes/teamProjects');
const matchingRoutes = require('./routes/matching');
const profileRoutes = require('./routes/profile');
const aiRoutes = require('./routes/ai');

const app = express();

/* ---------- DB ---------- */
connectDB();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(cors({
	origin: true,
	credentials: true,
}));

/* ---------- ROUTES ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-projects', teamProjectRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

/* ---------- HEALTH ---------- */
app.get('/api/health', (_, res) => {
	res.json({ status: 'ok' });
});

module.exports = app;
