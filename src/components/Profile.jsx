import { useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom"


function Profile() {
    const [count, setCount] = useState(0)
    const location = useLocation();
    const { user } = location.state || {};

  return (
    <>
        <div className="user-profile-container">
            <h2>My Profile</h2>

            <div className="user-profile-header">
                <div className="user-avatar">{user.first_name[0]+user.last_name[0]}</div>
                <div className="user-header-info">
                <h3>{user.username}</h3>
                <p>{user.privilege}</p>
                </div>
            </div>

            <div className="user-profile-details">
                <div className="user-detail">
                <span className="label">First Name:</span>
                <span className="value">{user.first_name}</span>
                </div>
                <div className="user-detail">
                <span className="label">Last Name:</span>
                <span className="value">{user.last_name}</span>
                </div>
                <div className="user-detail">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
                </div>
                <div className="user-detail">
                <span className="label">Phone:</span>
                <span className="value">{user.pn}</span>
                </div>
                <div className="user-detail">
                <span className="label">COM ID:</span>
                <span className="value">{user.comid}</span>
                </div>
            </div>
        </div>
    </>
    );

}
export default Profile
