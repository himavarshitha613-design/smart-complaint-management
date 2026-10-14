import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function AllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints", {
        params: {
          search: search || undefined,
          status: statusFilter !== "All Status" ? statusFilter : undefined
        }
      });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.warn("Backend error in AllComplaints, fallback:", err);
      const fallback = [
        { id: "CMP001", user_name: "Rahul Kumar", title: "Projector not working in Lab 302", department: "IT Department", priority: "High", status: "Pending", category: "IT / Technical" },
        { id: "CMP002", user_name: "Anjali Sharma", title: "Hostel water problem on 2nd floor", department: "Maintenance Department", priority: "High", status: "In Progress", category: "Maintenance" },
        { id: "CMP003", user_name: "Varun Reddy", title: "Library AC vibrating noise", department: "Maintenance Department", priority: "Medium", status: "Resolved", category: "Maintenance" }
      ];
      setComplaints(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [search, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/complaints/${id}/status`, { status: newStatus });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert("Failed to update status on server: " + (err.response?.data?.message || err.message));
    }
  };

  const statusOptions = ["All Status", "Pending", "In Progress", "Resolved", "Rejected"];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>All Registered Complaints</h1>
          <p>Monitor, search, filter, and dispatch complaints across all campus departments.</p>
        </div>
      </div>

      <div className="table-card">
        {/* FILTERS & SEARCH TOOLBAR */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px" }}>
            <input
              type="text"
              placeholder="🔍 Search by Ticket ID, Title, Student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 16px",
                borderRadius: "10px",
                border: "1.5px solid var(--border-color)",
                outline: "none"
              }}
            />
          </div>

          {/* STATUS PILL BUTTONS */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {statusOptions.map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: statusFilter === st ? "var(--primary)" : "#f1f5f9",
                  color: statusFilter === st ? "#ffffff" : "#475569",
                  border: "none",
                  boxShadow: statusFilter === st ? "0 2px 8px rgba(79, 70, 229, 0.3)" : "none"
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading records from MySQL database...
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#64748b" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
            <h3>No complaints found</h3>
            <p style={{ margin: "4px 0 0" }}>Try adjusting your search criteria or filter options.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Student</th>
                <th>Complaint Title</th>
                <th>Category</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/complaint/${item.id}`} style={{ color: "#4f46e5", fontWeight: "800", textDecoration: "none" }}>
                      {item.id}
                    </Link>
                  </td>

                  <td>
                    <strong>{item.user_name || item.user || "Student"}</strong>
                  </td>

                  <td style={{ maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </td>

                  <td>{item.category || "General"}</td>

                  <td>{item.department}</td>

                  <td>
                    <span className={`priority ${(item.priority || "medium").toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </td>

                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a"
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td>
                    <Link
                      to={`/complaint/${item.id}`}
                      className="view-btn"
                    >
                      Audit View →
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

export default AllComplaints;