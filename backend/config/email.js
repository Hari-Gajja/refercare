const emailConfig = {
  apiUrl: process.env.EMAILJS_API_URL || 'https://api.emailjs.com/api/v1.0/email/send',
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  otpTemplateId: process.env.EMAILJS_OTP_TEMPLATE_ID,
  referralTemplateId: process.env.EMAILJS_REFERRAL_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
};

module.exports = emailConfig;
