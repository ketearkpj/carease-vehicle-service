// ===== server.js =====
const dotenv = require('dotenv');
const { connectDatabase, sequelize } = require('./src/Config/sequelize');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

const app = require('./App');
require('./src/Models');

const PORT = process.env.PORT || 5000;

let server;

const bootstrap = async () => {
  try {
    await connectDatabase();
    console.log('✅ Database connected successfully');

    const shouldAutoSync =
      process.env.DB_AUTO_SYNC === 'true' ||
      (!process.env.DB_AUTO_SYNC && process.env.NODE_ENV !== 'production');

    if (shouldAutoSync) {
      await sequelize.sync({ alter: false });
      console.log('✅ Database schema synchronized');
    }

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  }
};

bootstrap();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  if (!server) {
    process.exit(1);
    return;
  }
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated!');
  });
});
