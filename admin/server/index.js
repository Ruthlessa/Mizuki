const express = require('express');
const cors = require('cors');
const config = require('./config');
const { initDatabase } = require('./models/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const logRoutes = require('./routes/logs');
const settingController = require('./controllers/settingController');
const { authMiddleware } = require('./middleware/auth');

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/logs', logRoutes);

app.get('/api/settings', authMiddleware, settingController.getAllSettings);
app.put('/api/settings', authMiddleware, settingController.updateSetting);
app.get('/api/dashboard/stats', authMiddleware, settingController.getDashboardStats);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: '请求的资源不存在' });
});

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized successfully');

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`API available at http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
