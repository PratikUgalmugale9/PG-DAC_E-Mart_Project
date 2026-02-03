import { useState, useRef, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; // 🔥 IMPORTANT
import "../styles/Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Login() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [containerHeight, setContainerHeight] = useState(600);
  const navigate = useNavigate();
  const { refreshCart } = useCart();

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

  // redirection logic if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/home");
    }
  }, [navigate]);

  // Update height when flip state changes
  useEffect(() => {
    const updateHeight = () => {
      const currentRef = isFlipped ? backRef : frontRef;
      if (currentRef.current) {
        setContainerHeight(currentRef.current.offsetHeight);
      }
    };

    const timer = setTimeout(updateHeight, 50);
    window.addEventListener("resize", updateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateHeight);
    };
  }, [isFlipped]);

  // ---------------- VALIDATION ----------------
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

  // ---------------- NORMAL LOGIN ----------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email: email,
        password: password,
      });

      const user = response.data;

      console.log("✅ Login Success:", user);

      alert("🎉 Login Successful!");

      // 🔥 SAVE USER + TOKEN
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", user.token);

      // 🔄 REFRESH CART
      await refreshCart();

      navigate("/home");

    } catch (error) {
      console.error("❌ Error:", error);

      if (error.response) {
        const backendMessage =
          error.response.data?.message || error.response.data || "Login failed";

        alert("❌ " + backendMessage);
      } else {
        alert("❌ Server error. Please try again later.");
      }
    }
  };

  // ---------------- REGISTER ----------------
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // 🔥 VERY IMPORTANT — passwordHash NOT password
    const userData = {
      fullName: regName,
      email: regEmail,
      mobile: regMobile,
      address: regAddress,
      passwordHash: regPassword
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/register",
        userData
      );

      console.log("✅ Registered User:", response.data);
      alert("🎉 Registration successful!");

      // flip back to login
      setIsFlipped(false);

      // clear form
      setRegName("");
      setRegEmail("");
      setRegMobile("");
      setRegAddress("");
      setRegPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("❌ Error:", error);

      if (error.response) {
        const backendMessage =
          error.response.data?.message || error.response.data || "Registration failed";

        alert("❌ " + backendMessage);
      } else {
        alert("❌ Server error. Please try again later.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className={`flip-container ${isFlipped ? "flipped" : ""}`}>
        <div className="flipper" style={{ height: `${containerHeight}px` }}>

          {/* 🔹 FRONT - LOGIN */}
          <div className="front" ref={frontRef}>
            <div className="login-card">
              <div className="login-header">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to E-Mart to continue</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="login-form">
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <input
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

                <div className="divider">
                  <span>OR</span>
                </div>

                {/* 🔥 GOOGLE LOGIN FULLY CONNECTED */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        const decoded = jwtDecode(credentialResponse.credential);

                        console.log("✅ Google User:", decoded);

                        const googleUser = {
                          email: decoded.email,
                          fullName: decoded.name,
                        };

                        const response = await axios.post(
                          "http://localhost:8080/auth/google",
                          googleUser
                        );

                        console.log("✅ Backend Google Login Success:", response.data);

                        alert("🎉 Google Login Successful!");

                        // 🔥 SAVE USER + TOKEN
                        localStorage.setItem("user", JSON.stringify(response.data));
                        localStorage.setItem("token", response.data.token);

                        // 🔄 REFRESH CART
                        await refreshCart();

                        navigate("/home");

                      } catch (error) {
                        console.error("❌ Google Login Error:", error);

                        if (error.response) {
                          const backendMessage =
                            error.response.data?.message || error.response.data || "Google login failed";

                          alert("❌ " + backendMessage);
                        } else {
                          alert("❌ Google login failed. Try again.");
                        }
                      }
                    }}
                    onError={() => {
                      console.log("❌ Google Login Failed");
                      alert("Google login failed");
                    }}
                  />
                </div>
              </form>

              <div className="login-footer">
                <p className="register-text">
                  New to E-Mart?{" "}
                  <span onClick={() => setIsFlipped(true)}>Create an account</span>
                </p>
              </div>
            </div>
          </div>

          {/* 🔹 BACK - REGISTER */}
          <div className="back" ref={backRef}>
            <div className="login-card">
              <div className="login-header">
                <h2 className="login-title">Create Account</h2>
                <p className="login-subtitle">Join E-Mart today</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="login-form">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="input-group">
                  <label>Mobile</label>
                  <input
                    type="tel"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                  />
                  {errors.mobile && <span className="error-message">{errors.mobile}</span>}
                </div>

                <div className="input-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="input-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>

                <button type="submit" className="login-btn">
                  Sign Up
                </button>
              </form>

              <div className="login-footer">
                <p className="register-text">
                  Already have an account?{" "}
                  <span onClick={() => setIsFlipped(false)}>Login</span>
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
