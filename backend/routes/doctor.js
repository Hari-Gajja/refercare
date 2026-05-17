const express = require('express');
const router = express.Router();
const { protect, role } = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

router.get('/public', doctorController.listDoctors);
router.get('/', protect, role('Specialist'), doctorController.listDoctors);
router.post('/', protect, role('Specialist'), doctorController.createDoctor);

module.exports = router;
