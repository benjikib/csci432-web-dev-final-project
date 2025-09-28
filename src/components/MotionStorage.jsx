const motions = [
    {
        id: 1,
        title: "Motion to Stop People Having Fun in the Community",
        description: "I move that we should ban all forms of fun from the community.",
        fullDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        votes: 0
    },
    {
        id: 2,
        title: "Motion #2",
        description: "Another description.",
        fullDescription: "This is the full description for Motion #2. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        votes: 0
    }
]

export const getMotions = () => motions

export const getMotionById = (id) => motions.find(motion => motion.id === parseInt(id))

export default { getMotions, getMotionById }