export default function AnalyticsPanel() {
    // Hardcoded mock data for demo purposes
    const analyticsData = [
        {
            label: "Votes cast this week",
            value: "7",
            subtitle: null
        },
        {
            label: "Motions requiring your vote",
            value: "2",
            subtitle: "Still open for voting"
        },
        {
            label: "New comments",
            value: "4",
            subtitle: "On motions you're involved in"
        },
        {
            label: "Upcoming deadlines",
            value: "1",
            subtitle: "1 vote closing in 12 hours"
        },
        {
            label: "Committees you're active in",
            value: "3",
            subtitle: null
        },
        {
            label: "Motions participated in (30 days)",
            value: "11",
            subtitle: "Voted or commented"
        }
    ];

    return (
        <div className="analytics-panel">
            <h2 className="analytics-title">Analytics</h2>
            <div className="analytics-grid">
                {analyticsData.map((stat, index) => (
                    <div key={index} className="analytics-stat-card">
                        <div className="analytics-stat-label">{stat.label}</div>
                        <div className="analytics-stat-value">{stat.value}</div>
                        {stat.subtitle && (
                            <div className="analytics-stat-subtitle">{stat.subtitle}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

