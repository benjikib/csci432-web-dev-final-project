// Local storage for committees and their motions
let committees = [
    {
        id: 1,
        title: "Finance Committee",
        description: "Oversees budget, financial planning, and expense approvals for the community.",
        members: ["user1", "user2", "user3"]
    },
    {
        id: 2,
        title: "Landscaping Committee",
        description: "Manages community landscaping, garden maintenance, and outdoor aesthetics.",
        members: ["user2", "user4", "user5"]
    },
    {
        id: 3,
        title: "Safety & Security Committee",
        description: "Handles community safety measures, security protocols, and emergency preparedness.",
        members: ["user1", "user3", "user6"]
    }
];

// Motions organized by committee
const committeeMotions = {
    1: [ // Finance Committee motions
        {
            id: 1,
            committeeId: 1,
            title: "Motion to Approve Annual Budget",
            description: "I move that we approve the proposed annual budget for the next fiscal year.",
            fullDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            votes: 12
        },
        {
            id: 2,
            committeeId: 1,
            title: "Motion to Increase Reserve Fund",
            description: "Proposal to increase the reserve fund by 10% to prepare for emergencies.",
            fullDescription: "This motion proposes a strategic increase in our community reserve fund to ensure we have adequate resources for unexpected expenses and emergency situations.",
            votes: 8
        }
    ],
    2: [ // Landscaping Committee motions
        {
            id: 3,
            committeeId: 2,
            title: "Motion to Install New Garden Features",
            description: "I move that we install new decorative garden features in the community park.",
            fullDescription: "This proposal includes the installation of decorative planters, benches, and a small fountain to enhance the aesthetic appeal of our community park area.",
            votes: 15
        },
        {
            id: 4,
            committeeId: 2,
            title: "Motion to Hire Landscaping Service",
            description: "Proposal to contract a professional landscaping service for quarterly maintenance.",
            fullDescription: "To maintain the quality of our community grounds, this motion proposes hiring a professional landscaping service that will provide quarterly maintenance including mowing, trimming, and seasonal plantings.",
            votes: 6
        }
    ],
    3: [ // Safety & Security Committee motions
        {
            id: 5,
            committeeId: 3,
            title: "Motion to Stop People Having Fun in the Community",
            description: "I move that we should ban all forms of fun from the community.",
            fullDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            votes: 0
        },
        {
            id: 6,
            committeeId: 3,
            title: "Motion to Install Security Cameras",
            description: "Proposal to install security cameras at community entry points.",
            fullDescription: "This motion proposes the installation of modern security cameras at all main entry and exit points of the community to enhance safety and deter criminal activity.",
            votes: 20
        }
    ]
};

export const getCommittees = () => committees;

export const getCommitteeById = (id) => committees.find(committee => committee.id === parseInt(id));

export const getMotionsByCommittee = (committeeId) => {
    return committeeMotions[parseInt(committeeId)] || [];
};

export const getMotionById = (committeeId, motionId) => {
    const motions = committeeMotions[parseInt(committeeId)] || [];
    return motions.find(motion => motion.id === parseInt(motionId));
};

export const addMotion = (committeeId, motionData) => {
    const committeeIdInt = parseInt(committeeId);

    // Initialize array for committee if it doesn't exist
    if (!committeeMotions[committeeIdInt]) {
        committeeMotions[committeeIdInt] = [];
    }

    // Generate new ID based on existing motions
    let maxId = 0;
    Object.values(committeeMotions).flat().forEach(motion => {
        if (motion.id > maxId) maxId = motion.id;
    });

    // Create new motion with generated ID
    const newMotion = {
        ...motionData,
        id: maxId + 1,
        committeeId: committeeIdInt
    };

    // Add to committee motions
    committeeMotions[committeeIdInt].push(newMotion);

    return newMotion;
};

export const addCommittee = (committeeData) => {
    // Generate new ID based on existing committees
    let maxId = 0;
    committees.forEach(committee => {
        if (committee.id > maxId) maxId = committee.id;
    });

    // Create new committee with generated ID
    const newCommittee = {
        ...committeeData,
        id: maxId + 1,
        members: committeeData.members || []
    };

    // Add to committees array
    committees.push(newCommittee);

    // Initialize empty motions array for this committee
    committeeMotions[newCommittee.id] = [];

    return newCommittee;
};

export default {
    getCommittees,
    getCommitteeById,
    getMotionsByCommittee,
    getMotionById,
    addMotion,
    addCommittee
};
