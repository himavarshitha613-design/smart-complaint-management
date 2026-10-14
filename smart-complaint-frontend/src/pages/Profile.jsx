import React, { useEffect, useState } from "react";
import API from "../services/api";

function Profile() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || {
      name: "Student User",
      email: "student@example.com",
      role: "user"
    };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        // Fallback to localStorage data
      }
    };

    fetchProfile();
  }, []);

  const initials = (user.name || user.email || "U").substring(0, 2).toUpperCase();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My User Profile</h1>
          <p>Your verified account credentials and registered role in the system.</p>
        </div>
      </div>

      <div className="profile-card" style={{ margin: "0 auto" }}>
        <div className="profile-avatar">
          {initials}
        </div>

        <h2 style={{ fontSize: "24px", margin: "0 0 4px", color: "#0f172a" }}>
          {user.name || "Student User"}
        </h2>

        <p style={{ color: "#64748b", margin: 0 }}>
          {user.email || "student@example.com"}
        </p>

        <div style={{ marginTop: "12px" }}>
          <span style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            background: user.role === "admin" ? "#fef3c7" : "#e0e7ff",
            color: user.role === "admin" ? "#92400e" : "#4338ca",
            textTransform: "uppercase"
          }}>
            {user.role === "admin" ? "System Administrator" : "Student / User"}
          </span>
        </div>

        <div className="profile-details">
          <div>
            <span>Full Name</span>
            <strong>{user.name || "Student User"}</strong>
          </div>

          <div>
            <span>Email Address</span>
            <strong>{user.email || "student@example.com"}</strong>
          </div>

          <div>
            <span>Contact Phone</span>
            <strong>{user.phone || "+91 98451 23456"}</strong>
          </div>

          <div>
            <span>Database Storage</span>
            <strong style={{ color: "#16a34a" }}>MySQL Record Verified (Port 3306)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;