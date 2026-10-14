import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      try {
        const res = await API.get(`/complaints/my?email=${encodeURIComponent(user.email || "")}`);
        if (res.data.success && res.data.complaints) {
          setComplaints(res.data.complaints);
          return;
        }
      } catch (err) {
        console.warn("Backend error fetching complaints, using local backup:", err);
        const savedComplaints = JSON.parse(localStorage.getItem("complaints")) || [];
        setComplaints(savedComplaints);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Filed Complaints</h1>
          <p>Track the progress and updates for your submitted grievances.</p>
        </div>

        <Link to="/submit-complaint" className="primary-btn">
          + Raise New Complaint
        </Link>
      </div>

      <div className="table-card">
        {/* TOOLBAR */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="🔍 Search my complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              maxWidth: "350px",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1.5px solid var(--border-color)",
              outline: "none"
            }}
          />

          <div style={{ display: "flex", gap: "8px" }}>
            {["All", "Pending", "In Progress", "Resolved"].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  background: filter === tab ? "var(--primary)" : "#f1f5f9",
                  color: filter === tab ? "#ffffff" : "#475569",
                  border: "none",
                  boxShadow: filter === tab ? "0 2px 8px rgba(79, 70, 229, 0.3)" : "none"
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading your complaints from MySQL...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-complaints">
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <h2>No Complaints Found</h2>
            <p>You have not submitted any complaints matching this filter.</p>
            <Link to="/submit-complaint" className="primary-btn">
              Submit a Complaint Now
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((complaint) => (
                <tr key={complaint.id}>
                  <td>
                    <Link to={`/complaint/${complaint.id}`} style={{ color: "#4f46e5", fontWeight: "800" }}>
                      {complaint.id}
                    </Link>
                  </td>
                  <td style={{ fontWeight: "600" }}>{complaint.title}</td>
                  <td>{complaint.category}</td>
                  <td>{complaint.department}</td>
                  <td>
                    <span className={`priority ${(complaint.priority || "medium").toLowerCase()}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${(complaint.status || "pending").toLowerCase().replace(" ", "-")}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{complaint.date || new Date(complaint.created_at).toLocaleDateString("en-IN")}</td>
                  <td>
                    <Link to={`/complaint/${complaint.id}`} className="view-btn">
                      Track Progress →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyComplaints;