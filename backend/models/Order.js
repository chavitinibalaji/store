const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: [{ productId: String, name: String, price: Number, quantity: Number }],
  total: Number,
  customer: { name: String, email: String, address: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
