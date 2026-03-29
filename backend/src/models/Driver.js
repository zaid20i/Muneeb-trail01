const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Driver = sequelize.define('Driver', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  licenseNumber: DataTypes.STRING,
  licenseExpiry: DataTypes.STRING,
  profileImageUrl: DataTypes.STRING,
  joinDate: DataTypes.STRING,
  contractEndDate: DataTypes.STRING,
  dateOfBirth: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'inactive', 'pending'), defaultValue: 'pending' },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

Driver.belongsTo(User, { foreignKey: 'userId' });
module.exports = Driver; 