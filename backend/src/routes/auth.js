const express = require('express');
const bcrypt = require('bcryptjs');
const { sign } = require('../utils/jwt');
const { User, Driver } = require('../models');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = sign({ id: user.id, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
});

// Register driver
router.post('/register', async (req, res) => {
  const { name, email, password, phone, address, licenseNumber, licenseExpiry, dateOfBirth } = req.body;
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password: bcrypt.hashSync(password, 10), role: 'driver', status: 'pending' });
  await Driver.create({ userId: user.id, phone, address, licenseNumber, licenseExpiry, dateOfBirth, status: 'pending' });
  res.json({ message: 'Driver registered, pending approval' });
});

module.exports = router; 