const emailConfig = require('../config/email');

const buildBaseTemplateParams = (overrides) => ({
  ...overrides,
  app_name: 'Medical Referral System',
  support_email: process.env.EMAIL_FROM || 'support@example.com',
  current_year: new Date().getFullYear(),
});

const sendEmailViaEmailJS = async ({ templateId, templateParams, label }) => {
  const { apiUrl, serviceId, publicKey, privateKey } = emailConfig;

  if (!serviceId || !templateId || !publicKey || publicKey === 'your_emailjs_public_key') {
    console.log(`[SIMULATED EMAIL] ${label} Params:`, templateParams);
    return { messageId: 'SIMULATED' };
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: buildBaseTemplateParams(templateParams),
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(
        `EmailJS error: ${response.status} ${response.statusText} - ${errorText}`
      );
      console.error('Email error:', error);
      throw error;
    }

    const responseText = await response.text();
    console.log(`${label} email sent`);
    return { messageId: responseText };
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

const sendEmail = async ({ to, subject, html }) => {
  return sendEmailViaEmailJS({
    templateId: emailConfig.templateId,
    templateParams: {
      to_email: to,
      subject,
      html,
      from_email: process.env.EMAIL_FROM || 'noreply@example.com',
      from_name: 'Medical Referral System',
    },
    label: 'GENERIC',
  });
};

const sendOtpEmail = async ({ to, recipientName, otpCode, otpExpiresIn, verificationLink }) => {
  return sendEmailViaEmailJS({
    templateId: emailConfig.otpTemplateId,
    templateParams: {
      to_email: to,
      recipient_name: recipientName,
      otp_code: otpCode,
      otp_expires_in: otpExpiresIn,
      verification_link: verificationLink,
    },
    label: 'OTP',
  });
};

const sendReferralEmail = async ({
  to,
  recipientName,
  patientName,
  patientId,
  referralReason,
  referralNotes,
  referrerName,
  referrerContact,
  referralLink,
}) => {
  return sendEmailViaEmailJS({
    templateId: emailConfig.referralTemplateId,
    templateParams: {
      to_email: to,
      recipient_name: recipientName,
      patient_name: patientName,
      patient_id: patientId,
      referral_reason: referralReason,
      referral_notes: referralNotes,
      referrer_name: referrerName,
      referrer_contact: referrerContact,
      referral_link: referralLink,
    },
    label: 'REFERRAL',
  });
};

module.exports = sendEmail;
module.exports.sendOtpEmail = sendOtpEmail;
module.exports.sendReferralEmail = sendReferralEmail;
module.exports.sendEmailViaEmailJS = sendEmailViaEmailJS;
