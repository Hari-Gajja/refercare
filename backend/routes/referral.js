const express = require('express');
const router = express.Router();
const { protect, role } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const referralController = require('../controllers/referralController');
const feedbackController = require('../controllers/feedbackController');

router.post('/create', referralController.createReferral);

const requireCloudinaryUpload = (req, res, next) => {
	if (!upload) {
		return res.status(500).json({ message: 'Cloudinary not configured. Set CLOUDINARY_* env vars.' });
	}
	return upload.array('files', 5)(req, res, next);
};

router.post('/upload', protect, role('Specialist'), requireCloudinaryUpload, referralController.uploadFiles);

router.get('/specialist', protect, role('Specialist'), referralController.getSpecialistReferrals);

router.put('/status/:id', protect, role('Specialist'), referralController.updateReferralStatus);

router.post('/feedback/:referralId', protect, role('Specialist'), feedbackController.addFeedback);

router.get('/detail/:id', protect, role('Specialist'), referralController.getReferralById);
router.post('/followup/:id', protect, role('Specialist'), referralController.addFollowUp);


module.exports = router;