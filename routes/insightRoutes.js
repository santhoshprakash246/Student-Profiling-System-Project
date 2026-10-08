const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Class-level dashboard insights (Faculty only)
router.get('/', authenticateToken, requireRole('faculty'), insightController.getInsights);

module.exports = router;
