import { useState } from "react";
import "../styles/Login.css";

function Login() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login Email:", email);
    console.log("Login Password:", password);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Register Name:", regName);
    console.log("Register Email:", regEmail);
    console.log("Register Password:", regPassword);
  };

  return (
    <div className="login-container">
      <div className={`flip-container ${isFlipped ? "flipped" : ""}`}>
        <div className="flipper">
          {/* Front Side - Login */}
          <div className="front">
            <div className="login-card">
              <div className="login-header">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to E-Mart to continue</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="login-form">
                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="login-btn">
                  Sign In
                </button>
              </form>

              <div className="login-footer">
                <p className="register-text">
                  New to E-Mart? <span onClick={() => setIsFlipped(true)}>Create an account</span>
                </p>
              </div>
            </div>
          </div>

          {/* Back Side - Registration */}
          <div className="back">
            <div className="login-card">
              <div className="login-header">
                <h2 className="login-title">Create Account</h2>
                <p className="login-subtitle">Join E-Mart today</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="login-form">
                <div className="input-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="login-btn">
                  Sign Up
                </button>
              </form>

              <div className="login-footer">
                <p className="register-text">
                  Already have an account? <span onClick={() => setIsFlipped(false)}>Login</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
