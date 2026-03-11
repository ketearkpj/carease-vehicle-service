// ===== src/models/AuditLog.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.UUID,
    field: 'admin_id'
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.UUID,
    field: 'entity_id'
  },
  changes: {
    type: DataTypes.JSONB
  },
  ipAddress: {
    type: DataTypes.STRING,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'success'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    field: 'error_message'
  },
  duration: {
    type: DataTypes.INTEGER
  },
  requestMethod: {
    type: DataTypes.STRING(10),
    field: 'request_method'
  },
  requestUrl: {
    type: DataTypes.TEXT,
    field: 'request_url'
  },
  requestParams: {
    type: DataTypes.JSONB,
    field: 'request_params'
  },
  severity: {
    type: DataTypes.STRING(20),
    defaultValue: 'info'
  }
}, {
  tableName: 'audit_logs',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AuditLog;
