const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driverId: { type: DataTypes.INTEGER, allowNull: false },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false },
  amount: DataTypes.FLOAT,
  dueDate: DataTypes.STRING,
  status: { type: DataTypes.ENUM('Due', 'Paid', 'Overdue'), defaultValue: 'Due' },
  paymentDate: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = Payment; 