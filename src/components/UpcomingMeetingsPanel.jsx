export default function UpcomingMeetingsPanel() {
    // Hardcoded mock data for demo purposes
    const meetings = [
        {
            committeeName: "Finance Committee",
            dateTime: "March 15, 2024 at 2:00 PM",
            location: "Room 204",
            attending: true
        },
        {
            committeeName: "Planning Board",
            dateTime: "March 18, 2024 at 10:00 AM",
            location: "Zoom",
            attending: true
        },
        {
            committeeName: "Safety Committee",
            dateTime: "March 20, 2024 at 3:30 PM",
            location: "Room 101",
            attending: false
        },
        {
            committeeName: "Budget Review",
            dateTime: "March 22, 2024 at 1:00 PM",
            location: "Room 305",
            attending: true
        }
    ];

    return (
        <div className="upcoming-meetings-panel">
            <h2 className="upcoming-meetings-title">Upcoming Meetings</h2>
            <div className="upcoming-meetings-list">
                {meetings.map((meeting, index) => (
                    <div key={index} className="upcoming-meeting-item">
                        <div className="upcoming-meeting-header">
                            <h3 className="upcoming-meeting-committee">{meeting.committeeName}</h3>
                            {meeting.attending && (
                                <span className="upcoming-meeting-badge">Attending</span>
                            )}
                        </div>
                        <div className="upcoming-meeting-details">
                            <div className="upcoming-meeting-datetime">{meeting.dateTime}</div>
                            <div className="upcoming-meeting-location">{meeting.location}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="upcoming-meetings-footer">
                <button className="upcoming-meetings-view-all">View all meetings</button>
            </div>
        </div>
    );
}

