// ===== src/models/Maintenance.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Maintenance = sequelize.define('Maintenance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vehicleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'vehicle_id'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'scheduled'
  },
  priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'normal'
  },
  schedule: {
    type: DataTypes.JSONB
  },
  serviceProvider: {
    type: DataTypes.JSONB,
    field: 'service_provider'
  },
  technician: {
    type: DataTypes.JSONB
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  diagnosis: {
    type: DataTypes.TEXT
  },
  findings: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  workPerformed: {
    type: DataTypes.JSONB,
    field: 'work_performed'
  },
  parts: {
    type: DataTypes.JSONB
  },
  costs: {
    type: DataTypes.JSONB
  },
  invoices: {
    type: DataTypes.JSONB
  },
  warranty: {
    type: DataTypes.JSONB
  },
  photos: {
    type: DataTypes.JSONB
  },
  documents: {
    type: DataTypes.JSONB
  },
  notes: {
    type: DataTypes.JSONB
  },
  nextMaintenance: {
    type: DataTypes.JSONB,
    field: 'next_maintenance'
  },
  completionReport: {
    type: DataTypes.JSONB,
    field: 'completion_report'
  },
  metadata: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'maintenance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Maintenance;
