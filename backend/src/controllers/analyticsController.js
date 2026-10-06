const prisma = require('../prisma');

// Helper to build date filter
const buildDateFilter = (from, to) => {
  const dateFilter = {};
  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      dateFilter.gte = fromDate;
    }
  }
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      // Set to end of day to include the entire 'to' date safely if needed,
      // but usually 'to' should just be parsed directly.
      // If the client passes "2026-10-31", new Date() is midnight. So it won't include transactions at noon.
      // Assuming frontend passes strict bounds, or we adjust to end of day.
      // Let's add 23:59:59.999 to the 'to' date if it doesn't have time.
      const toDateEnd = new Date(to);
      if (!to.includes('T')) {
        toDateEnd.setUTCHours(23, 59, 59, 999);
      }
      dateFilter.lte = toDateEnd;
    }
  }
  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
};

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const dateFilter = buildDateFilter(from, to);
    if (from && to && new Date(from) > new Date(to)) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }

    const where = { userId };
    if (dateFilter) where.date = dateFilter;

    const group = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
      },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;
    let totalInvestments = 0;

    group.forEach((g) => {
      const sum = g._sum.amount ? g._sum.amount.toNumber() : 0;
      if (g.type === 'Income') totalIncome += sum;
      else if (g.type === 'Expense') totalExpenses += sum;
      else if (g.type === 'Savings') totalSavings += sum;
      else if (g.type === 'Investment') totalInvestments += sum;
    });

    const availableBalance = totalIncome - totalExpenses - totalSavings - totalInvestments;

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        totalSavings,
        totalInvestments,
        availableBalance,
      },
    });
  } catch (error) {
    console.error('Error in getSummary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/analytics/categories
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const dateFilter = buildDateFilter(from, to);
    if (from && to && new Date(from) > new Date(to)) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }

    const where = {
      userId,
      type: 'Expense',
    };
    if (dateFilter) where.date = dateFilter;

    const group = await prisma.transaction.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const categories = group.map((g) => ({
      category: g.category,
      amount: g._sum.amount ? g._sum.amount.toNumber() : 0,
    }));

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/analytics/trends
const getTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const dateFilter = buildDateFilter(from, to);
    if (from && to && new Date(from) > new Date(to)) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }

    const where = {
      userId,
      type: 'Expense',
    };
    if (dateFilter) where.date = dateFilter;

    // Fetch transactions and group in memory to ensure consistent YYYY-MM formatting
    // Grouping by date truncation is DB-specific (e.g. date_trunc in Postgres), memory grouping is safer here for standard JS.
    const expenses = await prisma.transaction.findMany({
      where,
      select: {
        amount: true,
        date: true,
      },
    });

    const monthlyData = {};

    expenses.forEach((tx) => {
      const d = tx.date;
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += tx.amount.toNumber();
    });

    const trends = Object.keys(monthlyData).map(monthKey => ({
      month: monthKey,
      amount: monthlyData[monthKey]
    }));

    // Sort chronologically ascending
    trends.sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      success: true,
      trends,
    });
  } catch (error) {
    console.error('Error in getTrends:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/analytics/types
const getTypes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const dateFilter = buildDateFilter(from, to);
    if (from && to && new Date(from) > new Date(to)) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }

    const where = { userId };
    if (dateFilter) where.date = dateFilter;

    const group = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
      },
    });

    const typeMap = {
      'Income': 0,
      'Expense': 0,
      'Savings': 0,
      'Investment': 0,
    };

    group.forEach((g) => {
      typeMap[g.type] = g._sum.amount ? g._sum.amount.toNumber() : 0;
    });

    // Predictable order
    const types = [
      { type: 'Income', amount: typeMap['Income'] },
      { type: 'Expense', amount: typeMap['Expense'] },
      { type: 'Savings', amount: typeMap['Savings'] },
      { type: 'Investment', amount: typeMap['Investment'] },
    ];

    res.status(200).json({
      success: true,
      types,
    });
  } catch (error) {
    console.error('Error in getTypes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getSummary,
  getCategories,
  getTrends,
  getTypes,
};
