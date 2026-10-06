const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getSummary,
  getCategories,
  getTrends,
  getTypes,
} = require('../controllers/analyticsController');

const router = express.Router();

// All analytics routes are protected
router.use(protect);

router.get('/summary', getSummary);
router.get('/categories', getCategories);
router.get('/trends', getTrends);
router.get('/types', getTypes);

module.exports = router;
