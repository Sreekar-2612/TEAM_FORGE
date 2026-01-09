require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const teamRoutes = require('./routes/teams');
const teamProjectRoutes = require('./routes/teamProjects');
const matchingRoutes = require('./routes/matching');
const profileRoutes = require('./routes/profile');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(express.json());

const allowedOrigins = [
    'https://team-forge-frontend.vercel.app/',
    'http://localhost:5173',
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, x-auth-token'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

/* 🔴 GUARANTEE DB BEFORE ROUTES */
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection failed:', err);
        res.status(500).json({ message: 'Database unavailable' });
    }
});

/* ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-projects', teamProjectRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_, res) => {
    res.json({ status: 'ok' });
});

module.exports = app;
