const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER },
  type: DataTypes.STRING,
  title: DataTypes.STRING,
  message: DataTypes.STRING,
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  actionRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = Notification; 