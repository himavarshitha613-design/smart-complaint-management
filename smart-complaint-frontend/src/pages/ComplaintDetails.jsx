import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API, { getImageUrl } from "../services/api";

function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin controls state
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = currentUser.role === "admin";
  const [adminStatus, setAdminStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await API.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setTimeline(res.data.timeline || []);
        setAdminStatus(res.data.complaint.status);
        setAdminNotes(res.data.complaint.resolution_notes || "");
        return;
      }
    } catch (err) {
      console.warn("Backend error fetching complaint details, checking local fallback:", err);
      const saved = JSON.parse(localStorage.getItem("complaints")) || [];
      const found = saved.find(c => c.id === id);
      if (found) {
        setComplaint(found);
        setAdminStatus(found.status);
      } else {
        const dummy = {
          id,
          title: "Hostel water problem on 2nd floor",
          category: "Maintenance",
          priority: "High",
          department: "Maintenance Department",
          status: "In Progress",
          description: "There is no proper water supply in the hostel washrooms. The problem has been occurring for the last two days.",
          user_name: "Rahul Kumar",
          created_at: new Date().toISOString()
        };
        setComplaint(dummy);
        setAdminStatus(dummy.status);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await API.put(`/complaints/${id}/status`, {
        status: adminStatus,
        resolution_notes: adminNotes
      });

      if (res.data.success) {
        alert("Status and audit history updated in MySQL!");
        fetchDetails();
      }
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
        Loading complaint audit details from database...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <h2>Ticket Not Found</h2>
        <Link to="/my-complaints" className="primary-btn" style={{ marginTop: "16px", display: "inline-block" }}>
          Back to Complaints
        </Link>
      </div>
    );
  }

  const backUrl = isAdmin ? "/admin/complaints" : "/my-complaints";

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Link to={backUrl} style={{ color: "#4f46e5", fontSize: "13px", fontWeight: "600" }}>
              ← Return to Complaints List
            </Link>
          </div>
          <h1>Complaint Audit & Details</h1>
          <p>Real-time grievance timeline, assigned department, and resolution logs.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "28px" }}>
        {/* LEFT COLUMN: COMPLAINT DETAILS & TIMELINE */}
        <div>
          <div className="details-card">
            <div className="details-header">
              <div>
                <span className="small-label">Ticket Identifier</span>
                <h2>{complaint.id}</h2>
              </div>

              <span className={`status ${(complaint.status || "pending").toLowerCase().replace(" ", "-")}`}>
                {complaint.status}
              </span>
            </div>

            <div className="details-grid">
              <div>
                <span>Category</span>
                <strong>{complaint.category}</strong>
              </div>

              <div>
                <span>Priority</span>
                <strong className={`priority-${(complaint.priority || "medium").toLowerCase()}`}>
                  {complaint.priority}
                </strong>
              </div>

              <div>
                <span>Assigned Dept</span>
                <strong>{complaint.department}</strong>
              </div>

              <div>
                <span>Submitted Date</span>
                <strong>{complaint.date || new Date(complaint.created_at).toLocaleDateString("en-IN")}</strong>
              </div>
            </div>

            <div className="description-box">
              <span className="small-label" style={{ display: "block", marginBottom: "6px" }}>Title</span>
              <h3 style={{ margin: "0 0 12px 0", color: "#0f172a" }}>{complaint.title}</h3>

              <span className="small-label" style={{ display: "block", marginBottom: "6px" }}>Description</span>
              <p style={{ margin: 0 }}>{complaint.description}</p>

              {complaint.image_url && (
                <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                  <span className="small-label" style={{ display: "block", marginBottom: "8px" }}>Photo Evidence Attached</span>
                  <img
                    src={getImageUrl(complaint.image_url)}
                    alt="Complaint evidence"
                    style={{ maxWidth: "340px", maxHeight: "220px", borderRadius: "10px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                  />
                </div>
              )}

              {complaint.resolution_notes && (
                <div style={{
                  marginTop: "18px",
                  padding: "14px 18px",
                  background: "#f0fdf4",
                  borderLeft: "4px solid #22c55e",
                  borderRadius: "8px"
                }}>
                  <strong style={{ color: "#166534", fontSize: "14px" }}>Official Resolution Notes:</strong>
                  <p style={{ margin: "4px 0 0 0", color: "#15803d", fontSize: "13px" }}>{complaint.resolution_notes}</p>
                </div>
              )}
            </div>

            {/* TIMELINE */}
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginTop: "32px", marginBottom: "16px" }}>
              Progress Audit Trail
            </h3>

            <div className="timeline">
              {timeline.length > 0 ? (
                timeline.map((item, idx) => (
                  <div key={item.id || idx} className="timeline-item completed">
                    <div className="timeline-dot">✓</div>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                      <small style={{ color: "#94a3b8" }}>{new Date(item.created_at).toLocaleString("en-IN")}</small>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="timeline-item completed">
                    <div className="timeline-dot">✓</div>
                    <div>
                      <strong>Complaint Submitted</strong>
                      <p>Ticket successfully registered in the database.</p>
                    </div>
                  </div>

                  <div className={`timeline-item ${complaint.status !== "Pending" ? "completed" : "active"}`}>
                    <div className="timeline-dot">{complaint.status !== "Pending" ? "✓" : "●"}</div>
                    <div>
                      <strong>Routed to {complaint.department}</strong>
                      <p>Auto-assigned based on AI classification.</p>
                    </div>
                  </div>

                  <div className={`timeline-item ${complaint.status === "Resolved" ? "completed" : (complaint.status === "In Progress" ? "active" : "")}`}>
                    <div className="timeline-dot">{complaint.status === "Resolved" ? "✓" : (complaint.status === "In Progress" ? "●" : "3")}</div>
                    <div>
                      <strong>In Progress / Under Investigation</strong>
                      <p>{complaint.status === "In Progress" ? "Staff is actively working on resolution." : "Queued for maintenance staff."}</p>
                    </div>
                  </div>

                  <div className={`timeline-item ${complaint.status === "Resolved" ? "completed" : ""}`}>
                    <div className="timeline-dot">{complaint.status === "Resolved" ? "✓" : "4"}</div>
                    <div>
                      <strong>Resolved</strong>
                      <p>{complaint.status === "Resolved" ? "Issue resolved and confirmed." : "Waiting for completion."}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION PANEL & USER INFO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* USER INFO CARD */}
          <div className="dashboard-card">
            <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Student Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              <div>
                <span className="small-label">Raised By</span>
                <strong>{complaint.user_name || "Student User"}</strong>
              </div>
              <div>
                <span className="small-label">Email Address</span>
                <span style={{ color: "#334155" }}>{complaint.user_email || "student@example.com"}</span>
              </div>
            </div>
          </div>

          {/* ADMIN MANAGEMENT ACTION BOX */}
          {isAdmin && (
            <div className="dashboard-card" style={{ border: "2px solid #c7d2fe", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ fontSize: "20px" }}>⚙️</span>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#312e81" }}>Administrator Controls</h3>
              </div>

              <form onSubmit={handleAdminUpdate}>
                <div className="form-group">
                  <label>Update Status</label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Resolution Remarks / Feedback</label>
                  <textarea
                    rows="4"
                    placeholder="Provide notes on actions taken, staff assigned, or resolution details..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="primary-btn"
                  style={{ width: "100%" }}
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Save Status to Database"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetails;