const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  age: { type: Number },
  phoneNumber: { type: String, required: true },
  issueDescription: { type: String, required: true },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  files: [{ type: String }],
  referredByDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  referredByDoctorName: { type: String },
  referredByDoctorPhone: { type: String },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Referred', 'Accepted', 'In Progress', 'Completed', 'Rejected'],
    default: 'Referred',
  },
  otpVerified: { type: Boolean, default: false },
  followUps: [{
    date: { type: Date, default: Date.now },
    note: { type: String, required: true },
    type: { type: String, enum: ['Checkup', 'Note', 'Treatment', 'Observation', 'X-Ray', 'Procedure', 'Prescription'], default: 'Checkup' },
    status: { type: String },
    files: [{ type: String }]
  }],
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);