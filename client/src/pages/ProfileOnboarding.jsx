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

    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [pendingPhoto, setPendingPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE) {
            setError('Image must be between 1–2 MB');
            return;
        }

        setError('');
        setPendingPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError('');

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
        } catch (err) {
            setError('Failed to complete onboarding');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;
        if (formData.skills.includes(newSkill)) return;

        setFormData({
            ...formData,
            skills: [...formData.skills, newSkill.trim()],
        });
        setNewSkill('');
    };

    const addInterest = () => {
        if (!newInterest.trim()) return;
        if (formData.interests.includes(newInterest)) return;

        setFormData({
            ...formData,
            interests: [...formData.interests, newInterest.trim()],
        });
        setNewInterest('');
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

                    <p className="photo-hint">Image size: 0–2 MB (JPG / PNG)</p>
                    <p className="onboard-hint">!Make sure to fill all the fields to complete onboarding!</p>
                    

                    {error && <div className="error">{error}</div>}

                    <textarea
                        placeholder="Short bio"
                        value={formData.bio}
                        onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                        }
                    />

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

                    <div className="tags">
                        {formData.skills.map((s) => (
                            <span key={s} className="tag">
                                {s}
                                <button
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            skills: formData.skills.filter(x => x !== s),
                                        })
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

                    <div className="tags">
                        {formData.interests.map((i) => (
                            <span key={i} className="tag">
                                {i}
                                <button
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            interests: formData.interests.filter(x => x !== i),
                                        })
                                    }
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    <select id='availability-box'
                        value={formData.availability}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                availability: e.target.value,
                            })
                        }
                    >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <button className="finish-btn" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Saving…' : 'Finish'}
                    </button>
                </div>
            </div>
        </>
    );
}
