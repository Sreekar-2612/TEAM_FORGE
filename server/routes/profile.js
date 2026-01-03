const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // multer memory storage
const User = require('../models/User');

/* =========================
   CLOUDINARY CONFIG
========================= */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================
   MULTER (MEMORY STORAGE)
========================= */
/* =========================
   UPLOAD PROFILE PHOTO
========================= */
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Missing file (photo)' });
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            { folder: 'teamforge/profiles' }
        );

        res.json({
            profileImage: result.secure_url,
            publicId: result.public_id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Photo upload failed' });
    }
});

router.put('/me', auth, async (req, res) => {
    try {
        const {
            bio = '',
            skills = [],
            interests = [],
            availability = 'Medium',
            profileImage,
        } = req.body;

        const update = {
            bio,
            skills,
            interests,
            availability,
        };

        if (profileImage) {
            update.profileImage = profileImage;
        }

        // profile completeness rule (EXPLICIT)
        update.isProfileComplete =
            bio.trim().length > 0 &&
            Array.isArray(skills) && skills.length > 0 &&
            Array.isArray(interests) && interests.length > 0;

        const user = await User.findByIdAndUpdate(
            req.user,
            update,
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Profile update failed' });
    }
});


module.exports = router;
