const { getPool } = require('../models/database');
const { logAction } = require('../middleware/auth');

const getAllSettings = async (req, res) => {
  try {
    const pool = getPool();
    const [settings] = await pool.query('SELECT * FROM settings ORDER BY key_name');

    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key_name] = s.value;
    });

    res.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const pool = getPool();

    if (!key) {
      return res.status(400).json({ success: false, message: '设置键不能为空' });
    }

    const [existing] = await pool.query('SELECT id FROM settings WHERE key_name = ?', [key]);

    if (existing.length > 0) {
      await pool.query('UPDATE settings SET value = ?, description = ? WHERE key_name = ?', [value, description, key]);
    } else {
      await pool.query('INSERT INTO settings (key_name, value, description) VALUES (?, ?, ?)', [key, value, description]);
    }

    await logAction(req.user.id, 'UPDATE_SETTING', 'setting', { key, value }, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '设置更新成功' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const pool = getPool();

    const [[{ totalPosts }]] = await pool.query('SELECT COUNT(*) as totalPosts FROM posts');
    const [[{ publishedPosts }]] = await pool.query("SELECT COUNT(*) as publishedPosts FROM posts WHERE status = 'published'");
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalComments }]] = await pool.query('SELECT COUNT(*) as totalComments FROM comments');
    const [[{ pendingComments }]] = await pool.query("SELECT COUNT(*) as pendingComments FROM comments WHERE status = 'pending'");
    const [[{ totalLogs }]] = await pool.query('SELECT COUNT(*) as totalLogs FROM logs');

    const [recentPosts] = await pool.query(`
      SELECT p.id, p.title, p.status, p.created_at, u.username as author
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    const [recentLogs] = await pool.query(`
      SELECT l.*, u.username
      FROM logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        posts: { total: totalPosts, published: publishedPosts },
        users: { total: totalUsers },
        comments: { total: totalComments, pending: pendingComments },
        logs: { total: totalLogs },
        recentPosts,
        recentLogs,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = { getAllSettings, updateSetting, getDashboardStats };
