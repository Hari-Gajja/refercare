// This file is not needed as TwiML is handled directly in routes/call.js
// Kept for reference purposes

module.exports = {
  getTwiML: () => {
    return `
    <Response>
      <Say voice="alice">Your referral has been confirmed. Please visit at the scheduled time.</Say>
    </Response>
    `;
  }
};