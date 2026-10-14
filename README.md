# 🤖 AI-Based Smart Complaint Management System (AI-CMS)

A full-stack, enterprise-grade Complaint Management System powered by **React**, **Node.js / Express**, **MySQL**, and an **Intelligent NLP AI Classification Engine**.

---

## 📁 Project Architecture

```
AI-CMS/
├── smart-complaint-frontend/     # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── pages/                # Login, Register, Dashboards, Complaints, Departments, Reports
│   │   ├── components/           # Navbar, Sidebar
│   │   └── services/api.js       # Axios client configured with JWT interceptor to port 8080
│   └── package.json
│
├── smart-complaint-backend/      # Node.js + Express + MySQL Backend Server
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js             # MySQL connection pool & automatic table schema initialization
│   │   │   ├── schema.sql        # Full MySQL database DDL + seed dataset
│   │   │   └── initDb.js         # One-shot database initialisation script
│   │   ├── services/
│   │   │   └── aiService.js      # NLP AI Classifier (category, priority, department, turnaround)
│   │   ├── controllers/          # Auth, Complaints, Departments, Reports & Analytics
│   │   ├── middleware/           # JWT auth and Multer image file upload handlers
│   │   ├── routes/               # Express REST routes
│   │   └── server.js             # Express API entry point (Port 8080)
│   ├── .env                      # Database credentials and configuration
│   └── package.json
│
└── package.json                  # Root runner scripts
```

---

## ⚡ Quick Start Guide

### 1. Configure MySQL Database Password

Open [`smart-complaint-backend/.env`](file:///c:/Users/Hima%20varshitha/OneDrive/Desktop/AI-CMS/smart-complaint-backend/.env) and enter your local MySQL root password:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=smart_complaints_db
```

> **Note:** If your MySQL server has no password, you can leave `DB_PASSWORD=` blank.

### 2. Initialize the Database (One-time setup)

In your terminal, run:

```bash
cd "c:\Users\Hima varshitha\OneDrive\Desktop\AI-CMS\smart-complaint-backend"
npm run init-db
```

This will automatically:
- Create the database `smart_complaints_db` if not exists.
- Create tables: `users`, `departments`, `complaints`, and `complaint_logs`.
- Seed initial departments, test users, and sample complaints.

### 3. Start Backend Server (Port 8080)

```bash
cd "c:\Users\Hima varshitha\OneDrive\Desktop\AI-CMS\smart-complaint-backend"
npm start
```

*Server URL:* `http://localhost:8080`  
*Health Check:* `http://localhost:8080/api/health`

### 4. Start Frontend Application (Port 5173)

In a separate terminal window:

```bash
cd "c:\Users\Hima varshitha\OneDrive\Desktop\AI-CMS\smart-complaint-frontend"
npm run dev
```

*Application URL:* `http://localhost:5173`

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@smartcms.com` | `admin123` |
| **Student / User** | `rahul@gmail.com` | `user123` |
| **Student / User** | `anjali@gmail.com` | `user123` |

---

## 🚀 Key Features Implemented

1. **Intelligent AI Categorization**:
   - Analyzes title and description to predict the category (**IT**, **Maintenance**, **Transport**, **Library**, **Academic**, **General**).
   - Detects priority level (**Urgent**, **High**, **Medium**, **Low**) based on hazard, urgency, and keywords.
   - Computes expected turnaround resolution times and confidence metrics.

2. **Persistent MySQL Storage**:
   - Stores users with bcrypt password hashing and JWT authentication.
   - Tracks complaint statuses: `Pending` ➔ `In Progress` ➔ `Resolved` ➔ `Rejected`.
   - Audit trail logs in `complaint_logs` for every progress update.

3. **Image Attachment Support**:
   - Upload complaint proof/photos via Multer, stored in `/uploads` and previewable on details page.

4. **Live Reports & Analytics**:
   - Resolution rate calculations, department distribution breakdown, average resolution time.
