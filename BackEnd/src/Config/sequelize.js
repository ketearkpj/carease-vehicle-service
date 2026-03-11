// ===== src/config/sequelize.js =====
const { Sequelize } = require('sequelize');
const { logger } = require('../Middleware/Logger.md.js');

const env = process.env.NODE_ENV || 'development';

const buildConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      logging: false,
      ssl: env === 'production'
    };
  }

  return {
    database: process.env.DB_NAME || 'carease_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    ssl: env === 'production'
  };
};

const config = buildConfig();

const sequelize = config.url
  ? new Sequelize(config.url, {
      dialect: config.dialect,
      logging: config.logging,
      dialectOptions: config.ssl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}
    })
  : new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: config.logging,
      dialectOptions: config.ssl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}
    });

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connected successfully');
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDatabase
};
