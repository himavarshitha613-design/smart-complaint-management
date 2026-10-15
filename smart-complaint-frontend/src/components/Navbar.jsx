import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [dbStatus, setDbStatus] = useState("Connected");

  useEffect(() => {
    // Quick health probe to reflect real backend & MySQL status
    API.get("/health")
      .then((res) => {
        if (res.data?.database?.connected) {
          setDbStatus("Connected");
        } else {
          setDbStatus("DB_Offline");
        }
      })
      .catch((err) => {
        if (err.response?.data?.database?.connected === false) {
          setDbStatus("DB_Offline");
        } else {
          setDbStatus("Offline");
        }
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const homePath = user.role === "admin" ? "/admin" : "/dashboard";
  const userInitials = (user.name || user.email || "U").substring(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      <Link to={homePath} className="navbar-brand">
        <div className="brand-icon-badge">🤖</div>
        <div>Smart<span>Complaints</span></div>
      </Link>

      <div className="navbar-right">
        {/* Real-time Server / DB Status Indicator */}
        <div className="server-status-pill" style={{
          background: dbStatus === "Connected" ? "#f0fdf4" : dbStatus === "DB_Offline" ? "#fffbeb" : "#fef2f2",
          borderColor: dbStatus === "Connected" ? "#bbf7d0" : dbStatus === "DB_Offline" ? "#fde68a" : "#fecaca",
          color: dbStatus === "Connected" ? "#15803d" : dbStatus === "DB_Offline" ? "#b45309" : "#b91c1c"
        }}>
          <span className="server-status-dot" style={{
            background: dbStatus === "Connected" ? "#22c55e" : dbStatus === "DB_Offline" ? "#f59e0b" : "#ef4444",
            boxShadow: dbStatus === "Connected" ? "0 0 8px #22c55e" : dbStatus === "DB_Offline" ? "0 0 8px #f59e0b" : "0 0 8px #ef4444"
          }}></span>
          <span>{dbStatus === "Connected" ? "MySQL Online" : dbStatus === "DB_Offline" ? "DB Needs Config" : "Backend Offline"}</span>
        </div>

        {/* User Badge */}
        <div className="user-chip">
          <div className="user-avatar-mini">{userInitials}</div>
          <div>
            <span>{user.name || "Student User"}</span>
            <span style={{
              display: "block",
              fontSize: "10px",
              fontWeight: "700",
              color: user.role === "admin" ? "#d97706" : "#4f46e5",
              textTransform: "uppercase"
            }}>
              {user.role === "admin" ? "Admin" : "Student"}
            </span>
          </div>
        </div>

        <Link to="/profile" className="nav-profile">
          👤 Profile
        </Link>

        <button className="logout-btn" onClick={logout} title="Sign out of account">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;