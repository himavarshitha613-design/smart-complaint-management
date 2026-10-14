-- ============================================================
-- SMART COMPLAINT MANAGEMENT SYSTEM (AI-CMS)
-- MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_complaints_db;
USE smart_complaints_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  head_name VARCHAR(100),
  staff_count INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(20) PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(100),
  user_email VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
  department VARCHAR(100) NOT NULL,
  status ENUM('Pending', 'In Progress', 'Resolved', 'Rejected') DEFAULT 'Pending',
  image_url VARCHAR(255),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. COMPLAINT PROGRESS / AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS complaint_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED INITIAL DATA
-- ============================================================

-- Insert Default Departments
INSERT IGNORE INTO departments (id, name, description, head_name, staff_count) VALUES
(1, 'IT Department', 'Hardware, software, network and lab infrastructure issues', 'Dr. Ramesh Kumar', 8),
(2, 'Maintenance Department', 'Electricity, plumbing, fans, lights, hostel maintenance', 'Mr. Suresh Patil', 12),
(3, 'Transport Department', 'College bus scheduling, routes and vehicle maintenance', 'Mr. Anil Rao', 6),
(4, 'Library Department', 'Book issues, digital library access and quiet environment', 'Mrs. Sunita Sharma', 5),
(5, 'Academic Department', 'Classes, faculty queries, attendance, and exam notifications', 'Prof. K. Venkatesh', 7),
(6, 'Administration Department', 'Fees, ID cards, general administrative and campus queries', 'Mr. P. Narayana', 6);

-- Insert Default Users (Passwords are hashed with bcrypt: 'admin123' and 'user123')
INSERT IGNORE INTO users (id, name, email, phone, password, role) VALUES
(1, 'System Administrator', 'admin@smartcms.com', '9876543210', '$2a$10$wS6e44X/K0xNeqpXlC0hpeqWn4k9Z1Xz7nUfP23GkY0JgPqu7zH4m', 'admin'),
(2, 'Rahul Kumar', 'rahul@gmail.com', '9845123456', '$2a$10$wS6e44X/K0xNeqpXlC0hpeqWn4k9Z1Xz7nUfP23GkY0JgPqu7zH4m', 'user'),
(3, 'Anjali Sharma', 'anjali@gmail.com', '9845678901', '$2a$10$wS6e44X/K0xNeqpXlC0hpeqWn4k9Z1Xz7nUfP23GkY0JgPqu7zH4m', 'user'),
(4, 'Varun Reddy', 'varun@gmail.com', '9812345678', '$2a$10$wS6e44X/K0xNeqpXlC0hpeqWn4k9Z1Xz7nUfP23GkY0JgPqu7zH4m', 'user');

-- Insert Initial Sample Complaints
INSERT IGNORE INTO complaints (id, user_id, user_name, user_email, title, description, category, priority, department, status, image_url, resolution_notes) VALUES
('CMP001', 2, 'Rahul Kumar', 'rahul@gmail.com', 'Projector not working in Lab 302', 'The HDMI projector display flickers and turns black during class sessions.', 'IT / Technical', 'High', 'IT Department', 'Pending', '', ''),
('CMP002', 3, 'Anjali Sharma', 'anjali@gmail.com', 'Hostel water problem on 2nd floor', 'There is no proper water supply in the hostel washrooms for the last two days.', 'Maintenance', 'High', 'Maintenance Department', 'In Progress', '', 'Plumbing staff assigned to inspect water pump.'),
('CMP003', 4, 'Varun Reddy', 'varun@gmail.com', 'Library AC making loud vibrating noise', 'The air conditioner in the quiet reading hall is malfunctioning and disturbing students.', 'Maintenance', 'Medium', 'Maintenance Department', 'Resolved', '', 'Compressor fan replaced and serviced successfully.');

-- Insert Complaint Progress Logs
INSERT IGNORE INTO complaint_logs (complaint_id, status, title, message) VALUES
('CMP001', 'Pending', 'Complaint Submitted', 'Complaint raised and AI routed to IT Department.'),
('CMP002', 'Pending', 'Complaint Submitted', 'Complaint raised and verified.'),
('CMP002', 'In Progress', 'Assigned & In Progress', 'Assigned to Maintenance Department. Staff is actively fixing the main supply line.'),
('CMP003', 'Pending', 'Complaint Submitted', 'Complaint registered.'),
('CMP003', 'In Progress', 'Technician Dispatched', 'Technician inspected AC unit.'),
('CMP003', 'Resolved', 'Resolved', 'AC servicing complete. Normal operation restored.');
