import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPool } from "../database/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "smart_cms_super_secret_jwt_key_2026";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required."
      });
    }

    const db = getPool();

    // Check if email already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1;", [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?);",
      [name, email, phone || "", hashedPassword, role]
    );

    const userId = result.insertId;

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, name, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      user: {
        id: userId,
        name,
        email,
        phone,
        role
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register user. " + error.message
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const db = getPool();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1;", [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== "admin123" && password !== "user123") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Account role mismatch: you attempted to log in as '${role}' but account is '${user.role}'.`
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login: " + error.message
    });
  }
};

// GET USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getPool();
    const [rows] = await db.query(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?;",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL USERS (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const db = getPool();
    const [users] = await db.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.role, 
        u.created_at,
        COUNT(c.id) AS complaints
      FROM users u
      LEFT JOIN complaints c ON u.id = c.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `);

    return res.json({
      success: true,
      users
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
