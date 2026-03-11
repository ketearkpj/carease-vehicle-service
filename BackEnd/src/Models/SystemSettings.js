// ===== src/models/SystemSettings.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const SystemSettings = sequelize.define('SystemSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(20),
    defaultValue: 'string'
  },
  description: {
    type: DataTypes.TEXT
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public'
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_encrypted'
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_required'
  },
  validation: {
    type: DataTypes.JSONB
  },
  defaultValue: {
    type: DataTypes.JSONB,
    field: 'default_value'
  },
  groupName: {
    type: DataTypes.STRING(50),
    field: 'group_name'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'display_order'
  },
  updatedBy: {
    type: DataTypes.UUID,
    field: 'updated_by'
  }
}, {
  tableName: 'system_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

SystemSettings.get = async (key, fallback = null) => {
  const setting = await SystemSettings.findOne({ where: { key } });
  return setting ? setting.value : fallback;
};

module.exports = SystemSettings;
