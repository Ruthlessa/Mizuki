const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { getPool } = require('../models/database');
const { logAction } = require('../middleware/auth');

const register = async (req, res) => {
  try {
    const { username, password, email, role = 'viewer' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    const pool = getPool();
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, role]
    );

    await logAction(result.insertId, 'REGISTER', 'user', { username }, req.ip, req.get('user-agent'));

    res.status(201).json({ success: true, message: '用户注册成功' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    const pool = getPool();
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const user = users[0];

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: '账户已被禁用' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    await logAction(user.id, 'LOGIN', 'user', { username }, req.ip, req.get('user-agent'));

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const getProfile = async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query('SELECT id, username, email, role, status, created_at FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const pool = getPool();

    await pool.query('UPDATE users SET email = ? WHERE id = ?', [email, req.user.id]);
    await logAction(req.user.id, 'UPDATE_PROFILE', 'user', { email }, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '个人信息更新成功' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '请提供旧密码和新密码' });
    }

    const pool = getPool();
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);

    const isOldPasswordValid = await bcrypt.compare(oldPassword, users[0].password);

    if (!isOldPasswordValid) {
      return res.status(401).json({ success: false, message: '旧密码错误' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    await logAction(req.user.id, 'CHANGE_PASSWORD', 'user', {}, req.ip, req.get('user-agent'));

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
