const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/stats', protect, dashboardController.getStats);

module.exports = router;
