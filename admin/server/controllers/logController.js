const { getPool } = require('../models/database');

const getAllLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, action, user_id, start_date, end_date } = req.query;
    const pool = getPool();

    let whereClause = '1=1';
    const params = [];

    if (action) {
      whereClause += ' AND l.action = ?';
      params.push(action);
    }
    if (user_id) {
      whereClause += ' AND l.user_id = ?';
      params.push(user_id);
    }
    if (start_date) {
      whereClause += ' AND l.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND l.created_at <= ?';
      params.push(end_date);
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const [logs] = await pool.query(
      `SELECT l.*, u.username
       FROM logs l
       LEFT JOIN users u ON l.user_id = u.id
       WHERE ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM logs l WHERE ${whereClause}`,
      params
    );

    res.json({ success: true, data: logs, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('Get all logs error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const getLogStatistics = async (req, res) => {
  try {
    const pool = getPool();

    const [dailyStats] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    const [actionStats] = await pool.query(`
      SELECT action, COUNT(*) as count
      FROM logs
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `);

    const [userStats] = await pool.query(`
      SELECT u.username, COUNT(*) as count
      FROM logs l
      LEFT JOIN users u ON l.user_id = u.id
      GROUP BY l.user_id, u.username
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        dailyStats,
        actionStats,
        userStats,
      },
    });
  } catch (error) {
    console.error('Get log statistics error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = { getAllLogs, getLogStatistics };
