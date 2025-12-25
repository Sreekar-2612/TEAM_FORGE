import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import './ProfileOnboarding.css';

const MAX_BIO_LENGTH = 500;

export default function ProfileOnboarding() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState([]);
    const [interests, setInterests] = useState([]);
    const [availability, setAvailability] = useState('Medium');

    const [skillInput, setSkillInput] = useState('');
    const [interestInput, setInterestInput] = useState('');

    const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

    const addTag = (value, list, setList) => {
        const v = value.trim();
        if (!v || list.includes(v)) return;
        setList([...list, v]);
    };

    const removeTag = (value, list, setList) => {
        setList(list.filter((item) => item !== value));
    };

    const saveAndNext = async () => {
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        try {
            setLoading(true);
            await userAPI.updateProfile({
                bio,
                skills,
                interests,
                availability,
            });
        } catch (err) {
            console.error('Profile save failed');
        } finally {
            navigate('/dashboard');
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>

                <p className="step-indicator">Step {step} of 3</p>

                {step === 1 && (
                    <>
                        <h2>Tell us about yourself</h2>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
                            placeholder="Share a bit about yourself, your interests, what you're studying..."
                        />
                        <div className="char-count">
                            {bio.length} / {MAX_BIO_LENGTH}
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2>Your skills</h2>
                        <input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag(skillInput, skills, setSkills);
                                    setSkillInput('');
                                }
                            }}
                            placeholder="Type a skill and press Enter"
                        />
                        <div className="tag-list">
                            {skills.map((s) => (
                                <span key={s} onClick={() => removeTag(s, skills, setSkills)}>
                                    {s} ×
                                </span>
                            ))}
                        </div>

                        <h2>Your interests</h2>
                        <input
                            value={interestInput}
                            onChange={(e) => setInterestInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag(interestInput, interests, setInterests);
                                    setInterestInput('');
                                }
                            }}
                            placeholder="Type an interest and press Enter"
                        />
                        <div className="tag-list">
                            {interests.map((i) => (
                                <span
                                    key={i}
                                    onClick={() => removeTag(i, interests, setInterests)}
                                >
                                    {i} ×
                                </span>
                            ))}
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2>Your availability</h2>
                        <select
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                        >
                            <option value="High">High - Available often</option>
                            <option value="Medium">Medium - Moderately available</option>
                            <option value="Low">Low - Limited availability</option>
                        </select>
                    </>
                )}

                <div className="actions">
                    <button
                        className="secondary"
                        onClick={() =>
                            step < 3 ? setStep(step + 1) : navigate('/dashboard')
                        }
                    >
                        Skip for now
                    </button>

                    <button
                        className="primary"
                        disabled={loading}
                        onClick={saveAndNext}
                    >
                        {step === 3 ? 'Start Swiping' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
