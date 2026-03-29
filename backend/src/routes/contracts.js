const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Contract } = require('../models');
const router = express.Router();

// Get all contracts
router.get('/', authMiddleware, async (req, res) => {
  const contracts = await Contract.findAll();
  res.json(contracts);
});

// Get contract by id
router.get('/:id', authMiddleware, async (req, res) => {
  const contract = await Contract.findByPk(req.params.id);
  if (!contract) return res.status(404).json({ message: 'Not found' });
  res.json(contract);
});

// Create contract (admin)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const contract = await Contract.create(req.body);
  res.json(contract);
});

// Update contract (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const contract = await Contract.findByPk(req.params.id);
  if (!contract) return res.status(404).json({ message: 'Not found' });
  await contract.update(req.body);
  res.json(contract);
});

// Approve contract (admin)
router.post('/:id/approve', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const contract = await Contract.findByPk(req.params.id);
  if (!contract) return res.status(404).json({ message: 'Not found' });
  await contract.update({ status: 'Approved', approvedDate: new Date().toISOString().split('T')[0] });
  res.json(contract);
});

// Reject contract (admin)
router.post('/:id/reject', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const contract = await Contract.findByPk(req.params.id);
  if (!contract) return res.status(404).json({ message: 'Not found' });
  await contract.update({ status: 'Rejected', rejectedDate: new Date().toISOString().split('T')[0] });
  res.json(contract);
});

// Delete contract (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const contract = await Contract.findByPk(req.params.id);
  if (!contract) return res.status(404).json({ message: 'Not found' });
  await contract.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router; 