const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Vehicle = sequelize.define('Vehicle', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  make: DataTypes.STRING,
  model: DataTypes.STRING,
  year: DataTypes.INTEGER,
  rego: { type: DataTypes.STRING, unique: true },
  status: { type: DataTypes.ENUM('Available', 'Hired', 'Maintenance'), defaultValue: 'Available' },
  weeklyRent: DataTypes.FLOAT,
  bond: DataTypes.FLOAT,
  imageUrl: DataTypes.STRING,
  insuranceExpiry: DataTypes.STRING,
  serviceDue: DataTypes.STRING,
  driverId: DataTypes.INTEGER,
  odometer: DataTypes.INTEGER,
  purchasePrice: DataTypes.FLOAT,
  description: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = Vehicle; 