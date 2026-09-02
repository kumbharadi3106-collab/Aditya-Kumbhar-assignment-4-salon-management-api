const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

const {
  getAvailableServices,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// IMPORTANT: "/available" must be declared BEFORE "/:id",
// otherwise Express will treat "available" as an :id value.

// GET /services/available
router.get('/available', getAvailableServices);

// PUT /services/:id (JWT required)
router.put('/:id', authenticateToken, updateService);

// DELETE /services/:id (JWT required)
router.delete('/:id', authenticateToken, deleteService);

module.exports = router;
