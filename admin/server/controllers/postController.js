const { getPool } = require('../models/database');
const { logAction } = require('../middleware/auth');

const getAllPosts = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, category, search } = req.query;
    const pool = getPool();

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }
    if (category) {
      whereClause += ' AND p.category = ?';
      params.push(category);
    }
    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const [posts] = await pool.query(
      `SELECT p.*, u.username as author_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM posts p WHERE ${whereClause}`,
      params
    );

    res.json({ success: true, data: posts, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [posts] = await pool.query(
      `SELECT p.*, u.username as author_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }

    res.json({ success: true, data: posts[0] });
  } catch (error) {
    console.error('Get post by id error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, slug, category, tags, status } = req.body;
    const pool = getPool();

    if (!title) {
      return res.status(400).json({ success: false, message: '标题不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO posts (title, content, slug, category, tags, status, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, slug || null, category || null, JSON.stringify(tags || []), status || 'draft', req.user.id]
    );

    await logAction(req.user.id, 'CREATE_POST', 'post', { id: result.insertId, title }, req.ip, req.get('user-agent'));

    res.status(201).json({ success: true, message: '文章创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, slug, category, tags, status } = req.body;
    const pool = getPool();

    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (content !== undefined) { updates.push('content = ?'); values.push(content); }
    if (slug !== undefined) { updates.push('slug = ?'); values.push(slug); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有需要更新的字段' });
    }

    values.push(id);
    await pool.query(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`, values);

    await logAction(req.user.id, 'UPDATE_POST', 'post', { id, title }, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '文章更新成功' });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }

    await logAction(req.user.id, 'DELETE_POST', 'post', { id }, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '文章删除成功' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };
