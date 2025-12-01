import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { BsFillFilterSquareFill, BsChatLeftDotsFill, BsCheckCircleFill, BsTrashFill, BsListUl } from "react-icons/bs"
import MotionDetailsComments from "./MotionDetailsComments"
import { getMotionById, deleteMotion } from "../services/motionApi"
import { getCurrentUser } from '../services/userApi'
import { getCommitteeMembers, getCommitteeById } from '../services/committeeApi'
import { getVotes, castVote, removeVote } from '../services/voteApi'
import { getSubsidiaryMotions } from '../services/motionApi'
import { checkVotingEligibility, secondMotion } from '../services/motionControlApi'
import NoAccessPage from './NoAccessPage'

function MotionDetails() {
    const { committeeId, motionId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [motion, setMotion] = useState(null)
    const [parentMotion, setParentMotion] = useState(null)
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
                const motionObj = data.motion || data;
                setMotion(motionObj);
                // If the motion is a subsidiary of another motion, fetch parent motion for display
                const parentId = motionObj.targetMotionId || motionObj.targetMotionId?._id || motionObj.amendTargetMotionId || motionObj.amendTargetMotionId?._id;
                if (parentId) {
                    try {
                        const pm = await getMotionById(committeeId, String(parentId));
                        setParentMotion(pm.motion || pm);
                    } catch (e) {
                        setParentMotion(null);
                    }
                } else {
                    setParentMotion(null);
                }
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
    
    // Extract current user ID - check all possible formats
    const currentUserId = currentUserState?._id || currentUserState?.id || currentUserState?.userId;
    const isAuthor = motion && currentUserId && (String(motion.author) === String(currentUserId));
    
    const [isDeleting, setIsDeleting] = useState(false);

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
    const [voteSummary, setVoteSummary] = useState(null);
    const [userVote, setUserVote] = useState(null);
    const [isCastingVote, setIsCastingVote] = useState(false);
    const [subsidiaryMotions, setSubsidiaryMotions] = useState([]);
    const [subsidiaryLoading, setSubsidiaryLoading] = useState(false);
    const [subsidiaryError, setSubsidiaryError] = useState(null);
    const [votingEligibility, setVotingEligibility] = useState(null);
    const [committeeSettings, setCommitteeSettings] = useState(null);
    const [isSeconding, setIsSeconding] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log('MotionDetailsPage - Current User ID:', currentUserId);
        console.log('MotionDetailsPage - Motion Author:', motion?.author);
        console.log('MotionDetailsPage - Is Author:', isAuthor);
        console.log('MotionDetailsPage - Can Vote:', canVote);
        console.log('MotionDetailsPage - Require Second:', committeeSettings?.requireSecond);
        console.log('MotionDetailsPage - Seconded By:', motion?.secondedBy);
    }, [currentUserId, motion, isAuthor, canVote, committeeSettings]);

    // fetch votes for the motion and set state
    const fetchVotes = async () => {
        try {
            const data = await getVotes(committeeId, motionId);
            // API returns { success, summary, userVote }
            if (data && data.summary) {
                setVoteSummary(data.summary);
                // If the motion object has a votes property, update it for display consistency
                setMotion(prev => ({ ...(prev || {}), votes: data.summary }));
            }
            if (data && data.userVote) {
                setUserVote(data.userVote);
            } else {
                setUserVote(null);
            }
        } catch (err) {
            console.warn('Failed to load votes', err);
        }
    }

    useEffect(() => {
        if (committeeId && motionId) {
            fetchVotes();
        }
    }, [committeeId, motionId]);

    // Fetch committee settings
    useEffect(() => {
        async function fetchCommitteeSettings() {
            try {
                const data = await getCommitteeById(committeeId);
                console.log('Committee data:', data);
                console.log('Committee settings:', data?.settings);
                console.log('Committee.settings:', data?.committee?.settings);
                
                // Try different possible structures
                const settings = data?.settings || data?.committee?.settings;
                if (settings) {
                    setCommitteeSettings(settings);
                    console.log('Set committee settings:', settings);
                } else {
                    console.warn('No settings found in committee data');
                }
            } catch (err) {
                console.warn('Failed to fetch committee settings', err);
            }
        }
        if (committeeId) {
            fetchCommitteeSettings();
        }
    }, [committeeId]);

    // Fetch voting eligibility
    useEffect(() => {
        if (committeeId && motionId && activeTab === 'voting') {
            fetchVotingEligibility();
        }
    }, [committeeId, motionId, activeTab]);

    // Fetch votes whenever user switches to the voting tab
    useEffect(() => {
        if (activeTab === 'voting' && committeeId && motionId) {
            fetchVotes();
        }
        if (activeTab === 'subsidiaries' && committeeId && motionId) {
            fetchSubsidiaries();
        }
    }, [activeTab, committeeId, motionId]);

    const fetchSubsidiaries = async () => {
        if (!committeeId || !motionId) return;
        try {
            setSubsidiaryLoading(true);
            setSubsidiaryError(null);
            const res = await getSubsidiaryMotions(committeeId, motionId);
            if (res && res.subsidiaryMotions) {
                setSubsidiaryMotions(res.subsidiaryMotions);
            } else {
                setSubsidiaryMotions([]);
            }
        } catch (err) {
            console.warn('Failed to load subsidiary motions', err);
            setSubsidiaryError(err.message || 'Failed to fetch subsidiaries');
            setSubsidiaryMotions([]);
        } finally {
            setSubsidiaryLoading(false);
        }
    }

    const handleCastVote = async (voteValue) => {
        if (!canVote || isCastingVote) return;
        setIsCastingVote(true);
        try {
            const res = await castVote(committeeId, motionId, voteValue, false);
            if (res && res.summary) {
                setVoteSummary(res.summary);
                setMotion(prev => ({ ...(prev || {}), votes: res.summary }));
            }
            if (res && res.vote) {
                setUserVote(res.vote);
            }
            // Refresh voting eligibility after vote
            await fetchVotingEligibility();
            
            // Refresh motion data to get updated status (passed/failed)
            try {
                const motionRes = await getMotionById(committeeId, motionId);
                if (motionRes && motionRes.motion) {
                    setMotion(motionRes.motion);
                }
            } catch (err) {
                console.warn('Failed to refresh motion after vote:', err);
            }
        } catch (err) {
            console.error('Error casting vote', err);
            alert(err.message || 'Failed to cast vote');
        } finally {
            setIsCastingVote(false);
        }
    }

    const handleRemoveVote = async () => {
        if (!canVote || isCastingVote) return;
        setIsCastingVote(true);
        try {
            const res = await removeVote(committeeId, motionId);
            if (res && res.summary) {
                setVoteSummary(res.summary);
                setMotion(prev => ({ ...(prev || {}), votes: res.summary }));
            }
            setUserVote(null);
        } catch (err) {
            console.error('Error removing vote', err);
        } finally {
            setIsCastingVote(false);
        }
    }

    const fetchVotingEligibility = async () => {
        try {
            const data = await checkVotingEligibility(committeeId, motionId);
            if (data && data.success) {
                setVotingEligibility(data);
            }
        } catch (err) {
            console.warn('Failed to check voting eligibility', err);
        }
    }

    const handleSecondMotion = async () => {
        if (!canVote || isSeconding) return;
        setIsSeconding(true);
        try {
            const res = await secondMotion(committeeId, motionId);
            if (res && res.success) {
                // Update motion with secondedBy
                setMotion(res.motion);
                // Refresh voting eligibility
                await fetchVotingEligibility();
                // Refresh votes
                await fetchVotes();
                alert('Motion seconded successfully!');
            }
        } catch (err) {
            console.error('Error seconding motion', err);
            alert(err.message || 'Failed to second motion');
        } finally {
            setIsSeconding(false);
        }
    }

    const handleDeleteMotion = async () => {
        if (!isAuthor && !isAdmin) return;
        if (!confirm('Are you sure you want to delete this motion? This cannot be undone.')) return;
        setIsDeleting(true);
            try {
                await deleteMotion(committeeId, motionId);
                // Navigate back to committee page and notify it to refresh and remove the motion card
                navigate(`/committee/${committeeId}`, { state: { deletedMotionId: motionId } });
        } catch (err) {
            console.error('Failed to delete motion', err);
            alert('Failed to delete motion');
        } finally {
            setIsDeleting(false);
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
                    {/* Action buttons moved to sidebar */}
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
                    {parentMotion && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                            <span className="text-xs mr-1 text-gray-600 dark:text-gray-400">Parent Motion:</span>
                            <button className="text-sm text-darker-green dark:text-lighter-green hover:underline" onClick={() => navigate(`/committee/${committeeId}/motion/${parentMotion._id || parentMotion.id}`, { state: { background: location } })}>
                                {parentMotion.title}
                            </button>
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
                        <button
                            className={`tab-button ${activeTab === "subsidiaries" ? "active" : ""}`}
                            onClick={() => setActiveTab("subsidiaries")}
                            title="Subsidiary Motions"
                        >
                            <BsListUl />
                        </button>
                        {(isAuthor || isAdmin) && (
                            <button
                                className={`tab-button delete`}
                                onClick={handleDeleteMotion}
                                title="Delete Motion"
                                disabled={isDeleting}
                                aria-label="Delete Motion"
                            >
                                <BsTrashFill />
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

                                <MotionDetailsComments 
                                    committeeId={committeeId} 
                                    motionId={motionId} 
                                    isDebatable={motion.debatable !== false}
                                />
                                
                            </div>
                        )}

                        {activeTab === "voting" && (
                            <div className="tab-content">
                                <h3 className="content-title">Vote on this Motion</h3>
                                
                                {/* No vote required message */}
                                {motion.voteRequired === 'none' ? (
                                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">
                                                info
                                            </span>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg mb-1 text-blue-800 dark:text-blue-200">
                                                    No Vote Required
                                                </h4>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    This motion does not require a vote. The chair will handle this matter directly.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                {/* Motion Status Banner (if passed/failed) */}
                                {(motion.status === 'passed' || motion.status === 'failed') && (
                                    <div className={`mb-4 p-4 rounded-lg border ${
                                        motion.status === 'passed'
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    }`}>
                                        <div className="flex items-start gap-3">
                                            <span className={`material-symbols-outlined text-3xl ${
                                                motion.status === 'passed'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {motion.status === 'passed' ? 'check_circle' : 'cancel'}
                                            </span>
                                            <div className="flex-1">
                                                <h4 className={`font-bold text-lg mb-1 ${
                                                    motion.status === 'passed'
                                                        ? 'text-green-800 dark:text-green-200'
                                                        : 'text-red-800 dark:text-red-200'
                                                }`}>
                                                    Motion {motion.status === 'passed' ? 'Passed' : 'Failed'}
                                                </h4>
                                                <p className={`text-sm ${
                                                    motion.status === 'passed'
                                                        ? 'text-green-700 dark:text-green-300'
                                                        : 'text-red-700 dark:text-red-300'
                                                }`}>
                                                    Voting closed on {motion.votingClosedAt ? new Date(motion.votingClosedAt).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Voting Eligibility Banner */}
                                {votingEligibility && motion.status !== 'passed' && motion.status !== 'failed' && (
                                    <div className={`mb-4 p-4 rounded-lg border ${
                                        votingEligibility.eligible 
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                    }`}>
                                        <div className="flex items-start gap-3">
                                            <span className={`material-symbols-outlined text-2xl ${
                                                votingEligibility.eligible 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-yellow-600 dark:text-yellow-400'
                                            }`}>
                                                {votingEligibility.eligible ? 'check_circle' : 'info'}
                                            </span>
                                            <div className="flex-1">
                                                <h4 className={`font-semibold mb-1 ${
                                                    votingEligibility.eligible 
                                                        ? 'text-green-800 dark:text-green-200' 
                                                        : 'text-yellow-800 dark:text-yellow-200'
                                                }`}>
                                                    {votingEligibility.eligible ? 'Voting is Open' : 'Requirements Not Met'}
                                                </h4>
                                                <ul className="text-sm space-y-1">
                                                    {votingEligibility.reasons?.map((reason, idx) => (
                                                        <li key={idx} className={
                                                            votingEligibility.eligible 
                                                                ? 'text-green-700 dark:text-green-300' 
                                                                : 'text-yellow-700 dark:text-yellow-300'
                                                        }>
                                                            • {reason}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Second Motion Button */}
                                {committeeSettings?.requireSecond && !motion.secondedBy && canVote && !isAuthor && motion.status !== 'passed' && motion.status !== 'failed' && (
                                    <div className="mb-4">
                                        <button
                                            onClick={handleSecondMotion}
                                            disabled={isSeconding}
                                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined">
                                                {isSeconding ? 'progress_activity' : 'thumb_up'}
                                            </span>
                                            {isSeconding ? 'Seconding...' : 'Second this Motion'}
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
                                            Seconding this motion will record a "yes" vote and may enable voting
                                        </p>
                                    </div>
                                )}

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
                                            onClick={() => handleCastVote('yes')}
                                            disabled={!canVote || isCastingVote || motion.status === 'passed' || motion.status === 'failed'}
                                        >Vote Yes</button>
                                        <button
                                            className="vote-button vote-no"
                                            onClick={() => handleCastVote('no')}
                                            disabled={!canVote || isCastingVote || motion.status === 'passed' || motion.status === 'failed'}
                                        >Vote No</button>
                                        {committeeSettings?.allowAbstentions !== false && (
                                            <button
                                                className="vote-button vote-abstain"
                                                onClick={() => handleCastVote('abstain')}
                                                disabled={!canVote || isCastingVote || motion.status === 'passed' || motion.status === 'failed'}
                                            >Abstain</button>
                                        )}
                                        {userVote && (
                                            <button 
                                                className="vote-button vote-remove" 
                                                onClick={handleRemoveVote} 
                                                disabled={!canVote || isCastingVote || motion.status === 'passed' || motion.status === 'failed'}
                                            >Remove Vote</button>
                                        )}
                                        {userVote && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                Your vote: <span className="font-semibold uppercase">{userVote.vote}</span>
                                            </div>
                                        )}
                                    </div>
                                    {!canVote && (
                                        <div className="mt-3 text-sm text-gray-500">Guests cannot vote on motions.</div>
                                    )}
                                </div>
                                </>
                                )}
                            </div>
                        )}

                        {activeTab === "subsidiaries" && (
                            <div className="tab-content">
                                <h3 className="content-title">Subsidiary Motions</h3>
                                {subsidiaryLoading ? (
                                    <p>Loading subsidiary motions...</p>
                                ) : subsidiaryError ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-4">{subsidiaryError}</div>
                                ) : subsidiaryMotions.length === 0 ? (
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">No subsidiary motions found</p>
                                ) : (
                                    <div className="space-y-3">
                                        {subsidiaryMotions.map(sm => (
                                            <button
                                                key={sm._id || sm.id}
                                                className="block text-left p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[120px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                style={{ width: '100%' }}
                                                onClick={() => navigate(`/committee/${committeeId}/motion/${sm._id || sm.id}`, { state: { background: location } })}
                                            >
                                                <div className="flex justify-between items-start gap-2 h-full">
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">{sm.title}</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{sm.description}</div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">#{(sm._id || sm.id).toString().slice(0, 6)}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default MotionDetails