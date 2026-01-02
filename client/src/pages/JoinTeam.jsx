import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function JoinTeam() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const join = async () => {
            try {
                const res = await teamAPI.joinTeam(token);

                if (res.data.status === 'joined') {
                    setStatus('joined');
                    setMessage('You have successfully joined the team.');
                    setTimeout(() => navigate('/teams'), 1500);
                }

                if (res.data.status === 'pending') {
                    setStatus('pending');
                    setMessage(
                        'Approval request submitted. You will be added once an admin approves.'
                    );
                }

                if (res.data.status === 'already_member') {
                    setStatus('info');
                    setMessage('You are already a member of this team.');
                    setTimeout(() => navigate('/teams'), 1500);
                }
            } catch (err) {
                if (err.response?.status === 429) {
                    const mins = err.response.data?.remainingMinutes;
                    setStatus('error');
                    setMessage(
                        mins
                            ? `You can request to join again in ${mins} minute(s).`
                            : 'You must wait before requesting again.'
                    );
                } else {
                    setStatus('error');
                    setMessage('Invalid or expired invite link.');
                }
            }
        };

        join();
    }, [token, navigate]);

    return (
        <>
            <Navbar />
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Team Invitation</h2>

                {status === 'loading' && <p>Processing invite…</p>}
                {status !== 'loading' && <p>{message}</p>}
            </div>
        </>
    );
}
