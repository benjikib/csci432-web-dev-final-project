import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import Tabs from './reusable/Tabs';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [searchedTerm, setSearchedTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // Mock notification data - will be replaced with real data later
    const mockNotifications = [
        {
            id: 1,
            type: 'vote',
            title: 'New motion requires your vote',
            message: 'Motion "Update Budget Allocation" in Finance Committee is now open for voting',
            committee: 'Finance Committee',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            read: false,
            icon: 'how_to_vote',
            color: 'amber'
        },
        {
            id: 2,
            type: 'comment',
            title: 'New comment on your motion',
            message: 'John Doe commented on "Implement New Policy"',
            committee: 'Policy Committee',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            read: false,
            icon: 'comment',
            color: 'blue'
        },
        {
            id: 3,
            type: 'motion_passed',
            title: 'Motion passed',
            message: 'Your motion "Security Updates" has passed with 8 votes in favor',
            committee: 'IT Committee',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            read: true,
            icon: 'check_circle',
            color: 'green'
        },
        {
            id: 4,
            type: 'member_added',
            title: 'Added to new committee',
            message: 'You have been added to the Marketing Committee',
            committee: 'Marketing Committee',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            read: true,
            icon: 'group_add',
            color: 'lighter-green'
        },
        {
            id: 5,
            type: 'deadline',
            title: 'Voting deadline approaching',
            message: 'Motion "Annual Review" voting closes in 24 hours',
            committee: 'Admin Committee',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            read: false,
            icon: 'alarm',
            color: 'red'
        }
    ];

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - timestamp) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return timestamp.toLocaleDateString();
    };

    const getIconColor = (color) => {
        const colors = {
            amber: 'text-amber-500 bg-amber-500/10',
            blue: 'text-blue-500 bg-blue-500/10',
            green: 'text-green-500 bg-green-500/10',
            'lighter-green': 'text-lighter-green bg-lighter-green/10',
            red: 'text-red-500 bg-red-500/10'
        };
        return colors[color] || 'text-gray-500 bg-gray-500/10';
    };

    const filteredNotifications = activeTab === 'unread'
        ? mockNotifications.filter(n => !n.read)
        : mockNotifications;

    const unreadCount = mockNotifications.filter(n => !n.read).length;

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-20 px-8 pb-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="section-title dark:text-gray-100">Notifications</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Stay updated on your committees and motions
                        </p>
                    </div>

                    {/* Stats */}
                    {unreadCount > 0 && (
                        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                                    notification_important
                                </span>
                                <p className="text-amber-900 dark:text-amber-200 font-medium">
                                    You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="mb-6">
                        <Tabs
                            tabs={[
                                { id: "all", label: "All Notifications" },
                                { id: "unread", label: `Unread (${unreadCount})` }
                            ]}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-3">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                                        notification.read
                                            ? 'border-gray-200 dark:border-gray-700'
                                            : 'border-lighter-green dark:border-lighter-green'
                                    } p-5 hover:shadow-md transition-all cursor-pointer`}
                                >
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getIconColor(notification.color)} flex items-center justify-center`}>
                                            <span className={`material-symbols-outlined text-2xl`}>
                                                {notification.icon}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className={`font-semibold ${
                                                    notification.read
                                                        ? 'text-gray-900 dark:text-gray-100'
                                                        : 'text-gray-900 dark:text-white'
                                                }`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-lighter-green"></span>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">groups</span>
                                                    {notification.committee}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                                    {getTimeAgo(notification.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-3">
                                    notifications_off
                                </span>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    No unread notifications
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                    You're all caught up!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {filteredNotifications.length > 0 && (
                        <div className="mt-6 text-center">
                            <button className="text-sm text-lighter-green hover:text-darker-green font-medium">
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
