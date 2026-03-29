const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Notification } = require('../models');
const router = express.Router();

// Get all notifications for user
router.get('/', authMiddleware, async (req, res) => {
  const notifications = await Notification.findAll({ where: { userId: req.user.id } });
  res.json(notifications);
});

// Mark notification as read
router.post('/:id/read', authMiddleware, async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Not found' });
  if (notification.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await notification.update({ read: true });
  res.json(notification);
});

// Create notification (admin)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const notification = await Notification.create(req.body);
  res.json(notification);
});

// Delete notification (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Not found' });
  await notification.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router; 