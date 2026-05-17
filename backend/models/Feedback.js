const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: true,
    unique: true,
  },
  specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feedbackText: { type: String, required: true },
  files: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);