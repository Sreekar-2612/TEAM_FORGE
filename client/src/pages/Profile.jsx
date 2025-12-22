import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './Profile.css'

function Profile() {
  const { user: authUser, updateUser } = useAuth()
  const [user, setUser] = useState(authUser)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    skills: user?.skills || [],
    interests: user?.interests || [],
    availability: user?.availability || 'Medium'
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
      setUser(response.data)
      setFormData({
        bio: response.data.bio || '',
        skills: response.data.skills || [],
        interests: response.data.interests || [],
        availability: response.data.availability || 'Medium'
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage('')
      const response = await userAPI.updateProfile(formData)
      setUser(response.data)
      updateUser(response.data)
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

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
          <div className="profile-header">
            <h1>Edit Profile</h1>
            <p>Update your information to get better matches</p>
          </div>

          {message && (
            <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="profile-card">
            <div className="profile-info">
              <h2>{user?.fullName}</h2>
              <p className="email">{user?.email}</p>
            </div>

            <div className="form-section">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell others about yourself..."
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
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill and press Enter"
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
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  placeholder="Add an interest and press Enter"
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

