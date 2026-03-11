// ===== src/config/connection.js =====
const { Pool } = require('pg');
const { logger } = require('../src/Middleware/Logger.md.js');

/**
 * PostgreSQL connection pool manager
 * Handles database connections, queries, and transactions
 */
class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  /**
   * Get database configuration based on environment
   */
  getConfig() {
    const env = process.env.NODE_ENV || 'development';

    const configs = {
      development: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_NAME || 'carease_dev',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
      test: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_TEST_NAME || 'carease_test',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
      production: {
        host: process.env.DB_HOST_PROD,
        port: parseInt(process.env.DB_PORT_PROD, 10) || 5432,
        database: process.env.DB_NAME_PROD,
        user: process.env.DB_USER_PROD,
        password: process.env.DB_PASSWORD_PROD,
        max: 50,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: {
          rejectUnauthorized: false
        }
      }
    };

    return configs[env] || configs.development;
  }

  /**
   * Initialize connection pool
   */
  async initialize() {
    try {
      const config = this.getConfig();
      
      this.pool = new Pool(config);

      // Test connection
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW() as now');
      client.release();

      this.isConnected = true;
      this.connectionAttempts = 0;

      logger.info(`✅ PostgreSQL connected successfully to ${config.database} at ${result.rows[0].now}`);

      // Handle pool errors
      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle client', err);
        this.isConnected = false;
      });

      return this.pool;
    } catch (error) {
      logger.error('PostgreSQL connection failed:', error);
      this.isConnected = false;

      if (this.connectionAttempts < this.maxRetries) {
        this.connectionAttempts++;
        logger.info(`Retrying connection in ${this.retryDelay / 1000} seconds... (attempt ${this.connectionAttempts}/${this.maxRetries})`);
        await this.sleep(this.retryDelay);
        return this.initialize();
      } else {
        throw new Error(`Failed to connect to PostgreSQL after ${this.maxRetries} attempts`);
      }
    }
  }

  /**
   * Get pool instance
   */
  getPool() {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  /**
   * Execute a single query
   */
  async query(text, params = []) {
    const start = Date.now();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      
      return result;
    } catch (error) {
      logger.error('Query error:', { text, error: error.message });
      throw error;
    }
  }

  /**
   * Get a client from pool for transactions
   */
  async getClient() {
    const client = await this.pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      logger.error('A client has been checked out for more than 5 seconds!');
      logger.error(`Last executed query: ${client.lastQuery}`);
    }, 5000);

    client.query = async (text, params) => {
      client.lastQuery = text;
      const result = await query(text, params);
      clearTimeout(timeout);
      return result;
    };

    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release();
    };

    return client;
  }

  /**
   * Execute a transaction with multiple queries
   */
  async transaction(callback) {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check database health
   */
  async checkHealth() {
    try {
      const start = Date.now();
      const result = await this.query('SELECT 1 as health_check');
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        connected: this.isConnected,
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    if (!this.pool) {
      return { initialized: false };
    }

    return {
      initialized: true,
      connected: this.isConnected,
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      maxConnections: this.pool.options.max
    };
  }

  /**
   * Close all connections
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      logger.info('PostgreSQL connection pool closed');
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new DatabaseConnection();