const express = require('express');
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const { Document } = require('../models');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// Get all documents
router.get('/', authMiddleware, async (req, res) => {
  const docs = await Document.findAll();
  res.json(docs);
});

// Get document by id
router.get('/:id', authMiddleware, async (req, res) => {
  const doc = await Document.findByPk(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

// Upload document (admin)
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { name, type, category, status, expiryDate, uploadedBy, relatedId, description, version, isRequired } = req.body;
  const file = req.file;
  const doc = await Document.create({
    name,
    type,
    category,
    status,
    uploadDate: new Date().toISOString().split('T')[0],
    expiryDate,
    fileSize: file.size + ' bytes',
    fileType: file.mimetype,
    uploadedBy,
    relatedId,
    description,
    version,
    isRequired,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  res.json(doc);
});

// Update document (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const doc = await Document.findByPk(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  await doc.update(req.body);
  res.json(doc);
});

// Delete document (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const doc = await Document.findByPk(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  await doc.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router; 