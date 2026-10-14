import { getPool } from "../database/db.js";
import { analyzeComplaintText } from "../services/aiService.js";

// GENERATE NEXT COMPLAINT ID (e.g. CMP001, CMP002...)
const generateComplaintId = async (db) => {
  const [rows] = await db.query("SELECT id FROM complaints ORDER BY created_at DESC LIMIT 100;");
  let maxNum = 0;
  for (const row of rows) {
    const numPart = parseInt(row.id.replace("CMP", ""), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  }
  const nextNum = maxNum + 1;
  return `CMP${String(nextNum).padStart(3, "0")}`;
};

// CREATE NEW COMPLAINT
export const createComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    let { category, priority, department } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Complaint title and description are required."
      });
    }

    // Run AI analysis if category or priority is missing
    const aiAnalysis = analyzeComplaintText(title, description);
    if (!category || category === "General" || category === "") {
      category = aiAnalysis.category;
    }
    if (!priority || priority === "") {
      priority = aiAnalysis.priority;
    }
    if (!department || department === "") {
      department = aiAnalysis.department;
    }

    const db = getPool();
    const complaintId = await generateComplaintId(db);

    // Image file path if uploaded
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // User info (from JWT if authenticated, or from body)
    const userId = req.user ? req.user.id : (req.body.userId || null);
    const userName = req.user ? req.user.name : (req.body.userName || "Student User");
    const userEmail = req.user ? req.user.email : (req.body.userEmail || "student@example.com");

    await db.query(`
      INSERT INTO complaints (
        id, user_id, user_name, user_email, title, description,
        category, priority, department, status, image_url, resolution_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, '');
    `, [
      complaintId,
      userId,
      userName,
      userEmail,
      title,
      description,
      category,
      priority,
      department,
      imageUrl
    ]);

    // Insert initial timeline entry
    await db.query(`
      INSERT INTO complaint_logs (complaint_id, status, title, message)
      VALUES (?, 'Pending', 'Complaint Submitted', ?);
    `, [
      complaintId,
      `Complaint successfully logged. AI classified into '${category}' with '${priority}' priority.`
    ]);

    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully!",
      complaintId,
      complaint: {
        id: complaintId,
        title,
        description,
        category,
        priority,
        department,
        status: "Pending",
        imageUrl,
        aiAnalysis
      }
    });
  } catch (error) {
    console.error("Create Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create complaint: " + error.message
    });
  }
};

// GET ALL COMPLAINTS (With optional search and filtering)
export const getAllComplaints = async (req, res) => {
  try {
    const { search = "", status = "", department = "", priority = "" } = req.query;
    const db = getPool();

    let query = "SELECT * FROM complaints WHERE 1=1";
    const params = [];

    if (search.trim()) {
      query += " AND (title LIKE ? OR description LIKE ? OR user_name LIKE ? OR id LIKE ?)";
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (status && status !== "All Status") {
      query += " AND status = ?";
      params.push(status);
    }

    if (department && department !== "All Departments") {
      query += " AND department = ?";
      params.push(department);
    }

    if (priority && priority !== "All Priorities") {
      query += " AND priority = ?";
      params.push(priority);
    }

    query += " ORDER BY created_at DESC;";

    const [complaints] = await db.query(query, params);

    // Format dates nicely
    const formatted = complaints.map(c => ({
      ...c,
      date: new Date(c.created_at).toLocaleDateString("en-IN")
    }));

    return res.json({
      success: true,
      total: formatted.length,
      complaints: formatted
    });
  } catch (error) {
    console.error("Get All Complaints Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET USER'S COMPLAINTS
export const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email || req.query.email;

    const db = getPool();
    let query = "SELECT * FROM complaints WHERE 1=1";
    const params = [];

    if (userId) {
      query += " AND (user_id = ? OR user_email = ?)";
      params.push(userId, userEmail);
    } else if (userEmail) {
      query += " AND user_email = ?";
      params.push(userEmail);
    }

    query += " ORDER BY created_at DESC;";

    const [complaints] = await db.query(query, params);

    const formatted = complaints.map(c => ({
      ...c,
      date: new Date(c.created_at).toLocaleDateString("en-IN")
    }));

    return res.json({
      success: true,
      complaints: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET COMPLAINT DETAILS BY ID
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getPool();

    const [rows] = await db.query("SELECT * FROM complaints WHERE id = ?;", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found."
      });
    }

    const complaint = rows[0];

    // Fetch timeline progress logs
    const [logs] = await db.query(
      "SELECT * FROM complaint_logs WHERE complaint_id = ? ORDER BY created_at ASC;",
      [id]
    );

    return res.json({
      success: true,
      complaint: {
        ...complaint,
        date: new Date(complaint.created_at).toLocaleDateString("en-IN")
      },
      timeline: logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE COMPLAINT STATUS & NOTES (Admin/Staff)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes = "" } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required."
      });
    }

    const db = getPool();

    const [compCheck] = await db.query("SELECT id, status FROM complaints WHERE id = ?;", [id]);
    if (compCheck.length === 0) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    await db.query(
      "UPDATE complaints SET status = ?, resolution_notes = ? WHERE id = ?;",
      [status, resolution_notes, id]
    );

    // Log progress change
    await db.query(`
      INSERT INTO complaint_logs (complaint_id, status, title, message)
      VALUES (?, ?, ?, ?);
    `, [
      id,
      status,
      `Status changed to ${status}`,
      resolution_notes || `Status transitioned to ${status}.`
    ]);

    return res.json({
      success: true,
      message: `Complaint ${id} status updated to ${status}.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE COMPLAINT
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getPool();

    await db.query("DELETE FROM complaints WHERE id = ?;", [id]);

    return res.json({
      success: true,
      message: `Complaint ${id} deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// AI REAL-TIME ANALYSIS ENDPOINT
export const analyzeComplaint = (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide title or description for AI analysis."
      });
    }

    const analysis = analyzeComplaintText(title, description);

    return res.json({
      success: true,
      analysis
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
