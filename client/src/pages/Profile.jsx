import { useState, useEffect } from 'react';
import { userAPI, profileAPI } from '../services/api';
import { getAvatarSrc } from '../services/avatar';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Profile.css';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

function Profile() {
  const { user: authUser, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    bio: authUser?.bio || '',
    skills: authUser?.skills || [],
    interests: authUser?.interests || [],
    availability: authUser?.availability || 'Medium',
    profileImage: authUser?.profileImage || '',
  })

  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getProfile()
      setFormData(prev => ({
        ...prev,
        bio: response.data.bio || '',
        skills: response.data.skills || [],
        interests: response.data.interests || [],
        availability: response.data.availability || 'Medium',
        profileImage: prev.profileImage || response.data.profileImage || '',
      }));


    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     PROFILE PHOTO UPLOAD
  ========================= */

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setMessage('Profile photo must be between 1–2 MB');
      e.target.value = '';
      return;
    }

    // Preview immediately
    setPhotoPreview(URL.createObjectURL(file));

    try {
      const res = await profileAPI.uploadPhoto(file);

      setFormData((prev) => ({
        ...prev,
        profileImage: res.data.profileImage,
      }));
    } catch (err) {
      setMessage('Photo upload failed');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      await profileAPI.updateProfile(formData);

      await updateUser();

      setPhotoPreview(null);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };


  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    })
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      })
      setNewInterest('')
    }
  }

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-loading">Loading profile...</div>
      </>
    )
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
                src={getAvatarSrc(photoPreview || formData.profileImage || authUser?.profileImage)}
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

            <div className="form-section">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows="4"
              />
            </div>

            <div className="form-section">
              <label>Availability</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

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
                {formData.skills.map((skill, idx) => (
                  <span key={idx} className="tag">
                    {skill}
                    <button onClick={() => removeSkill(skill)}>×</button>
                  </span>
                ))}
              </div>
            </div>

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
                {formData.interests.map((interest, idx) => (
                  <span key={idx} className="tag">
                    {interest}
                    <button onClick={() => removeInterest(interest)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <button className="save-button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>

          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
