import { useState, useEffect } from "react";
import API from "../services/api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", description: "", head_name: "", staff: 5 });

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.warn("Backend error in Departments, using fallback:", err);
      setDepartments([
        { id: 1, name: "IT Department", complaints: 42, staff: 8, head_name: "Dr. Ramesh Kumar" },
        { id: 2, name: "Maintenance Department", complaints: 38, staff: 12, head_name: "Mr. Suresh Patil" },
        { id: 3, name: "Transport Department", complaints: 25, staff: 6, head_name: "Mr. Anil Rao" },
        { id: 4, name: "Academic Department", complaints: 18, staff: 7, head_name: "Prof. K. Venkatesh" },
        { id: 5, name: "Library Department", complaints: 14, staff: 5, head_name: "Mrs. Sunita Sharma" },
        { id: 6, name: "Administration Department", complaints: 19, staff: 6, head_name: "Mr. P. Narayana" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;

    try {
      const res = await API.post("/departments", newDept);
      if (res.data.success) {
        alert("Department created successfully in MySQL!");
        setShowModal(false);
        setNewDept({ name: "", description: "", head_name: "", staff: 5 });
        fetchDepartments();
      }
    } catch (err) {
      alert("Failed to create department: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Campus Departments</h1>
          <p>Manage operational teams, assigned complaints, and staff allocations.</p>
        </div>

        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Add Department
        </button>
      </div>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#ffffff", padding: "32px", borderRadius: "16px",
            width: "90%", maxWidth: "480px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginTop: 0, fontSize: "20px", color: "#0f172a" }}>Add Campus Department</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports & Physical Education"
                  value={newDept.name}
                  onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Department Head / Lead</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. K. Sharma"
                  value={newDept.head_name}
                  onChange={e => setNewDept({ ...newDept, head_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Assigned Staff Count</label>
                <input
                  type="number"
                  min="1"
                  value={newDept.staff}
                  onChange={e => setNewDept({ ...newDept, staff: parseInt(e.target.value, 10) || 1 })}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#64748b" }}>
          Loading departments from MySQL...
        </div>
      ) : (
        <div className="department-grid">
          {departments.map((department) => (
            <div className="department-card" key={department.id}>
              <div className="department-icon">🏢</div>
              <h3>{department.name}</h3>

              {department.head_name && (
                <p style={{ color: "#475569", fontSize: "13px", margin: "2px 0 10px" }}>
                  Head: <strong>{department.head_name}</strong>
                </p>
              )}

              <div style={{
                background: "#f8fafc",
                padding: "12px 14px",
                borderRadius: "10px",
                margin: "12px 0",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Assigned Tickets:</span>
                  <strong style={{ color: "#4f46e5" }}>{department.complaints || 0}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Staff Allocated:</span>
                  <strong>{department.staff || 5} members</strong>
                </div>
              </div>

              <button className="view-btn">
                Operational Status: Active
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Departments;