import { useNavigate } from 'react-router-dom';
import Button from './reusable/Button';
import { API_BASE_URL } from '../config/api.js';

export default function NoAccessPage({ committeeId, committeeTitle }) {
    const navigate = useNavigate();

    async function requestAccess() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/committee/${encodeURIComponent(committeeId)}/request-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: `Requesting access to committee ${committeeId}` })
            });

            if (res.ok) {
                alert('Access request sent to committee administrators.');
                return;
            }

            const body = await res.json().catch(() => ({}));
            alert(body.message || 'Failed to send access request');
            return;
        } catch (e) {
            console.error('Request access failed:', e);
        }

        // Fallback behaviour
        alert('Access request noted. Please contact the committee owner or an admin to request membership.');
    }

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <h1 className="text-6xl font-extrabold text-darker-green dark:text-lighter-green mb-4">No Access</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">You do not have access to {committeeTitle ? `"${committeeTitle}"` : 'this committee'}.</p>

            <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate(-1)}>Go Back</Button>
                <Button onClick={() => navigate('/')}>Go Home</Button>
                <Button onClick={requestAccess}>Request Access</Button>
            </div>
        </div>
    );
}
