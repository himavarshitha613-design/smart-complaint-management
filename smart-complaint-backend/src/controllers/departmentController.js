import { getPool } from "../database/db.js";

// GET ALL DEPARTMENTS (with dynamic complaint count)
export const getAllDepartments = async (req, res) => {
  try {
    const db = getPool();
    const [departments] = await db.query(`
      SELECT 
        d.id,
        d.name,
        d.description,
        d.head_name,
        d.staff_count AS staff,
        COUNT(c.id) AS complaints
      FROM departments d
      LEFT JOIN complaints c ON d.name = c.department
      GROUP BY d.id
      ORDER BY d.id ASC;
    `);

    return res.json({
      success: true,
      departments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CREATE DEPARTMENT
export const createDepartment = async (req, res) => {
  try {
    const { name, description = "", head_name = "", staff = 5 } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required."
      });
    }

    const db = getPool();
    const [result] = await db.query(
      "INSERT INTO departments (name, description, head_name, staff_count) VALUES (?, ?, ?, ?);",
      [name, description, head_name, staff]
    );

    return res.status(201).json({
      success: true,
      message: "Department created successfully!",
      department: {
        id: result.insertId,
        name,
        description,
        head_name,
        staff,
        complaints: 0
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE DEPARTMENT
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getPool();
    await db.query("DELETE FROM departments WHERE id = ?;", [id]);

    return res.json({
      success: true,
      message: "Department deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
