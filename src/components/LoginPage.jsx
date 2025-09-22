import { useState } from 'react'
function LoginPage() {
  const [count, setCount] = useState(0)

  return (
    <>
        <div className="login-container">
            <div className="login-card">
                <h3 className="login-title">Join YOUR Community</h3>
            <div className="row1">
                <a className="title">Join</a><a className="title">Log In</a>
            </div>
            <div className="row1">
                <input type="email" placeholder='Email' />
            </div>
            <div className="row1">
                <input type="text" placeholder='First Name' /><input type="text" placeholder='Last Name' />
            </div>
            <div className="row1">
                <input type="text" placeholder='Community Code' />
            </div>
            <div className="row1">
                <button2>Sign Up</button2>
            </div>
                <a>By signing up, you agree to our Terms of Service and Privacy Policy</a>
            </div>
        </div>
    </>
  )
}
export default LoginPage
