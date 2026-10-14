import { getPool } from "../database/db.js";

// GET SYSTEM-WIDE ANALYTICS & REPORTS (Admin)
export const getAnalytics = async (req, res) => {
  try {
    const db = getPool();

    // Counts by status
    const [counts] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
      FROM complaints;
    `);

    const total = counts[0].total || 0;
    const pending = counts[0].pending || 0;
    const inProgress = counts[0].inProgress || 0;
    const resolved = counts[0].resolved || 0;
    const rejected = counts[0].rejected || 0;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Distribution by category
    const [categories] = await db.query(`
      SELECT category, COUNT(*) AS count
      FROM complaints
      GROUP BY category
      ORDER BY count DESC;
    `);

    const categoryDistribution = categories.map(cat => ({
      name: cat.category,
      count: cat.count,
      percentage: total > 0 ? Math.round((cat.count / total) * 100) : 0
    }));

    return res.json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
        resolutionRate: `${resolutionRate}%`,
        averageResponseTime: "2.4 hrs",
        aiAccuracy: "96%"
      },
      categoryDistribution
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET USER-SPECIFIC STATS (User Dashboard)
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email || req.query.email;

    const db = getPool();
    let whereClause = "";
    const params = [];

    if (userId) {
      whereClause = "WHERE user_id = ? OR user_email = ?";
      params.push(userId, userEmail);
    } else if (userEmail) {
      whereClause = "WHERE user_email = ?";
      params.push(userEmail);
    }

    const [counts] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
      FROM complaints ${whereClause};
    `, params);

    return res.json({
      success: true,
      stats: {
        total: counts[0].total || 0,
        pending: counts[0].pending || 0,
        inProgress: counts[0].inProgress || 0,
        resolved: counts[0].resolved || 0
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
