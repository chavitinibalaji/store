const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/cart/checkout
router.post('/checkout', async (req, res) => {
  const { items, customer } = req.body;
  if (!items || !customer) return res.status(400).json({ error: 'Missing items or customer' });
  const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
  try {
    const order = new Order({ items, total, customer });
    await order.save();
    // Return the saved order object so frontend can show details
    res.json({ ok: true, orderId: order._id, order });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
