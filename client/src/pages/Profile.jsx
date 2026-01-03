import { useState, useEffect } from 'react';
import { userAPI, profileAPI } from '../services/api';
import { getAvatarSrc } from '../services/avatar';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Profile.css';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

function Profile() {
  const { user: authUser, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    interests: [],
    availability: 'Medium',
    profileImage: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  /* =========================
     LOAD PROFILE (SINGLE SOURCE)
  ========================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        setFormData({
          bio: res.data.bio || '',
          skills: res.data.skills || [],
          interests: res.data.interests || [],
          availability: res.data.availability || 'Medium',
          profileImage: res.data.profileImage || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* =========================
     PHOTO SELECT (NO UPLOAD)
  ========================= */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setMessage('Profile photo must be under 2 MB');
      return;
    }

    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      let profileImage = formData.profileImage;

      if (pendingPhoto) {
        const uploadRes = await profileAPI.uploadPhoto(pendingPhoto);
        profileImage = uploadRes.data.profileImage;
      }

      await profileAPI.updateProfile({
        ...formData,
        profileImage,
      });

      await updateUser();

      setPendingPhoto(null);
      setPhotoPreview(null);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     TAG HELPERS
  ========================= */
  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (formData.skills.includes(newSkill.trim())) return;

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    if (formData.interests.includes(newInterest.trim())) return;

    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, newInterest.trim()],
    }));
    setNewInterest('');
  };

  const removeInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-loading">Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-card">

            {/* AVATAR */}
            <div className="avatar-section">
              <img
                className="profile-avatar"
                src={getAvatarSrc(photoPreview || formData.profileImage)}
                alt="Profile"
              />
              <label className="avatar-overlay">
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </label>
            </div>

            <p className="image-hint">
              Image size: <strong>0–2 MB</strong> (JPG / PNG)
            </p>

            <div className="profile-info">
              <h2>{authUser?.fullName}</h2>
              <p className="email">{authUser?.email}</p>
            </div>

            {message && (
              <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {/* BIO */}
            <div className="form-section">
              <label>Bio</label>
              <textarea
                rows="4"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>

            {/* AVAILABILITY */}
            <div className="form-section">
              <label>Availability</label>
              <select
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* SKILLS */}
            <div className="form-section">
              <label>Skills</label>
              <div className="tag-input">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <button onClick={addSkill}>Add</button>
              </div>

              <div className="tags-list">
                {formData.skills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                    <button onClick={() => removeSkill(skill)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* INTERESTS */}
            <div className="form-section">
              <label>Interests</label>
              <div className="tag-input">
                <input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                />
                <button onClick={addInterest}>Add</button>
              </div>

              <div className="tags-list">
                {formData.interests.map((interest) => (
                  <span key={interest} className="tag">
                    {interest}
                    <button onClick={() => removeInterest(interest)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <button
              className="save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>

          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
