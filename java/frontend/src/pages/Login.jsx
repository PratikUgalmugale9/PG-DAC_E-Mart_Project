import { useState, useRef, useEffect } from "react";
import "../styles/Login.css";

function Login() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [containerHeight, setContainerHeight] = useState(600); // Default start height

  const frontRef = useRef(null);
  const backRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  // Update height when flip state changes
  useEffect(() => {
    const updateHeight = () => {
      const currentRef = isFlipped ? backRef : frontRef;
      if (currentRef.current) {
        // Add some padding/buffer if needed, or just use offsetHeight
        setContainerHeight(currentRef.current.offsetHeight);
      }
    };

    // Small timeout to ensure DOM is ready/transitions start
    const timer = setTimeout(updateHeight, 50);

    // Also update on resize
    window.addEventListener('resize', updateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    }
  }, [isFlipped]);

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!regName.trim()) {
      newErrors.name = "Full Name is required";
      isValid = false;
    } else if (regName.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail || !emailRegex.test(regEmail)) {
      newErrors.email = "Valid Email is required";
      isValid = false;
    }

    const mobileRegex = /^\d{10,15}$/;
    if (!regMobile || !mobileRegex.test(regMobile)) {
      newErrors.mobile = "Mobile must be 10-15 digits";
      isValid = false;
    }

    if (!regAddress.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (regPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (regPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login Email:", email);
    console.log("Login Password:", password);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Register Name:", regName);
      console.log("Register Email:", regEmail);
      console.log("Register Mobile:", regMobile);
      console.log("Register Address:", regAddress);
      console.log("Register Password:", regPassword);
      // Proceed with API call
    }
  };

  return (
    <div className="login-container">
      <div className={`flip-container ${isFlipped ? "flipped" : ""}`}>
        <div
          className="flipper"
          style={{ height: `${containerHeight}px` }}
        >
          {/* Front Side - Login */}
          <div className="front" ref={frontRef}>
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
          <div className="back" ref={backRef}>
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
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="reg-mobile">Mobile Number</label>
                  <input
                    id="reg-mobile"
                    type="tel"
                    placeholder="1234567890"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                  />
                  {errors.mobile && <span className="error-message">{errors.mobile}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="reg-address">Address</label>
                  <input
                    id="reg-address"
                    type="text"
                    placeholder="123 Main St, City"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
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
