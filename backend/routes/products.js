const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products?search=&category=
router.get('/', async (req, res) => {
  const { search, category } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  try {
    const products = await Product.find(filter).limit(200);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
