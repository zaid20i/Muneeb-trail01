const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Payment, Vehicle, Driver, Fine } = require('../models');
const router = express.Router();

// Dashboard stats
router.get('/dashboard', authMiddleware, async (req, res) => {
  const totalCars = await Vehicle.count();
  const activeDrivers = await Driver.count({ where: { status: 'active' } });
  const weeklyEarnings = await Payment.sum('amount', { where: { status: 'Paid' } });
  const outstandingDues = await Payment.sum('amount', { where: { status: 'Due' } });
  res.json({ totalCars, activeDrivers, weeklyEarnings, outstandingDues });
});

// Weekly earnings chart
router.get('/earnings', authMiddleware, async (req, res) => {
  const payments = await Payment.findAll({ where: { status: 'Paid' } });
  // Group by week (for demo, just return all)
  res.json(payments);
});

// Outstanding payments
router.get('/outstanding', authMiddleware, async (req, res) => {
  const outstanding = await Payment.findAll({ where: { status: 'Due' } });
  res.json(outstanding);
});

// Fines summary
router.get('/fines', authMiddleware, async (req, res) => {
  const fines = await Fine.findAll();
  res.json(fines);
});

module.exports = router; 