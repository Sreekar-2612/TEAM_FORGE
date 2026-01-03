import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, userAPI } from '../services/api';
import { getAvatarSrc } from '../services/avatar';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './ProfileOnboarding.css';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export default function ProfileOnboarding() {
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    const [formData, setFormData] = useState({
        bio: '',
        skills: [],
        interests: [],
        availability: 'Medium',
    });

    const [errors, setErrors] = useState({});
    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [pendingPhoto, setPendingPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    /* ---------------- PHOTO ---------------- */
    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE) {
            setErrors(prev => ({
                ...prev,
                photo: 'Image must be under 2 MB',
            }));
            return;
        }

        setErrors(prev => ({ ...prev, photo: '' }));
        setPendingPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    /* ---------------- VALIDATION ---------------- */
    const validate = () => {
        const e = {};

        if (!formData.bio.trim() || formData.bio.trim().length < 10) {
            e.bio = 'Bio must be at least 10 characters';
        }

        if (formData.skills.length === 0) {
            e.skills = 'Add at least one skill';
        }

        if (formData.interests.length === 0) {
            e.interests = 'Add at least one interest';
        }

        if (!formData.availability) {
            e.availability = 'Select availability';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ---------------- SUBMIT ---------------- */
    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);

            let profileImage = '';

            if (pendingPhoto) {
                const uploadRes = await profileAPI.uploadPhoto(pendingPhoto);
                profileImage = uploadRes.data.profileImage;
            }

            await userAPI.updateProfile({
                ...formData,
                profileImage,
            });

            await updateUser();
            navigate('/dashboard', { replace: true });
        } catch {
            setErrors({ global: 'Failed to complete onboarding' });
        } finally {
            setSaving(false);
        }
    };

    /* ---------------- TAG HELPERS ---------------- */
    const addSkill = () => {
        if (!newSkill.trim()) return;

        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, newSkill.trim()],
        }));

        setNewSkill('');
        setErrors(prev => ({ ...prev, skills: '' }));
    };

    const addInterest = () => {
        if (!newInterest.trim()) return;

        setFormData(prev => ({
            ...prev,
            interests: [...prev.interests, newInterest.trim()],
        }));

        setNewInterest('');
        setErrors(prev => ({ ...prev, interests: '' }));
    };

    return (
        <>
            <Navbar />

            <div className="onboarding-page">
                <div className="onboarding-card">
                    <h2>Complete your profile</h2>

                    {/* AVATAR */}
                    <div className="avatar-section">
                        <img
                            className="avatar"
                            src={photoPreview || getAvatarSrc(null)}
                            alt="Profile preview"
                        />
                        <label className="avatar-overlay">
                            Change photo
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handlePhotoSelect}
                            />
                        </label>
                    </div>
                    {errors.photo && <p className="error">{errors.photo}</p>}

                    {/* BIO */}
                    <textarea
                        placeholder="Short bio"
                        value={formData.bio}
                        onChange={(e) => {
                            setFormData({ ...formData, bio: e.target.value });
                            setErrors(prev => ({ ...prev, bio: '' }));
                        }}
                    />
                    {errors.bio && <p className="error">{errors.bio}</p>}

                    {/* SKILLS */}
                    <div className="tag-input">
                        <input
                            placeholder="Add skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <button onClick={addSkill}>Add</button>
                    </div>
                    {errors.skills && <p className="error">{errors.skills}</p>}

                    <div className="tags">
                        {formData.skills.map(s => (
                            <span key={s} className="tag">
                                {s}
                                <button
                                    onClick={() =>
                                        setFormData(prev => ({
                                            ...prev,
                                            skills: prev.skills.filter(x => x !== s),
                                        }))
                                    }
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* INTERESTS */}
                    <div className="tag-input">
                        <input
                            placeholder="Add interest"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                        />
                        <button onClick={addInterest}>Add</button>
                    </div>
                    {errors.interests && <p className="error">{errors.interests}</p>}

                    <div className="tags">
                        {formData.interests.map(i => (
                            <span key={i} className="tag">
                                {i}
                                <button
                                    onClick={() =>
                                        setFormData(prev => ({
                                            ...prev,
                                            interests: prev.interests.filter(x => x !== i),
                                        }))
                                    }
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* AVAILABILITY */}
                    <select
                        value={formData.availability}
                        onChange={(e) => {
                            setFormData({ ...formData, availability: e.target.value });
                            setErrors(prev => ({ ...prev, availability: '' }));
                        }}
                    >
                        <option value="">Select availability</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    {errors.availability && <p className="error">{errors.availability}</p>}

                    {errors.global && <p className="error">{errors.global}</p>}

                    <button
                        className="finish-btn"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Finish'}
                    </button>
                </div>
            </div>
        </>
    );
}
