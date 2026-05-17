const Doctor = require('../models/Doctor');

exports.listDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Doctor name and phone are required' });
    }

    const doctor = await Doctor.create({ name: name.trim(), phone: phone.trim() });
    res.status(201).json({ doctor });
  } catch (error) {
    res.status(500).json({ message: 'Error creating doctor', error: error.message });
  }
};
