import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react";

export default function MainPage() {
    const navigate = useNavigate()
    const [active, setActive] = useState("join");
    
    useEffect(() => {
        document.body.classList.add('no-scroll')
        return () => {
            document.body.classList.remove('no-scroll')
        }
    }, [])

    const { loginWithRedirect } = useAuth0();
    const { logout } = useAuth0();
    const { user, isAuthenticated, isLoading } = useAuth0();

    
    const handleLogin = async () => {
        try {
            const res = await fetch('/sample.json');
            const data = await res.json();
            navigate('/profile', { state: { user: data } });
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    return (
        <div className="integrated-landing-page">
            {/* Left Section - Branding */}
            <div className="branding-section">
                <div className="branding-content">
                    <span className="main-logo-font site-name">Commie</span>
                    <img src="/logo.png" alt="Logo" className="main-logo"></img>
                    <p className="tagline">Collaborate and make decisions with ease on a single, simple platform.</p>
                    <p className="attribution">Based on Robert's Rules of Order (RONR)</p>
                    {/* <button onClick={() => loginWithRedirect()}>Log In</button>;
                    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Log Out</button>
                    <button onClick={() => {console.log(isAuthenticated)}}>check</button>
                    {isLoading ? (
                    <div className="text-gray-500">Checking login status...</div>
                    ) : isAuthenticated ? (
                    <div className="w-80 h-5 border-2 border-amber-500 text-black">
                        Logged in user: {user.email}
                    </div>
                    ) : (
                    <div className="text-red-500">Not logged in</div>
                    )} */}
                </div>
            </div>

            {/* Right Section - Login/Signup */}
            <div className="auth-section">
                { active === "join" ? 
                <div className="login-container">
                    <div className="login-card">
                        <h3 className="login-title">Join YOUR Community</h3>
                        <div className="input-row">
                            <div className={`login-option ${active === "join" ? "active" : ""}`} onClick={() => setActive("join")}>
                                Join
                            </div>
                            <div className={`login-option ${active === "login" ? "active" : ""}`} onClick={() => setActive("login")}>
                                Log In
                            </div>
                        </div>
                        <div className="input-row">
                            <input className="login-input" type="email" placeholder='Email' />
                        </div>
                        <div className="input-row">
                            <input className="login-input" type="text" placeholder='First Name' /><input className="login-input" type="text" placeholder='Last Name' />
                        </div>
                        <div className="input-row">
                            <input className="login-input" type="text" placeholder='Community Code' />
                        </div>
                        <div className="input-row">
                            <div className="
                            rounded-lg border-[1px] border-transparent
                            px-[1.2em] py-[0.6em]
                            text-white bg-[#54966D] hover:bg-[#5ca377]
                            font-medium font-inherit
                            cursor-pointer
                            w-50 mx-auto" onClick={() => setActive("login")}>Sign Up</div>
                        </div>
                        <a className="terms">By signing up, you agree to our Terms of Service and Privacy Policy</a>
                    </div>
                </div> :
                <div className="login-container">
                    <div className="login-card">
                        <h3 className="login-title">Join YOUR Community</h3>
                        <div className="input-row">
                            <div className={`login-option ${active === "join" ? "active" : ""}`} onClick={() => setActive("join")}>
                                Join
                            </div>
                            <div className={`login-option ${active === "login" ? "active" : ""}`} onClick={() => setActive("login")}>
                                Log In
                            </div>
                        </div>
                        <div className="input-row">
                            <input className="login-input" type="email" placeholder='Email' />
                        </div>
                        <div className="input-row">
                            <input className="login-input" type="password" placeholder='Password' />
                        </div>
                        <div className="input-row">
                            <div className="
                            rounded-lg border-[1px] border-transparent
                            px-[1.2em] py-[0.6em]
                            text-white bg-[#54966D] hover:bg-[#5ca377]
                            font-medium font-inherit
                            cursor-pointer
                            w-50 mx-auto" onClick={() => navigate("/committees")}>Login</div>
                        </div>
                        <a className="terms">By signing up, you agree to our Terms of Service and Privacy Policy</a>
                    </div>
                </div>
                }
            </div>
        </div>
    )
}


