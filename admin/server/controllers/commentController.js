const { getPool } = require('../models/database');
const { logAction } = require('../middleware/auth');

const getAllComments = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, post_id } = req.query;
    const pool = getPool();

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND c.status = ?';
      params.push(status);
    }
    if (post_id) {
      whereClause += ' AND c.post_id = ?';
      params.push(post_id);
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const [comments] = await pool.query(
      `SELECT c.*, p.title as post_title
       FROM comments c
       LEFT JOIN posts p ON c.post_id = p.id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM comments c WHERE ${whereClause}`,
      params
    );

    res.json({ success: true, data: comments, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('Get all comments error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pool = getPool();

    await pool.query('UPDATE comments SET status = ? WHERE id = ?', [status, id]);
    await logAction(req.user.id, 'UPDATE_COMMENT', 'comment', { id, status }, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '评论状态更新成功' });
  } catch (error) {
    console.error('Update comment status error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM comments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '评论不存在' });
    }

    await logAction(req.user.id, 'DELETE_COMMENT', 'comment', { id }, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '评论删除成功' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = { getAllComments, updateCommentStatus, deleteComment };
