const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Vehicle } = require('../models');
const router = express.Router();

// Get all vehicles
router.get('/', authMiddleware, async (req, res) => {
  const vehicles = await Vehicle.findAll();
  res.json(vehicles);
});

// Get vehicle by id
router.get('/:id', authMiddleware, async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Not found' });
  res.json(vehicle);
});

// Create vehicle (admin)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const vehicle = await Vehicle.create(req.body);
  res.json(vehicle);
});

// Update vehicle (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Not found' });
  await vehicle.update(req.body);
  res.json(vehicle);
});

// Delete vehicle (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Not found' });
  await vehicle.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router; 