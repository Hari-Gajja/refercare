const jwt = require('jsonwebtoken');

const normalizePhoneNumber = (value = '') => {
  const trimmed = value.trim();
  const normalized = trimmed.replace(/[^\d+]/g, '');
  if (normalized.startsWith('00')) {
    return `+${normalized.slice(2)}`;
  }
  return normalized;
};

const applyDefaultCountryCode = (value) => {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length === 10 && process.env.DEFAULT_COUNTRY_CODE) {
    return `${process.env.DEFAULT_COUNTRY_CODE}${digitsOnly}`;
  }
  return value;
};

const normalizeForComparison = (value) => {
  let normalized = normalizePhoneNumber(value);
  if (!/^\+\d{6,15}$/.test(normalized)) {
    normalized = applyDefaultCountryCode(normalized);
  }
  return normalized;
};

exports.verifyOtpToken = (req, res, next) => {
  const token = req.headers['otp-token'];
  if (!token) {
    return res.status(400).json({ message: 'OTP token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_OTP_SECRET);
    const tokenPhone = normalizeForComparison(decoded.phoneNumber || '');
    const bodyPhone = normalizeForComparison(req.body.phoneNumber || '');
    if (tokenPhone !== bodyPhone) {
      return res.status(400).json({ message: 'Phone number mismatch' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired OTP token' });
  }
};