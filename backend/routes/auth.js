const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_change_me';

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
    res.json({ token, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
    res.json({ token, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// OTP-based login: send OTP to email
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    let user = await User.findOne({ email });
    if (!user) {
      // Create user if not exists (first-time OTP login)
      user = new User({ name: email.split('@')[0], email, passwordHash: '' });
      await user.save();
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    // In production, send OTP via email/SMS. For demo, just log it.
    console.log(`OTP for ${email}: ${otp}`);
    res.json({ ok: true, message: `OTP sent to ${email} (demo: ${otp})` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// OTP-based login: verify OTP and return token
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const now = new Date();
    if (!user.otp || user.otp !== otp || !user.otpExpiry || now > user.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    // Clear OTP after verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
    res.json({ token, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
