import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './reusable/Button';

export default function UnauthorizedCommitteePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [requestSent, setRequestSent] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const handleRequestAccess = () => {
        // TODO: Implement actual API call to request access
        setRequestSent(true);
        setShowPopup(true);

        // Hide popup after 3 seconds
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-[#F8FEF9] dark:bg-gray-900 flex items-center justify-center px-4">
            {/* Success Popup */}
            {showPopup && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
                        <span className="material-symbols-outlined">check_circle</span>
                        <div>
                            <p className="font-semibold">Request Sent!</p>
                            <p className="text-sm">The committee chair will be notified of your access request.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center max-w-2xl">
                {/* 403 Number */}
                <h1 className="text-9xl font-extrabold text-darker-green dark:text-lighter-green mb-4">
                    403
                </h1>

                {/* Error Message */}
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Committee Access Denied
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    You are not a member of this committee and do not have permission to view its contents.
                </p>

                <p className="text-md text-gray-500 dark:text-gray-500 mb-8 max-w-lg mx-auto">
                    To gain access to this committee, please contact the committee chair or an administrator to request membership.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 items-center">
                    <Button
                        onClick={handleRequestAccess}
                        disabled={requestSent}
                        className="!bg-lighter-green !text-white hover:!bg-darker-green disabled:!bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {requestSent ? 'Request Sent' : 'Request Access'}
                    </Button>
                    <div className="flex gap-4">
                        <Button onClick={() => navigate('/committees')}>
                            View Committees
                        </Button>
                        <Button onClick={() => navigate('/home')}>
                            Go Home
                        </Button>
                    </div>
                </div>

                {/* Decorative Icon */}
                <div className="mt-12">
                    <span className="material-symbols-outlined text-9xl text-darker-green/20 dark:text-lighter-green/20">
                        group_off
                    </span>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-lg mx-auto">
                    <div className="flex items-start gap-3 text-left">
                        <span className="material-symbols-outlined text-lighter-green dark:text-darker-green mt-1">
                            info
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                Why am I seeing this?
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Committees are private spaces where members collaborate on motions and discussions.
                                Only committee members, chairs, and administrators can access committee content.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
