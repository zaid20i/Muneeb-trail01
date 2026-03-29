const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Contract = sequelize.define('Contract', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driverId: { type: DataTypes.INTEGER, allowNull: false },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false },
  startDate: DataTypes.STRING,
  endDate: DataTypes.STRING,
  weeklyRate: DataTypes.FLOAT,
  status: { type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Rejected', 'Active', 'Completed'), defaultValue: 'Draft' },
  submittedDate: DataTypes.STRING,
  approvedDate: DataTypes.STRING,
  rejectedDate: DataTypes.STRING,
  adminNotes: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = Contract; 