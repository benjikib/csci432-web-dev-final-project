import { useNavigate, useLocation } from "react-router-dom"

function MotionCard({ motion, committeeSlug }) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleClick = () => {
        // Use the API-compliant route structure with slug if available
        const committeeIdentifier = committeeSlug || motion.committeeId;
        navigate(`/committee/${committeeIdentifier}/motion/${motion._id}`, { state: { background: location } })
    }

    return (
        <div className="motion-card" onClick={handleClick}>
            <div className="motion-header">
                <h3 className="motion-title font-bold">{motion.title}</h3>
            </div>
            <p className="motion-description">{motion.description}</p>
            <div className="motion-footer">
                <div className="flex items-center justify-between w-full">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Votes: {(motion.votes?.yes || 0) + (motion.votes?.no || 0) + (motion.votes?.abstain || 0)}
                    </span>
                    {(motion.authorName || motion.authorInfo) && (
                        <div className="flex items-center gap-2">
                            {motion.authorInfo?.picture ? (
                                <img
                                    src={motion.authorInfo.picture}
                                    alt={motion.authorName || motion.authorInfo.name}
                                    className="w-6 h-6 rounded-full"
                                />
                            ) : (
                                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-xl">account_circle</span>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {motion.authorName || motion.authorInfo?.name || 'Anonymous'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MotionCard