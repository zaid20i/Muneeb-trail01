const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Fine } = require('../models');
const router = express.Router();

// Get all fines
router.get('/', authMiddleware, async (req, res) => {
  const fines = await Fine.findAll();
  res.json(fines);
});

// Get fine by id
router.get('/:id', authMiddleware, async (req, res) => {
  const fine = await Fine.findByPk(req.params.id);
  if (!fine) return res.status(404).json({ message: 'Not found' });
  res.json(fine);
});

// Create fine (admin)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const fine = await Fine.create(req.body);
  res.json(fine);
});

// Update fine (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const fine = await Fine.findByPk(req.params.id);
  if (!fine) return res.status(404).json({ message: 'Not found' });
  await fine.update(req.body);
  res.json(fine);
});

// Delete fine (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const fine = await Fine.findByPk(req.params.id);
  if (!fine) return res.status(404).json({ message: 'Not found' });
  await fine.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router; 