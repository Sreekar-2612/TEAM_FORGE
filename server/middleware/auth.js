const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
	const token = req.header('x-auth-token');

	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded.userId || decoded.id;
		next();
	} catch {
		return res.status(401).json({ message: 'Invalid token' });
	}
};
