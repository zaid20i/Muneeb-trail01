const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Settings } = require('../models');
const router = express.Router();

// Get settings
router.get('/', authMiddleware, async (req, res) => {
  const settings = await Settings.findOne();
  res.json(settings);
});

// Update settings (admin)
router.put('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const settings = await Settings.findOne();
  if (!settings) return res.status(404).json({ message: 'Not found' });
  await settings.update(req.body);
  res.json(settings);
});

module.exports = router; 