const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SupportTicket = sequelize.define('SupportTicket', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driverId: { type: DataTypes.INTEGER },
  vehicleId: { type: DataTypes.INTEGER },
  title: DataTypes.STRING,
  description: DataTypes.STRING,
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('open', 'in-progress', 'pending', 'resolved', 'closed'), defaultValue: 'open' },
  category: DataTypes.STRING,
  submittedBy: DataTypes.STRING,
  assignedTo: DataTypes.STRING,
  lastUpdated: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = SupportTicket; 