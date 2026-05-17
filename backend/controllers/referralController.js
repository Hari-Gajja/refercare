const Referral = require('../models/Referral');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

exports.createReferral = async (req, res) => {
  try {
    const {
      patientName,
      age,
      phoneNumber,
      issueDescription,
      urgency,
      files,
      assignedTo,
      referredByDoctorId,
    } = req.body;

    if (!referredByDoctorId) {
      return res.status(400).json({ message: 'Referring doctor is required' });
    }

    const doctor = await Doctor.findById(referredByDoctorId);
    if (!doctor) {
      return res.status(400).json({ message: 'Referring doctor not found' });
    }

    const specialist = await User.findOne({ role: 'Specialist' });
    if (!specialist) {
      return res.status(400).json({ message: 'Specialist account is not configured' });
    }

    const resolvedAssignedTo = assignedTo || specialist._id;

    const referral = await Referral.create({
      patientName,
      age,
      phoneNumber,
      issueDescription,
      urgency,
      files: files || [],
      referredByDoctorId: doctor._id,
      referredByDoctorName: doctor.name,
      referredByDoctorPhone: doctor.phone,
      assignedTo: resolvedAssignedTo,
      otpVerified: true,
    });

    res.status(201).json({ referral });
  } catch (error) {
    res.status(500).json({ message: 'Error creating referral', error: error.message });
  }
};

exports.getSpecialistReferrals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;
    const referrals = await Referral.find(filter).populate('assignedTo', 'name email');
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referrals', error: error.message });
  }
};

exports.updateReferralStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Accepted', 'In Progress', 'Completed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const referral = await Referral.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    if (referral.assignedTo && referral.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this referral' });
    }

    referral.status = status;
    await referral.save();

    res.json({ referral });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    // Handle both Cloudinary (has .path as URL) and local storage (has .path as local path)
    const fileUrls = req.files.map((file) => file.path);

    const nonCloudinary = fileUrls.find((url) => !url.startsWith('http'));
    if (nonCloudinary) {
      return res.status(500).json({ message: 'Cloudinary upload failed. Check CLOUDINARY_* env vars.' });
    }
    res.json({ fileUrls });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

exports.getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('referredByDoctorId');
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    res.json(referral);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referral', error: error.message });
  }
};

exports.addFollowUp = async (req, res) => {
  try {
    const { note, type, status, files } = req.body;
    const referral = await Referral.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    if (referral.assignedTo && referral.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add follow-up' });
    }

    referral.followUps.push({
      note,
      type: type || 'Checkup',
      status: status || referral.status,
      date: new Date(),
      files: files || [],
    });

    if (status) {
      referral.status = status;
    }

    await referral.save();
    res.json({ message: 'Follow-up added', referral });
  } catch (error) {
    res.status(500).json({ message: 'Error adding follow-up', error: error.message });
  }
};

