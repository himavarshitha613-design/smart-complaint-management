import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
        role
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.warn("Backend login error, checking fallback:", err);
      const serverMessage = err.response?.data?.message;

      if (serverMessage) {
        setErrorMsg(serverMessage);
      } else {
        // Fallback for offline demo mode
        localStorage.setItem("user", JSON.stringify({
          email,
          role,
          name: email.split("@")[0].toUpperCase()
        }));
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-fill Handlers
  const fillAdmin = () => {
    setEmail("admin@smartcms.com");
    setPassword("admin123");
    setRole("admin");
    setErrorMsg("");
  };

  const fillStudent = () => {
    setEmail("rahul@gmail.com");
    setPassword("user123");
    setRole("user");
    setErrorMsg("");
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-large">
          🤖 Smart<span>Complaints</span>
        </div>

        <h1>AI-Driven Complaint Resolution System</h1>

        <p>
          Next-generation portal leveraging Natural Language Processing to
          automatically categorize, prioritize, and route student grievances in real time.
        </p>

        <div className="feature-list">
          <div>
            <span style={{ color: "#38bdf8", fontSize: "18px" }}>✦</span>
            <span>Intelligent NLP Complaint Classification</span>
          </div>
          <div>
            <span style={{ color: "#38bdf8", fontSize: "18px" }}>✦</span>
            <span>Dynamic Urgency & Priority Detection</span>
          </div>
          <div>
            <span style={{ color: "#38bdf8", fontSize: "18px" }}>✦</span>
            <span>Smart Department Routing & Turnaround Estimation</span>
          </div>
          <div>
            <span style={{ color: "#38bdf8", fontSize: "18px" }}>✦</span>
            <span>Reliable MySQL Relational Database Persistence</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back 👋</h2>
          <p className="auth-subtitle">Sign in to manage and track tickets</p>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginBottom: "20px" }}>
            <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
              ⚡ 1-Click Demo Fill:
            </span>
            <div className="quick-fill-box">
              <button type="button" className="quick-fill-btn" onClick={fillAdmin}>
                🔑 Admin Demo
              </button>
              <button type="button" className="quick-fill-btn" onClick={fillStudent}>
                🎓 Student Demo
              </button>
            </div>
          </div>

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

          <form onSubmit={handleLogin}>
            <div>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ fontSize: "12px", color: "#6366f1", fontWeight: "600", padding: "0" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">Student / User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.75 : 1 }}
            >
              {loading ? "Authenticating..." : "Sign In to Account →"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account yet?{" "}
            <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;