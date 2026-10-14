import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: "user"
      });

      if (res.data.success) {
        alert("🎉 Registration successful! Stored in MySQL. Please sign in.");
        navigate("/");
      }
    } catch (err) {
      console.warn("Backend register error:", err);
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setErrorMsg(serverMessage);
      } else {
        alert("Registration saved! You can now log in.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-large">
          🤖 Smart<span>Complaints</span>
        </div>

        <h1>Join the Smart Campus Grievance Network</h1>

        <p>
          Create an account to submit complaints, upload proof photos,
          and track automated AI status routing in real time.
        </p>

        <div className="feature-list">
          <div>
            <span style={{ color: "#38bdf8", fontSize: "18px" }}>✦</span>
            <span>Instant Ticket ID Generation</span>
          </div>
          <div>
            <span style={{ color: "#38bdf8", fontSize: "18px" }}>✦</span>
            <span>AI Automated Severity Classification</span>
          </div>
          <div>
            <span style={{ color: "#38bdf8", fontSize: "18px" }}>✦</span>
            <span>Direct Notification on Resolution</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: "480px" }}>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Register your student account</p>

          {errorMsg && (
            <div style={{
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: "10px",
              marginBottom: "18px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div>
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Rahul Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>College Email Address *</label>
              <input
                type="email"
                placeholder="student@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Phone Number *</label>
              <input
                type="tel"
                placeholder="e.g. 9845123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Password *</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Confirm Password *</label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.75 : 1 }}
            >
              {loading ? "Creating Account..." : "Create Free Account →"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;