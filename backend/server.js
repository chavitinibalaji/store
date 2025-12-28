require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// AWS SNS Config
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const sns = new AWS.SNS();

// In-memory OTP store (use DB/Redis in prod)
const otpStore = {}; 
// { "+919876543210": { otp: "123456", expires: 123456789 } }

// SEND OTP
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone)
    return res.status(400).json({ error: 'Phone number required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;

  otpStore[phone] = { otp, expires };

  try {
    await sns.publish({
      Message: `Your AAGAM OTP is ${otp}. Valid for 5 minutes.`,
      PhoneNumber: phone
    }).promise();

    console.log(`OTP sent to ${phone}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'SMS failed' });
  }
});

// VERIFY OTP
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  const record = otpStore[phone];
  if (!record) return res.status(400).json({ error: 'OTP not found' });
  if (Date.now() > record.expires)
    return res.status(400).json({ error: 'OTP expired' });

  if (record.otp !== otp)
    return res.status(401).json({ error: 'Invalid OTP' });

  delete otpStore[phone];

  res.json({
    ok: true,
    user: { phone, role: 'user' }
  });
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
