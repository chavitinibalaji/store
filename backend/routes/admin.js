const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const path = require('path');

const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

// POST /api/admin/add-product
router.post('/add-product', upload.single('image'), async (req, res) => {
  const { name, price, category, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  if (!name || !price) return res.status(400).json({ error: 'Missing name or price' });
  try {
    const p = new Product({ name, price: Number(price), category, description, image });
    await p.save();
    res.json({ ok: true, product: p });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
