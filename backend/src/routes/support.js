const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { SupportTicket } = require('../models');
const router = express.Router();

// Get all tickets
router.get('/', authMiddleware, async (req, res) => {
  const tickets = await SupportTicket.findAll();
  res.json(tickets);
});

// Get ticket by id
router.get('/:id', authMiddleware, async (req, res) => {
  const ticket = await SupportTicket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Not found' });
  res.json(ticket);
});

// Create ticket
router.post('/', authMiddleware, async (req, res) => {
  const ticket = await SupportTicket.create(req.body);
  res.json(ticket);
});

// Update ticket (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const ticket = await SupportTicket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Not found' });
  await ticket.update(req.body);
  res.json(ticket);
});

// Delete ticket (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const ticket = await SupportTicket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Not found' });
  await ticket.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router; 