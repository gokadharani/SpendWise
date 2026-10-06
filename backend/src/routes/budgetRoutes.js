const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');

const router = express.Router();

// All budget routes are protected
router.use(protect);

router.route('/')
  .post(createBudget)
  .get(getBudgets);

router.route('/:month')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
