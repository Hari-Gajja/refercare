const Feedback = require('../models/Feedback');
const Referral = require('../models/Referral');

exports.addFeedback = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { feedbackText, files } = req.body;

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    if (referral.status !== 'Completed') {
      return res.status(400).json({ message: 'Referral must be completed before adding feedback' });
    }
    if (referral.assignedTo && referral.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned specialist can add feedback' });
    }

    const feedback = await Feedback.create({
      referral: referralId,
      specialist: req.user._id,
      feedbackText,
      files: files || [],
    });

    res.status(201).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Error adding feedback', error: error.message });
  }
};