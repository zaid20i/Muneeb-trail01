const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { User, Driver } = require('../models');
const router = express.Router();

// Get all drivers (admin)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const drivers = await Driver.findAll({ include: User });
  res.json(drivers);
});

// Get my profile (driver)
router.get('/me', authMiddleware, requireRole('driver'), async (req, res) => {
  const driver = await Driver.findOne({ where: { userId: req.user.id }, include: User });
  res.json(driver);
});

// Get driver by id (admin)
router.get('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const driver = await Driver.findByPk(req.params.id, { include: User });
  if (!driver) return res.status(404).json({ message: 'Not found' });
  res.json(driver);
});

// Update driver (admin)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const driver = await Driver.findByPk(req.params.id);
  if (!driver) return res.status(404).json({ message: 'Not found' });
  await driver.update(req.body);
  res.json(driver);
});

// Delete driver (admin)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const driver = await Driver.findByPk(req.params.id);
  if (!driver) return res.status(404).json({ message: 'Not found' });
  await driver.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router; 