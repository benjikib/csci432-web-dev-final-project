import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import { getCurrentUser, hasRole } from '../services/userApi';
import AnalyticsPanel from './AnalyticsPanel';
import UpcomingMeetingsPanel from './UpcomingMeetingsPanel';
import ActiveMotionsPanel from './ActiveMotionsPanel';

export default function HomePage() {
    const navigate = useNavigate();
    const [searchedTerm, setSearchedTerm] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        let mounted = true;
        async function fetchUser() {
            try {
                const res = await getCurrentUser();
                if (!mounted) return;
                if (res && res.user) {
                    setUser(res.user);
                    setIsAdmin(hasRole(res.user, 'admin'));
                } else {
                    setUser(null);
                    setIsAdmin(false);
                }
            } catch (e) {
                setUser(null);
                setIsAdmin(false);
            }
        }
        fetchUser();
        return () => { mounted = false; };
    }, []);

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            {/* Full-width content area offset by the sidebar, with small safe padding */}
            <div className="mt-16 ml-[16rem] px-4 py-4 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                {/* Homepage outline placeholder using the new CSS classes */}
                <div className="home-outline">
                    <div className="left-column">
                        <div className="box big-box">
                            <h2 className="welcome-text">
                                <span className="welcome-bold">Welcome</span> {user?.name || 'User'}
                            </h2>
                            <ActiveMotionsPanel />
                        </div>
                    </div>

                    <div className="right-column">
                        {/* Top-right large box that aligns with the big left box */}
                        <div className="box top-right-box">
                            <UpcomingMeetingsPanel />
                        </div>

                        {/* Two smaller boxes below the top-right box */}
                        <div className="box small-box home-action-box" onClick={() => navigate("/committees")}>
                            <div className="home-action-content">
                                <span className="material-symbols-outlined home-action-icon">groups</span>
                                <div className="home-action-text">
                                    <h3 className="home-action-title">Committees</h3>
                                    <p className="home-action-subtitle">View and manage your committees</p>
                                </div>
                            </div>
                        </div>
                        <div className="box small-box home-action-box" onClick={() => navigate("/create-committee")}>
                            <div className="home-action-content">
                                <span className="material-symbols-outlined home-action-icon">add_circle</span>
                                <div className="home-action-text">
                                    <h3 className="home-action-title">Create Committee</h3>
                                    <p className="home-action-subtitle">Start a new committee</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bottom-box box">
                        <AnalyticsPanel />
                    </div>
                </div>
            </div>
        </>
    );
}
