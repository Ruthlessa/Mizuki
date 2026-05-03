const { getPool } = require('../models/database');
const { logAction } = require('../middleware/auth');

const getAllUsers = async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query(
      'SELECT id, username, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    res.json({ success: true, data: users, total: users.length });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [users] = await pool.query(
      'SELECT id, username, email, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const bcrypt = require('bcryptjs');
    const config = require('../config');

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, role || 'viewer']
    );

    await logAction(req.user.id, 'CREATE_USER', 'user', { username }, req.ip, req.get('user-agent'));

    res.status(201).json({ success: true, message: '用户创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, status } = req.body;
    const pool = getPool();

    const updates = [];
    const values = [];

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有需要更新的字段' });
    }

    values.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    await logAction(req.user.id, 'UPDATE_USER', 'user', { id, email, role, status }, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '用户更新成功' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: '不能删除当前登录用户' });
    }

    const pool = getPool();
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    await logAction(req.user.id, 'DELETE_USER', 'user', { id }, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
