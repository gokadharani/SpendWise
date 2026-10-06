const prisma = require('../prisma');

// Helper to validate YYYY-MM format
const isValidMonthFormat = (monthStr) => {
  return /^\d{4}-\d{2}$/.test(monthStr);
};

// Helper to get start and end dates for a given YYYY-MM month
const getMonthDateRange = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
  // End date is the first day of the next month
  let nextYear = parseInt(year, 10);
  let nextMonth = parseInt(month, 10) + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }
  const nextMonthStr = nextMonth.toString().padStart(2, '0');
  const endDate = new Date(`${nextYear}-${nextMonthStr}-01T00:00:00.000Z`);
  return { startDate, endDate };
};

// Helper to calculate spent and add calculated fields to a budget
const calculateBudgetDetails = async (budget, userId) => {
  const { startDate, endDate } = getMonthDateRange(budget.month);

  const aggregate = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      userId,
      type: 'Expense',
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const spent = aggregate._sum.amount ? aggregate._sum.amount.toNumber() : 0;
  const amount = budget.amount.toNumber();
  const remaining = amount - spent;
  const percentage = amount > 0 ? Number(((spent / amount) * 100).toFixed(2)) : 0;

  return {
    id: budget.id,
    amount,
    month: budget.month,
    spent,
    remaining,
    percentage,
  };
};

const createBudget = async (req, res) => {
  try {
    const { amount, month } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    if (!month || !isValidMonthFormat(month)) {
      return res.status(400).json({ success: false, message: 'Month must be in YYYY-MM format' });
    }

    const existingBudget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (existingBudget) {
      return res.status(409).json({ success: false, message: 'Budget already exists for this month' });
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        amount,
        month,
      },
    });

    res.status(201).json({
      success: true,
      budget: {
        id: budget.id,
        amount: budget.amount.toNumber(),
        month: budget.month,
      },
    });
  } catch (error) {
    console.error('Error in createBudget:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;

    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { month: 'desc' },
    });

    const budgetsWithDetails = await Promise.all(
      budgets.map((budget) => calculateBudgetDetails(budget, userId))
    );

    res.status(200).json({
      success: true,
      budgets: budgetsWithDetails,
    });
  } catch (error) {
    console.error('Error in getBudgets:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBudget = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user.id;

    if (!isValidMonthFormat(month)) {
      return res.status(400).json({ success: false, message: 'Month must be in YYYY-MM format' });
    }

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const budgetWithDetails = await calculateBudgetDetails(budget, userId);

    res.status(200).json({
      success: true,
      budget: budgetWithDetails,
    });
  } catch (error) {
    console.error('Error in getBudget:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user.id;
    const { amount } = req.body;

    if (!isValidMonthFormat(month)) {
      return res.status(400).json({ success: false, message: 'Month must be in YYYY-MM format' });
    }

    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const existingBudget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (!existingBudget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const updatedBudget = await prisma.budget.update({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
      data: {
        amount,
      },
    });

    const budgetWithDetails = await calculateBudgetDetails(updatedBudget, userId);

    res.status(200).json({
      success: true,
      budget: budgetWithDetails,
    });
  } catch (error) {
    console.error('Error in updateBudget:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user.id;

    if (!isValidMonthFormat(month)) {
      return res.status(400).json({ success: false, message: 'Month must be in YYYY-MM format' });
    }

    const existingBudget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (!existingBudget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    await prisma.budget.delete({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteBudget:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
};
