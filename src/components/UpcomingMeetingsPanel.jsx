import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../services/notificationApi';

export default function UpcomingMeetingsPanel() {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMeetings() {
            try {
                setLoading(true);
                
                // Fetch all notifications
                const response = await getNotifications(1, 100);
                // console.log('Notifications response:', response);
                const notifications = response?.notifications || [];
                // console.log('All notifications:', notifications);
                
                // Filter for meeting_scheduled notifications and extract meeting data
                const meetingNotifications = notifications
                    .filter(notif => {
                        const isMeeting = notif.type === 'meeting_scheduled' && notif.metadata;
                        // console.log('Notification:', notif._id, 'is meeting?', isMeeting, 'metadata:', notif.metadata);
                        return isMeeting;
                    })
                    .map(notif => {
                        const meetingDate = new Date(notif.metadata.dateTime);
                        const now = new Date();
                        
                        // console.log('Meeting date:', meetingDate, 'Now:', now, 'Is future?', meetingDate >= now);
                        
                        // Only show upcoming meetings (not past ones)
                        if (meetingDate < now) return null;
                        
                        return {
                            id: notif._id,
                            committeeName: notif.committeeTitle || 'Committee',
                            committeeId: notif.committeeId,
                            dateTime: meetingDate.toLocaleString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }),
                            location: notif.metadata.location || 'TBD',
                            agenda: notif.metadata.agenda || '',
                            attending: true, // All members are considered attending by default
                            rawDate: meetingDate
                        };
                    })
                    .filter(Boolean);
                
                // console.log('Upcoming meetings found:', meetingNotifications);
                
                // Sort by date (soonest first)
                meetingNotifications.sort((a, b) => a.rawDate - b.rawDate);
                
                setMeetings(meetingNotifications);
            } catch (error) {
                console.error('Error fetching meetings:', error);
                setMeetings([]);
            } finally {
                setLoading(false);
            }
        }

        fetchMeetings();
        
        // Refresh meetings every 30 seconds
        const interval = setInterval(fetchMeetings, 30000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="upcoming-meetings-panel">
            <h2 className="upcoming-meetings-title">Upcoming Meetings</h2>
            {loading ? (
                <div className="p-8 text-center text-gray-500">
                    <p>Loading meetings...</p>
                </div>
            ) : meetings.length > 0 ? (
                <>
                    <div className="upcoming-meetings-list">
                        {meetings.slice(0, 4).map((meeting) => (
                            <div key={meeting.id} className="upcoming-meeting-item">
                                <div className="upcoming-meeting-header">
                                    <h3 className="upcoming-meeting-committee">{meeting.committeeName}</h3>
                                    {meeting.attending && (
                                        <span className="upcoming-meeting-badge">Attending</span>
                                    )}
                                </div>
                                <div className="upcoming-meeting-details">
                                    <div className="upcoming-meeting-datetime">{meeting.dateTime}</div>
                                    <div className="upcoming-meeting-location">{meeting.location}</div>
                                    {meeting.agenda && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            {meeting.agenda}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {meetings.length > 4 && (
                        <div className="upcoming-meetings-footer">
                            <button 
                                className="upcoming-meetings-view-all"
                                onClick={() => navigate('/notifications')}
                            >
                                View all {meetings.length} meetings
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="p-8 text-center text-gray-500">
                    <p>No upcoming meetings scheduled</p>
                </div>
            )}
        </div>
    );
}

