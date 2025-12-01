import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { BsFillFilterSquareFill, BsChatLeftDotsFill, BsCheckCircleFill } from "react-icons/bs"
import MotionDetailsComments from "./MotionDetailsComments"
import { getMotionById } from "../services/motionApi"
import { getCurrentUser } from '../services/userApi'
import { getCommitteeMembers, getCommitteeById } from '../services/committeeApi'
import NoAccessPage from './NoAccessPage'

function MotionDetails() {
    const { committeeId, motionId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [motion, setMotion] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState("description")
    const [hasAccess, setHasAccess] = useState(null)
    const [currentUserState, setCurrentUserState] = useState(null)
    const [isGuest, setIsGuest] = useState(false)
    const [isMember, setIsMember] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isChair, setIsChair] = useState(false)

    // Fetch motion details from API when component mounts
    useEffect(() => {
        async function fetchMotion() {
            try {
                setLoading(true);
                setError(null);
                const data = await getMotionById(committeeId, motionId);
                setMotion(data.motion || data);
                // Access check: ensure current user is allowed to view motions for this committee
                let allowed = false;
                try {
                    const current = await getCurrentUser();
                    const user = (current && (current.user || current.data)) || current || null;
                    setCurrentUserState(user);
                    const userId = user && (String(user.id || user._id || user._id || user._id));
                    const userRoles = user && user.roles ? user.roles : [];
                    const adminFlag = userRoles.includes('admin');
                    setIsAdmin(Boolean(adminFlag));
                    if (adminFlag) allowed = true;

                    // Prefer committee.myRole if available (faster and more accurate)
                    try {
                        const cdata = await getCommitteeById(committeeId);
                        const myRole = cdata && cdata.myRole ? cdata.myRole : null;
                        setIsAdmin(Boolean(adminFlag));
                        setIsChair(Boolean(myRole === 'chair' || myRole === 'owner'));
                        setIsMember(Boolean(myRole === 'member' || myRole === 'chair' || myRole === 'owner'));
                        setIsGuest(Boolean(myRole === 'guest'));
                        // Any confirmed committee role (member/chair/owner/guest) can view motion details.
                        // Guests are intentionally allowed to view the motion but cannot vote.
                        if (myRole) allowed = true;
                    } catch (e) {
                        // fallback to older approach
                        try {
                            const membersRes = await getCommitteeMembers(committeeId);
                            const membersList = (membersRes && membersRes.members) || [];
                            let memberFound = userId && membersList.some(m => {
                                if (!m) return false;
                                const mid = m._id || m.id || m.userId || m;
                                return String(mid) === userId;
                            });
                            // If no match found in members list, fall back to user.memberCommittees
                            if (!memberFound && user && Array.isArray(user.memberCommittees)) {
                                memberFound = user.memberCommittees.map(String).includes(String(committeeId));
                            }
                            setIsMember(Boolean(memberFound));
                            if (memberFound) allowed = true;

                            // determine guest status from user object if present
                            let guestFlag = false;
                            if (user && Array.isArray(user.guestCommittees)) {
                                guestFlag = user.guestCommittees.some(g => String(g) === String(committeeId) || String(g?._id) === String(committeeId));
                            }
                            // Also allow guest determination from user.guestCommittees with legacy _id fields
                            if (!guestFlag && user && Array.isArray(user.guestCommittees)) {
                                guestFlag = user.guestCommittees.map(String).includes(String(committeeId));
                            }
                            // Also set isChair from user.ownedCommittees if available
                            if (user && Array.isArray(user.ownedCommittees)) {
                                setIsChair(user.ownedCommittees.map(String).includes(String(committeeId)));
                            }
                            setIsGuest(Boolean(guestFlag));
                            // If the user is a declared guest in the user doc, they should still be allowed to view
                            if (guestFlag) allowed = true;
                        } catch (e) {
                            console.warn('Failed to fetch committee members for access check:', e);
                        }
                    }
                } catch (e) {
                    allowed = false;
                }

                setHasAccess(Boolean(allowed));
            } catch (err) {
                console.error('Error fetching motion:', err);
                setError(err.message || 'Failed to load motion');
            } finally {
                setLoading(false);
            }
        }

        if (committeeId && motionId) {
            fetchMotion();
        }
    }, [committeeId, motionId])

    const canVote = !isGuest && (isAdmin || isMember)

    useEffect(() => {
        if (!canVote && activeTab === 'voting') {
            setActiveTab('description')
        }
    }, [canVote, activeTab])

    const handleClose = () => {
        // If there's a background state, go back; otherwise, navigate to committee page
        if (location.state?.background) {
            navigate(-1)
        } else {
            navigate(`/committee/${committeeId}`)
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    // voting logic

    const [numberOfYesVotes, setNumberOfYesVotes] = useState(motion?.votes?.yes || 0);

    const handleYesVote = () => {
        if (motion && motion.votes) {
            motion.votes.yes = (motion.votes.yes || 0) + 1;
            setNumberOfYesVotes(numberOfYesVotes + 1);
        }
    }

    if (loading) {
        return (
            <div className="modal-backdrop" onClick={handleBackdropClick}>
                <div className="modal-content">
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                    <div className="details-container">
                        <div className="details-motion-title">Loading motion details...</div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !motion) {
        return (
            <div className="modal-backdrop" onClick={handleBackdropClick}>
                <div className="modal-content">
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                    <div className="details-container">
                        {error ? (
                            <>
                                <div className="details-motion-title">Error Loading Motion</div>
                                {/* Error Banner */}
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-4">
                                    Failed to load motion details
                                </div>
                            </>
                        ) : (
                            <div className="details-motion-title">Motion Not Found</div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (hasAccess === false) {
        return (
            <div className="modal-backdrop" onClick={handleBackdropClick}>
                <div className="modal-content">
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                    <div className="details-container">
                        <NoAccessPage committeeId={committeeId} committeeTitle={null} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content modal-content-tabbed">
                <button className="modal-close" onClick={handleClose}>&times;</button>

                <div className="modal-header">
                    <h2 className="modal-title">{motion.title}</h2>
                    <p className="modal-subtitle">{motion.description}</p>
                    {(motion.authorName || motion.authorInfo) && (
                        <div className="flex items-center gap-2 mt-3 text-gray-600 dark:text-gray-400">
                            {motion.authorInfo?.picture ? (
                                <img
                                    src={motion.authorInfo.picture}
                                    alt={motion.authorName || motion.authorInfo.name}
                                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                />
                            ) : (
                                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-3xl">account_circle</span>
                            )}
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {motion.authorName || motion.authorInfo?.name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                    Motion Author
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-body">
                    <div className="modal-sidebar">
                        <button
                            className={`tab-button ${activeTab === "description" ? "active" : ""}`}
                            onClick={() => setActiveTab("description")}
                            title="Description"
                        >
                            <BsFillFilterSquareFill />
                        </button>
                        <button
                            className={`tab-button ${activeTab === "comments" ? "active" : ""}`}
                            onClick={() => setActiveTab("comments")}
                            title="Comments"
                        >
                            <BsChatLeftDotsFill />
                        </button>
                        {canVote && (
                            <button
                                className={`tab-button ${activeTab === "voting" ? "active" : ""}`}
                                onClick={() => setActiveTab("voting")}
                                title="Voting"
                            >
                                <BsCheckCircleFill />
                            </button>
                        )}
                    </div>

                    <div className="modal-main-content">
                        {activeTab === "description" && (
                            <div className="tab-content">
                                <h3 className="content-title">Full Description</h3>
                                <p className="content-text">{motion.fullDescription}</p>
                            </div>
                        )}

                        {activeTab === "comments" && (
                            <div className="tab-content">

                                <MotionDetailsComments committeeId={committeeId} motionId={motionId} />
                                
                            </div>
                        )}

                        {activeTab === "voting" && (
                            <div className="tab-content">
                                <h3 className="content-title">Vote on this Motion</h3>
                                <div className="voting-section">
                                    <div className="vote-count">
                                        <span className="vote-number">{(motion.votes?.yes || 0) + (motion.votes?.no || 0) + (motion.votes?.abstain || 0)}</span>
                                        <span className="vote-label">Total Votes</span>
                                        <div className="vote-breakdown">
                                            <div>Yes: {motion.votes?.yes || 0}</div>
                                            <div>No: {motion.votes?.no || 0}</div>
                                            <div>Abstain: {motion.votes?.abstain || 0}</div>
                                        </div>
                                    </div>
                                    <div className="vote-buttons">
                                        <button
                                            className="vote-button vote-yes"
                                            onClick={handleYesVote}
                                            disabled={!canVote}
                                        >Vote Yes</button>
                                        <button className="vote-button vote-no" disabled={!canVote}>Vote No</button>
                                    </div>
                                    {!canVote && (
                                        <div className="mt-3 text-sm text-gray-500">Guests cannot vote on motions.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default MotionDetails