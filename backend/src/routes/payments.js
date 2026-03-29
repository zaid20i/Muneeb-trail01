const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Payment } = require('../models');
const router = express.Router();

// Get all payments
router.get('/', authMiddleware, async (req, res) => {
  const payments = await Payment.findAll();
  res.json(payments);
});

// Get payment by id
router.get('/:id', authMiddleware, async (req, res) => {
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Not found' });
  res.json(payment);
});

// Create payment (admin)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const payment = await Payment.create(req.body);
  res.json(payment);
});

// Update payment (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Not found' });
  await payment.update(req.body);
  res.json(payment);
});

// Delete payment (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Not found' });
  await payment.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router; 