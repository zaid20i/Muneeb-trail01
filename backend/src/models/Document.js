const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  category: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'expired', 'pending', 'rejected', 'archived'), defaultValue: 'active' },
  uploadDate: DataTypes.STRING,
  expiryDate: DataTypes.STRING,
  fileSize: DataTypes.STRING,
  fileType: DataTypes.STRING,
  uploadedBy: DataTypes.STRING,
  relatedId: DataTypes.INTEGER,
  description: DataTypes.STRING,
  version: { type: DataTypes.INTEGER, defaultValue: 1 },
  isRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = Document; 