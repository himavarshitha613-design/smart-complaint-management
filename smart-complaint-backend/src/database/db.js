import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Helper to parse database configuration from environment variables
export const getDatabaseConfig = () => {
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

  if (connectionUrl) {
    try {
      const parsed = new URL(connectionUrl);
      const isRemote = parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1";
      const useSsl = process.env.DB_SSL === "true" || process.env.DB_SSL === "REQUIRED" || (process.env.DB_SSL !== "false" && isRemote);
      const dbFromPath = parsed.pathname ? parsed.pathname.replace(/^\//, "").split("?")[0] : "";

      return {
        host: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : 3306,
        user: decodeURIComponent(parsed.username || "root"),
        password: decodeURIComponent(parsed.password || ""),
        database: dbFromPath || process.env.DB_NAME || "smart_complaints_db",
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      };
    } catch (e) {
      console.warn("⚠️  Could not parse DATABASE_URL via standard URL parser, attempting pattern fallback:", e.message);
      const match = connectionUrl.match(/^mysql(?:2)?:\/\/(?:([^:]+)(?::([^@]*))?@)?([^:\/?#]+)(?::(\d+))?(?:\/([^?#]*))?/);
      if (match) {
        const host = match[3];
        const isRemote = host !== "localhost" && host !== "127.0.0.1";
        const useSsl = process.env.DB_SSL === "true" || process.env.DB_SSL === "REQUIRED" || (process.env.DB_SSL !== "false" && isRemote);
        return {
          host,
          port: match[4] ? Number(match[4]) : 3306,
          user: decodeURIComponent(match[1] || "root"),
          password: decodeURIComponent(match[2] || ""),
          database: match[5] || process.env.DB_NAME || "smart_complaints_db",
          ssl: useSsl ? { rejectUnauthorized: false } : undefined,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 20000,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000
        };
      }
    }
  }

  const host = process.env.DB_HOST || "localhost";
  const isRemote = host !== "localhost" && host !== "127.0.0.1";
  const useSsl = process.env.DB_SSL === "true" || process.env.DB_SSL === "REQUIRED" || (process.env.DB_SSL !== "false" && isRemote);

  return {
    host,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
    database: process.env.DB_NAME || "smart_complaints_db",
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  };
};

// Connection Pool Singleton
let pool = null;
let isInitialized = false;

export const isDatabaseInitialized = () => isInitialized;

export const getPool = () => {
  if (!pool) {
    const config = getDatabaseConfig();
    pool = mysql.createPool(config);
  }
  return pool;
};

// Check live database connectivity
export const checkDatabaseHealth = async () => {
  const config = getDatabaseConfig();
  try {
    const db = getPool();
    await db.query("SELECT 1;");
    return {
      connected: true,
      message: "MySQL connection healthy",
      host: config.host,
      database: config.database
    };
  } catch (err) {
    const errorDetails = err.message || err.code || err.sqlMessage || "Unable to connect to MySQL database";
    return {
      connected: false,
      message: errorDetails,
      code: err.code || "ERR_DB_DISCONNECTED",
      host: config.host,
      database: config.database
    };
  }
};

// Database Initialization & Table Schemas
export const initializeDatabase = async () => {
  const config = getDatabaseConfig();
  const maskedPassword = config.password ? "********" : "(empty)";
  console.log(`🔌 Attempting MySQL connection to [${config.user}@${config.host}:${config.port}/${config.database}] (SSL: ${config.ssl ? "Enabled" : "Disabled"})...`);

  try {
    // 1. Try connecting directly to the specified database first
    let db;
    try {
      db = getPool();
      await db.query("SELECT 1;");
      console.log(`✅ Connected directly to database '${config.database}'.`);
    } catch (connErr) {
      // If error is code 1049 (Unknown database) and we are on localhost, try creating it
      if (connErr.code === "ER_BAD_DB_ERROR" && (config.host === "localhost" || config.host === "127.0.0.1")) {
        console.log(`ℹ️ Database '${config.database}' does not exist on localhost. Creating it...`);
        const rootConnection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password
        });
        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
        await rootConnection.end();
        console.log(`✅ Database '${config.database}' created.`);
        // Reset pool
        pool = null;
        db = getPool();
      } else {
        throw connErr;
      }
    }

    // 2. Create tables if they do not exist
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Departments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        head_name VARCHAR(100),
        staff_count INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Complaints table
    await db.query(`
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
    `);

    // Complaint progress / audit logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS complaint_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL,
        title VARCHAR(150) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
      );
    `);

    // Seed default departments if table is empty
    const [deptRows] = await db.query("SELECT COUNT(*) AS count FROM departments;");
    if (deptRows[0].count === 0) {
      await db.query(`
        INSERT INTO departments (id, name, description, head_name, staff_count) VALUES
        (1, 'IT Department', 'Hardware, software, network and lab infrastructure issues', 'Dr. Ramesh Kumar', 8),
        (2, 'Maintenance Department', 'Electricity, plumbing, fans, lights, hostel maintenance', 'Mr. Suresh Patil', 12),
        (3, 'Transport Department', 'College bus scheduling, routes and vehicle maintenance', 'Mr. Anil Rao', 6),
        (4, 'Library Department', 'Book issues, digital library access and quiet environment', 'Mrs. Sunita Sharma', 5),
        (5, 'Academic Department', 'Classes, faculty queries, attendance, and exam notifications', 'Prof. K. Venkatesh', 7),
        (6, 'Administration Department', 'Fees, ID cards, general administrative and campus queries', 'Mr. P. Narayana', 6);
      `);
      console.log("🌱 Default departments seeded.");
    }

    // Seed default admin and users if table is empty
    const [userRows] = await db.query("SELECT COUNT(*) AS count FROM users;");
    if (userRows[0].count === 0) {
      // Hashed password for 'admin123' and 'user123'
      const hashedPass = "$2a$10$wS6e44X/K0xNeqpXlC0hpeqWn4k9Z1Xz7nUfP23GkY0JgPqu7zH4m";
      await db.query(`
        INSERT INTO users (id, name, email, phone, password, role) VALUES
        (1, 'System Administrator', 'admin@smartcms.com', '9876543210', ?, 'admin'),
        (2, 'Rahul Kumar', 'rahul@gmail.com', '9845123456', ?, 'user'),
        (3, 'Anjali Sharma', 'anjali@gmail.com', '9845678901', ?, 'user'),
        (4, 'Varun Reddy', 'varun@gmail.com', '9812345678', ?, 'user');
      `, [hashedPass, hashedPass, hashedPass, hashedPass]);
      console.log("🌱 Default users seeded (admin@smartcms.com / admin123).");
    }

    // Seed default sample complaints if table is empty
    const [compRows] = await db.query("SELECT COUNT(*) AS count FROM complaints;");
    if (compRows[0].count === 0) {
      await db.query(`
        INSERT INTO complaints (id, user_id, user_name, user_email, title, description, category, priority, department, status, image_url, resolution_notes) VALUES
        ('CMP001', 2, 'Rahul Kumar', 'rahul@gmail.com', 'Projector not working in Lab 302', 'The HDMI projector display flickers and turns black during class sessions.', 'IT / Technical', 'High', 'IT Department', 'Pending', '', ''),
        ('CMP002', 3, 'Anjali Sharma', 'anjali@gmail.com', 'Hostel water problem on 2nd floor', 'There is no proper water supply in the hostel washrooms for the last two days.', 'Maintenance', 'High', 'Maintenance Department', 'In Progress', '', 'Plumbing staff assigned to inspect water pump.'),
        ('CMP003', 4, 'Varun Reddy', 'varun@gmail.com', 'Library AC making loud vibrating noise', 'The air conditioner in the quiet reading hall is malfunctioning and disturbing students.', 'Maintenance', 'Medium', 'Maintenance Department', 'Resolved', '', 'Compressor fan replaced and serviced successfully.');
      `);

      await db.query(`
        INSERT INTO complaint_logs (complaint_id, status, title, message) VALUES
        ('CMP001', 'Pending', 'Complaint Submitted', 'Complaint raised and AI routed to IT Department.'),
        ('CMP002', 'Pending', 'Complaint Submitted', 'Complaint raised and verified.'),
        ('CMP002', 'In Progress', 'Assigned & In Progress', 'Assigned to Maintenance Department. Staff is actively fixing the main supply line.'),
        ('CMP003', 'Pending', 'Complaint Submitted', 'Complaint registered.'),
        ('CMP003', 'In Progress', 'Technician Dispatched', 'Technician inspected AC unit.'),
        ('CMP003', 'Resolved', 'Resolved', 'AC servicing complete. Normal operation restored.');
      `);
      console.log("🌱 Sample complaints seeded.");
    }

    console.log("🎉 Database & tables initialized successfully!");
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("❌ MySQL Database Initialization Error:", error.message);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n=======================================================");
      console.error("⚠️  ACTION REQUIRED: MySQL Access Denied!");
      console.error("Please verify DB_USER and DB_PASSWORD environment variables.");
      console.error("=======================================================\n");
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      console.error("\n=======================================================");
      console.error("⚠️  ACTION REQUIRED: Could not connect to MySQL server!");
      console.error(`Check DB_HOST (${config.host}) and DB_PORT (${config.port}).`);
      console.error("If deploying on Render, configure remote MySQL credentials.");
      console.error("=======================================================\n");
    }
    throw error;
  }
};
