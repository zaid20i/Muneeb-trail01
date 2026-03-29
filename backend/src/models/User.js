const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'driver'), allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive', 'pending'), defaultValue: 'active' },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = User; 