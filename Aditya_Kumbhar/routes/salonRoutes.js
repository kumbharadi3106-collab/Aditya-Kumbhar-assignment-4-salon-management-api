const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

const {
  getAllSalons,
  getTopSalons,
  getSalonsByCity,
  getSalonById,
  createSalon,
  updateSalon,
  deleteSalon
} = require('../controllers/salonController');

const {
  getServicesBySalon,
  createService
} = require('../controllers/serviceController');

// IMPORTANT: specific routes ("/top", "/city/:city") must be declared
// BEFORE the generic "/:id" route, otherwise Express will treat
// "top" or "city" as an :id value.

// GET /salons/top
router.get('/top', getTopSalons);

// GET /salons/city/:city
router.get('/city/:city', getSalonsByCity);

// GET /salons
router.get('/', getAllSalons);

// GET /salons/:id
router.get('/:id', getSalonById);

// POST /salons (JWT required)
router.post('/', authenticateToken, createSalon);

// PUT /salons/:id (JWT required)
router.put('/:id', authenticateToken, updateSalon);

// DELETE /salons/:id (JWT required)
router.delete('/:id', authenticateToken, deleteSalon);

// ---- Nested service routes ----

// GET /salons/:id/services
router.get('/:id/services', getServicesBySalon);

// POST /salons/:id/services (JWT required)
router.post('/:id/services', authenticateToken, createService);

module.exports = router;
