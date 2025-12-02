export default function ActiveMotionsPanel() {
    // Hardcoded mock data for demo purposes
    const activeMotions = [
        {
            title: "Approve Budget Allocation for Q2",
            committeeName: "Finance Committee",
            status: "Voting Open",
            metadata: "Voting closes in 12 hours"
        },
        {
            title: "Update Community Bylaws",
            committeeName: "Planning Board",
            status: "In Discussion",
            metadata: "Updated 3 days ago"
        },
        {
            title: "Safety Protocol Revisions",
            committeeName: "Safety Committee",
            status: "Voting Open",
            metadata: "Voting closes in 2 days"
        },
        {
            title: "New Member Onboarding Process",
            committeeName: "Membership Committee",
            status: "In Discussion",
            metadata: "Updated 1 day ago"
        },
        {
            title: "Annual Report Approval",
            committeeName: "Finance Committee",
            status: "Closed",
            metadata: "Completed 5 days ago"
        }
    ];

    // For demo, we'll always show motions, but include fallback logic
    const hasMotions = activeMotions.length > 0;

    return (
        <div className="active-motions-panel">
            <h2 className="active-motions-title">Your Active Motions</h2>
            {hasMotions ? (
                <div className="active-motions-list">
                    {activeMotions.map((motion, index) => (
                        <div key={index} className="active-motion-card">
                            <div className="active-motion-content">
                                <div className="active-motion-header">
                                    <h3 className="active-motion-title">{motion.title}</h3>
                                    <span className={`active-motion-status-badge status-${motion.status.toLowerCase().replace(' ', '-')}`}>
                                        {motion.status}
                                    </span>
                                </div>
                                <div className="active-motion-committee">{motion.committeeName}</div>
                                <div className="active-motion-metadata">{motion.metadata}</div>
                            </div>
                            <div className="active-motion-actions">
                                <button className="active-motion-button">View / Vote</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="active-motions-empty">
                    <p>You have no active motions right now.</p>
                </div>
            )}
        </div>
    );
}

