import { useLocation } from "react-router-dom"
import HeaderNav from './reusable/HeaderNav'
import SideBar from './reusable/SideBar'

function Profile() {
    const location = useLocation();
    const { user } = location.state || {
        user: {
            first_name: "John",
            last_name: "Doe",
            username: "johndoe",
            privilege: "Member",
            email: "john.doe@example.com",
            pn: "+1 (555) 123-4567",
            comid: "COM123456"
        }
    };

    return (
        <>
            <HeaderNav />
            {/* <SideBar /> */}
            <div className="mt-20 flex justify-center min-h-0 p-8">
                <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>

                    <div className="flex items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-lighter-green flex items-center justify-center text-white text-2xl font-bold">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-semibold text-gray-800">{user.username}</h3>
                            <p className="text-gray-600">{user.privilege}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-superlight-green border-1 border-darker-green p-4 rounded-lg relative">
                            <button 
                                className="absolute top-4 right-4 text-lighter-green hover:text-darker-green"
                                onClick={() => {/* Add edit functionality */}}
                            >
                                <span className="material-symbols-outlined">edit_square</span>
                            </button>
                            <p className="text-sm text-gray-600 mb-1">First Name</p>
                            <p className="text-gray-800 font-medium">{user.first_name}</p>
                        </div>

                        <div className="bg-superlight-green border-1 border-darker-green p-4 rounded-lg relative">
                            <button 
                                className="absolute top-4 right-4 text-lighter-green hover:text-darker-green"
                                onClick={() => {/* Add edit functionality */}}
                            >
                                <span className="material-symbols-outlined">edit_square</span>
                            </button>
                            <p className="text-sm text-gray-600 mb-1">Last Name</p>
                            <p className="text-gray-800 font-medium">{user.last_name}</p>
                        </div>

                        <div className="bg-superlight-green border-1 border-darker-green p-4 rounded-lg relative">
                            <button 
                                className="absolute top-4 right-4 text-lighter-green hover:text-darker-green"
                                onClick={() => {/* Add edit functionality */}}
                            >
                                <span className="material-symbols-outlined">edit_square</span>
                            </button>
                            <p className="text-sm text-gray-600 mb-1">Email</p>
                            <p className="text-gray-800 font-medium">{user.email}</p>
                        </div>

                        <div className="bg-superlight-green border-1 border-darker-green p-4 rounded-lg relative">
                            <button 
                                className="absolute top-4 right-4 text-lighter-green hover:text-darker-green"
                                onClick={() => {/* Add edit functionality */}}
                            >
                                <span className="material-symbols-outlined">edit_square</span>
                            </button>
                            <p className="text-sm text-gray-600 mb-1">Phone</p>
                            <p className="text-gray-800 font-medium">{user.pn}</p>
                        </div>

                        <div className="bg-superlight-green border-1 border-darker-green p-4 rounded-lg relative">
                            <button 
                                className="absolute top-4 right-4 text-lighter-green hover:text-darker-green"
                                onClick={() => {/* Add edit functionality */}}
                            >
                                <span className="material-symbols-outlined">edit_square</span>
                            </button>
                            <p className="text-sm text-gray-600 mb-1">Community ID</p>
                            <p className="text-gray-800 font-medium">{user.comid}</p>
                        </div>
                    </div>

                    {/* Motions Section */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">My Motions</h3>
                        <div className="space-y-4">
                            {/* Motions I Chair */}
                            <div className="bg-superlight-green border-1 border-darker-green p-4 rounded-lg">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Motions I Chair</h4>
                                <div className="space-y-2">
                                    {user.chairedMotions?.length > 0 ? (
                                        user.chairedMotions.map(motion => (
                                            <div key={motion.id} className="p-2 bg-white rounded">
                                                <p className="font-medium">{motion.title}</p>
                                                <p className="text-sm text-gray-600">Status: {motion.status}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600">No motions chaired yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Motions I Voted On */}
                            <div className="bg-superlight-green border-1 border-darker-green p-4 rounded-lg">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Recent Votes</h4>
                                <div className="space-y-2">
                                    {user.votedMotions?.length > 0 ? (
                                        user.votedMotions.map(motion => (
                                            <div key={motion.id} className="p-2 bg-white rounded">
                                                <p className="font-medium">{motion.title}</p>
                                                <p className="text-sm text-gray-600">Voted: {motion.voteType}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600">No votes cast yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile
