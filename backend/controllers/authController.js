const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const EMAIL_OTP_EXPIRY_MINUTES = Number.parseInt(
  process.env.EMAIL_OTP_EXPIRES_MINUTES || '10',
  10
);

const hashOtp = (value) => crypto.createHash('sha256').update(value).digest('hex');

exports.requestEmailOtp = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + EMAIL_OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.findOneAndUpdate(
      { email: normalizedEmail },
      { codeHash: hashOtp(otpCode), expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Email sending removed as per request
    console.log(`[AUTH] OTP for ${normalizedEmail}: ${otpCode}`);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, otpCode } = req.body;
    if (role !== 'Specialist') {
      return res.status(400).json({ message: 'Only specialist accounts are allowed' });
    }
    if (!otpCode) {
      return res.status(400).json({ message: 'OTP code is required' });
    }
    const normalizedEmail = email?.toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingSpecialist = await User.findOne({ role: 'Specialist' });
    if (existingSpecialist) {
      return res.status(400).json({ message: 'Specialist account already exists' });
    }

    const otpRecord = await EmailOtp.findOne({ email: normalizedEmail });
    if (!otpRecord || otpRecord.expiresAt <= new Date()) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }
    if (otpRecord.codeHash !== hashOtp(otpCode)) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      phone,
      isEmailVerified: true,
    });

    await EmailOtp.deleteOne({ email: normalizedEmail });

    res.status(201).json({
      message: 'User registered successfully.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== 'Specialist') {
      return res.status(403).json({ message: 'Only specialist accounts can sign in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email role phone specialization');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: { id: user._id, ...user.toObject() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, specialization } = req.body;
    const update = {};

    const existingUser = await User.findById(req.user._id).select('specialization');
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof name === 'string' && name.trim()) {
      update.name = name.trim();
    }
    if (typeof phone === 'string') {
      update.phone = phone.trim();
    }
    if (typeof specialization === 'string') {
      const nextValue = specialization.trim();
      if (existingUser.specialization && existingUser.specialization !== nextValue) {
        return res.status(400).json({ message: 'Specialization is locked once set.' });
      }
      if (!existingUser.specialization && nextValue) {
        update.specialization = nextValue;
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      select: 'name email role phone specialization',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
