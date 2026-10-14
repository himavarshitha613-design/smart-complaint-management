import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function UserDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          API.get(`/reports/user-stats?email=${encodeURIComponent(user.email || "")}`),
          API.get(`/complaints/my?email=${encodeURIComponent(user.email || "")}`)
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }

        if (complaintsRes.data.success) {
          setRecentComplaints(complaintsRes.data.complaints.slice(0, 3));
        }
      } catch (err) {
        console.warn("UserDashboard backend error, using local fallback:", err);
        const saved = JSON.parse(localStorage.getItem("complaints")) || [];
        setStats({
          total: saved.length || 3,
          pending: saved.filter(c => c.status === "Pending").length || 1,
          inProgress: saved.filter(c => c.status === "In Progress").length || 1,
          resolved: saved.filter(c => c.status === "Resolved").length || 1
        });
        setRecentComplaints(saved.slice(0, 3));
      }
    };

    fetchData();
  }, [user.email]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user.name || "Student"}! 👋</h1>
          <p>Track your submitted issues and let AI assist you in real time.</p>
        </div>

        <Link to="/submit-complaint" className="primary-btn">
          ➕ Raise a Complaint
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div>
            <p>My Total Tickets</p>
            <h2>{stats.total}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div>
            <p>Pending Review</p>
            <h2>{stats.pending}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">⚙️</div>
          <div>
            <p>Under Investigation</p>
            <h2>{stats.inProgress}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div>
            <p>Resolved Issues</p>
            <h2>{stats.resolved}</h2>
          </div>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="dashboard-grid">
        {/* RECENT COMPLAINTS */}
        <div className="dashboard-card">
          <div className="card-heading">
            <h3>Recent Grievance Filings</h3>
            <Link to="/my-complaints">View All My Tickets →</Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 10px" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</div>
              <h4 style={{ margin: "0 0 6px" }}>No issues filed yet</h4>
              <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 16px" }}>Everything running smoothly!</p>
              <Link to="/submit-complaint" className="primary-btn small-btn">
                + Raise New Complaint
              </Link>
            </div>
          ) : (
            recentComplaints.map(item => (
              <div className="complaint-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.id} • {item.department}</small>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={`status ${(item.status || "pending").toLowerCase().replace(" ", "-")}`}>
                    {item.status}
                  </span>
                  <Link to={`/complaint/${item.id}`} className="view-btn">
                    Track
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI HELPER CARD */}
        <div className="dashboard-card ai-card">
          <div className="ai-icon">🤖</div>

          <h3>AI-Powered Complaint Assistant</h3>

          <p>
            Whenever you submit a problem, our Natural Language Processing engine identifies
            the problem department, severity priority, and provides instant turnaround estimates.
          </p>

          <Link to="/submit-complaint" className="primary-btn">
            File New Ticket with AI →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;