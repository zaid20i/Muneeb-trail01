const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Fine = sequelize.define('Fine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driverId: { type: DataTypes.INTEGER, allowNull: false },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false },
  amount: DataTypes.FLOAT,
  issueDate: DataTypes.STRING,
  dueDate: DataTypes.STRING,
  paymentDate: DataTypes.STRING,
  serviceName: DataTypes.STRING,
  status: { type: DataTypes.ENUM('Paid', 'Unpaid'), defaultValue: 'Unpaid' },
  description: DataTypes.STRING,
  infringementNumber: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = Fine; 