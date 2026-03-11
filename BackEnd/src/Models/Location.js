// ===== src/models/Location.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('showroom', 'service-center', 'storage', 'partner'),
    defaultValue: 'showroom'
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  contact: {
    type: DataTypes.JSONB
  },
  hours: {
    type: DataTypes.JSONB
  },
  services: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  facilities: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  staff: {
    type: DataTypes.JSONB
  },
  capacity: {
    type: DataTypes.JSONB
  },
  images: {
    type: DataTypes.JSONB
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isMainHub: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_main_hub'
  },
  metadata: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'locations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Location;
