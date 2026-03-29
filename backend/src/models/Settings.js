const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Settings = sequelize.define('Settings', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyName: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  website: DataTypes.STRING,
  timezone: DataTypes.STRING,
  currency: DataTypes.STRING,
  dateFormat: DataTypes.STRING,
  weeklyPaymentDay: DataTypes.STRING,
  autoApprovalLimit: DataTypes.INTEGER,
  maintenanceInterval: DataTypes.INTEGER,
  insuranceReminder: DataTypes.INTEGER,
  licenseRenewalReminder: DataTypes.INTEGER,
  enableSmsNotifications: { type: DataTypes.BOOLEAN, defaultValue: true },
  enableEmailNotifications: { type: DataTypes.BOOLEAN, defaultValue: true },
  enablePushNotifications: { type: DataTypes.BOOLEAN, defaultValue: true },
  defaultLatePaymentFee: DataTypes.INTEGER,
  gracePeriodDays: DataTypes.INTEGER,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = Settings; 