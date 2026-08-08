const dotenv = require('dotenv');
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('[FATAL] JWT_SECRET is not configured or shorter than 32 chars. Refusing to start.');
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithms: ['HS256'],
  jwtExpiresIn: '24h',
  cors: {
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mizuki_admin',
  },
  bcryptSaltRounds: 10,
};
