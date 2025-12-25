const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS
app.use('/api/auth', authRoutes);
app.use('/api/user', require('./routes/user'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/matches', require('./routes/matching'));
app.use('/api/chat', require('./routes/chat'));


// Basic Route
app.get('/', (req, res) => {
	res.send('CollabQuest API is running...');
});

// Routes will be defined here later
// app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_URL || 'http://localhost:5173',
		methods: ['GET', 'POST'],
	},
});

require('./socket/chatSocket')(io);

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

