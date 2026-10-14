import { NavLink } from "react-router-dom";

function Sidebar({ role }) {
  if (role === "admin") {
    return (
      <aside className="sidebar">
        <div className="sidebar-title">
          Admin Portal
        </div>

        <NavLink to="/admin" end className="sidebar-link">
          <span>📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/complaints" className="sidebar-link">
          <span>📋</span>
          <span>All Complaints</span>
        </NavLink>

        <NavLink to="/admin/users" className="sidebar-link">
          <span>👥</span>
          <span>Users & Students</span>
        </NavLink>

        <NavLink to="/admin/departments" className="sidebar-link">
          <span>🏢</span>
          <span>Departments</span>
        </NavLink>

        <NavLink to="/admin/reports" className="sidebar-link">
          <span>📈</span>
          <span>Analytics & Reports</span>
        </NavLink>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-ai">
            <span>⚡</span>
            <span>AI Automated Router</span>
          </div>
          <div className="sidebar-bottom-sub">
            NLP Engine v2.0 • MySQL Storage
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        Student Menu
      </div>

      <NavLink to="/dashboard" end className="sidebar-link">
        <span>📊</span>
        <span>My Dashboard</span>
      </NavLink>

      <NavLink to="/submit-complaint" className="sidebar-link">
        <span>➕</span>
        <span>Submit Complaint</span>
      </NavLink>

      <NavLink to="/my-complaints" className="sidebar-link">
        <span>📋</span>
        <span>My Complaints</span>
      </NavLink>

      <NavLink to="/profile" className="sidebar-link">
        <span>👤</span>
        <span>My Profile</span>
      </NavLink>

      <div className="sidebar-bottom">
        <div className="sidebar-bottom-ai">
          <span>🤖</span>
          <span>Smart AI Assistant</span>
        </div>
        <div className="sidebar-bottom-sub">
          Auto-categorizes your complaints
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;