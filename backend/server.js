require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev_secret_key_do_not_use_in_production';
  console.log('WARNING: Using default JWT_SECRET - set in .env for production');
}
if (!process.env.JWT_OTP_SECRET) {
  process.env.JWT_OTP_SECRET = 'dev_otp_secret_do_not_use_in_production';
}

const authRoutes = require('./routes/auth');
const referralRoutes = require('./routes/referral');
const doctorRoutes = require('./routes/doctor');

const app = express();
connectDB();

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : false,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/referral', referralRoutes);
app.use('/doctors', doctorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));