const app = require('../server/app');
const connectDB = require('../server/config/db');

let isConnected = false;

module.exports = async (req, res) => {
    try {
        if (!isConnected) {
            await connectDB();
            isConnected = true;
            console.log('MongoDB connected');
        }
        return app(req, res);
    } catch (err) {
        console.error('Fatal server error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
