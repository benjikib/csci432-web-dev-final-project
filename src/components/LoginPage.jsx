import { useState } from 'react'
import { useNavigate } from "react-router-dom"
function LoginPage() {
    const navigate = useNavigate()
    const [active, setActive] = useState("join");
    const handleLogin = async () => {
        try {
        const res = await fetch('/sample.json');
        const data = await res.json();

        navigate('/profile', { state: { user: data } });
        } catch (err) {
        console.error('Failed to fetch users:', err);
        } finally {
        }
    };
  return (
    <>
        { active === "join" ? 
        <div className="login-container">
            <div className="login-card">
                <h3 className="login-title">Join YOUR Community</h3>
            <div className="input-row">
                <div className={`login-option ${active === "join" ? "active" : ""}`}onClick={() => setActive("join")}>
                    Join
                </div>
                <div className={`login-option ${active === "login" ? "active" : ""}`}onClick={() => setActive("login")}>
                    Log In
                </div>
            </div>
            <div className="input-row">
                <input type="email" placeholder='Email' />
            </div>
            <div className="input-row">
                <input type="text" placeholder='First Name' /><input type="text" placeholder='Last Name' />
            </div>
            <div className="input-row">
                <input type="text" placeholder='Community Code' />
            </div>
            <div className="input-row">
                <button2 onClick={() => setActive("login")}>Sign Up</button2>
            </div>
                <a className="terms">By signing up, you agree to our Terms of Service and Privacy Policy</a>
            </div>
        </div> :
        <div className="login-container">
            <div className="login-card">
                <h3 className="login-title">Join YOUR Community</h3>
            <div className="input-row">
                <div className={`login-option ${active === "join" ? "active" : ""}`}onClick={() => setActive("join")}>
                    Join
                </div>
                <div className={`login-option ${active === "login" ? "active" : ""}`}onClick={() => setActive("login")}>
                    Log In
                </div>
            </div>
            <div className="input-row">
                <input type="email" placeholder='Email' />
            </div>
            <div className="input-row">
                <input type="password" placeholder='Password' />
            </div>
            <div className="input-row">
                <button2 onClick={handleLogin}>Login</button2>
            </div>
                <a className="terms">By signing up, you agree to our Terms of Service and Privacy Policy</a>
            </div>
        </div>
        }
    </>
  )
}

export default LoginPage
