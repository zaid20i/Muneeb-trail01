const sequelize = require('../db');
const User = require('./User');
const Driver = require('./Driver');
const Vehicle = require('./Vehicle');
const Contract = require('./Contract');
const Payment = require('./Payment');
const Fine = require('./Fine');
const Notification = require('./Notification');
const SupportTicket = require('./SupportTicket');
const Document = require('./Document');
const Settings = require('./Settings');

module.exports = {
  sequelize,
  User,
  Driver,
  Vehicle,
  Contract,
  Payment,
  Fine,
  Notification,
  SupportTicket,
  Document,
  Settings,
  sync: () => sequelize.sync({ alter: true })
}; 