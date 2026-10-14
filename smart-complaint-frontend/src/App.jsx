import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import AllComplaints from "./pages/AllComplaints";
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import Reports from "./pages/Reports";

import "./App.css";


// USER LAYOUT
function UserLayout({ children }) {
  return (
    <>
      <Navbar />

      <div className="app-layout">
        <Sidebar role="user" />

        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}


// ADMIN LAYOUT
function AdminLayout({ children }) {
  return (
    <>
      <Navbar />

      <div className="app-layout">
        <Sidebar role="admin" />

        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}


// MAIN APP
function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />


        {/* USER ROUTES */}

        <Route
          path="/dashboard"
          element={
            <UserLayout>
              <UserDashboard />
            </UserLayout>
          }
        />

        <Route
          path="/submit-complaint"
          element={
            <UserLayout>
              <SubmitComplaint />
            </UserLayout>
          }
        />

        <Route
          path="/my-complaints"
          element={
            <UserLayout>
              <MyComplaints />
            </UserLayout>
          }
        />

        <Route
          path="/complaint/:id"
          element={
            <UserLayout>
              <ComplaintDetails />
            </UserLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <UserLayout>
              <Profile />
            </UserLayout>
          }
        />


        {/* ADMIN ROUTES */}

        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/complaints"
          element={
            <AdminLayout>
              <AllComplaints />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/departments"
          element={
            <AdminLayout>
              <Departments />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <AdminLayout>
              <Reports />
            </AdminLayout>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;