// ============================================================================
// STAGE 6: DASHBOARD METRICS
// ============================================================================

/**
 * Calculates the total sum of all saved expenses (lifetime).
 * Always calculates from the master `expenses` array.
 * 
 * @returns {number}
 */
function calculateTotalExpenses() {
  return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
}

/**
 * Calculates the total spending for today's date.
 * 
 * @returns {number}
 */
function calculateTodayExpenses() {
  const todayStr = getTodayDateString();
  return expenses.reduce((sum, exp) => {
    return exp.date === todayStr ? sum + (Number(exp.amount) || 0) : sum;
  }, 0);
}

/**
 * Calculates the total spending for yesterday's date.
 * Always calculates from the master `expenses` array.
 * 
 * @returns {number}
 */
function calculateYesterdayExpenses() {
  const yesterdayStr = getYesterdayDateString();
  return expenses.reduce((sum, exp) => {
    return exp.date === yesterdayStr ? sum + (Number(exp.amount) || 0) : sum;
  }, 0);
}

/**
 * Updates the Yesterday and Today daily summary cards above the transaction table.
 * Shows dynamic actual dates and formatted totals from saved expenses.
 */
function updateDailySummaryCards() {
  const yesterdayStr = getYesterdayDateString();
  const todayStr = getTodayDateString();

  const yesterdayTotal = calculateYesterdayExpenses();
  const todayTotal = calculateTodayExpenses();

  if (typeof yesterdayDateLabel !== 'undefined' && yesterdayDateLabel) {
    yesterdayDateLabel.textContent = formatDate(yesterdayStr);
  }
  if (typeof yesterdayTotalDisplay !== 'undefined' && yesterdayTotalDisplay) {
    yesterdayTotalDisplay.textContent = formatCurrency(yesterdayTotal);
  }

  if (typeof todaySummaryDateLabel !== 'undefined' && todaySummaryDateLabel) {
    todaySummaryDateLabel.textContent = formatDate(todayStr);
  }
  if (typeof todaySummaryTotalDisplay !== 'undefined' && todaySummaryTotalDisplay) {
    todaySummaryTotalDisplay.textContent = formatCurrency(todayTotal);
  }
}

/**
 * Calculates the total spending belonging to the current month and year.
 * 
 * @returns {number}
 */
function calculateMonthlyExpenses() {
  const currentYearMonth = getTodayDateString().substring(0, 7);
  return expenses.reduce((sum, exp) => {
    return (exp.date && exp.date.startsWith(currentYearMonth))
      ? sum + (Number(exp.amount) || 0)
      : sum;
  }, 0);
}

/**
 * Calculates the total spending belonging to the previous calendar month.
 * Always calculates from the master `expenses` array using the saved expense date field.
 * Correctly handles January rollover (previous month is December of previous year).
 * 
 * @returns {number}
 */
function calculateLastMonthExpenses() {
  const prevYearMonth = getPreviousYearMonthString();
  return expenses.reduce((sum, exp) => {
    return (exp.date && exp.date.startsWith(prevYearMonth))
      ? sum + (Number(exp.amount) || 0)
      : sum;
  }, 0);
}

/**
 * Updates the Last Month and This Month monthly summary cards in the dashboard.
 * Shows dynamic calendar month names (e.g. "August 2026") and formatted totals.
 */
function updateMonthlySummaryCards() {
  const prevYearMonth = getPreviousYearMonthString();
  const currentYearMonth = getCurrentYearMonthString();

  const lastMonthTotal = calculateLastMonthExpenses();
  const thisMonthTotal = calculateMonthlyExpenses();

  if (typeof lastMonthDateLabel !== 'undefined' && lastMonthDateLabel) {
    lastMonthDateLabel.textContent = formatMonthYear(prevYearMonth);
  }
  if (typeof lastMonthTotalDisplay !== 'undefined' && lastMonthTotalDisplay) {
    lastMonthTotalDisplay.textContent = formatCurrency(lastMonthTotal);
  }

  if (typeof thisMonthSummaryDateLabel !== 'undefined' && thisMonthSummaryDateLabel) {
    thisMonthSummaryDateLabel.textContent = formatMonthYear(currentYearMonth);
  }
  if (typeof thisMonthSummaryTotalDisplay !== 'undefined' && thisMonthSummaryTotalDisplay) {
    thisMonthSummaryTotalDisplay.textContent = formatCurrency(thisMonthTotal);
  }
}

/**
 * Determines which category has the highest total spending across all saved expenses.
 * 
 * @returns {{ category: string, amount: number }}
 */
function calculateTopCategory() {
  if (expenses.length === 0) {
    return { category: 'None', amount: 0 };
  }

  const categoryTotals = {};
  expenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    const amt = Number(exp.amount) || 0;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  let topCat = 'None';
  let maxSpent = 0;
  for (const cat in categoryTotals) {
    if (categoryTotals[cat] > maxSpent) {
      maxSpent = categoryTotals[cat];
      topCat = cat;
    }
  }

  return { category: topCat, amount: maxSpent };
}

/**
 * Updates all Dashboard KPI summary cards and the Monthly Budget Planner.
 * Computes strictly from the actual saved `expenses` array.
 */
function updateDashboard() {
  const total = calculateTotalExpenses();
  const today = calculateTodayExpenses();
  const month = calculateMonthlyExpenses();
  const top = calculateTopCategory();

  if (typeof totalExpensesDisplay !== 'undefined' && totalExpensesDisplay) totalExpensesDisplay.textContent = formatCurrency(total);
  if (typeof todayExpensesDisplay !== 'undefined' && todayExpensesDisplay) todayExpensesDisplay.textContent = formatCurrency(today);
  if (typeof monthExpensesDisplay !== 'undefined' && monthExpensesDisplay) monthExpensesDisplay.textContent = formatCurrency(month);
  if (typeof transactionCountDisplay !== 'undefined' && transactionCountDisplay) transactionCountDisplay.textContent = expenses.length.toString();

  if (typeof topCategoryDisplay !== 'undefined' && topCategoryDisplay) {
    topCategoryDisplay.textContent = top.category;
  }
  if (typeof topCategoryAmount !== 'undefined' && topCategoryAmount) {
    topCategoryAmount.textContent = top.amount > 0 ? formatCurrency(top.amount) + ' spent' : '\u20B90.00 spent';
  }

  // Update budget calculations
  if (typeof calculateBudget === 'function') calculateBudget();

  // Update yesterday & today daily summary cards above the table
  updateDailySummaryCards();

  // Update last month & this month monthly summary cards
  updateMonthlySummaryCards();
}

// Backward-compatibility alias
const updateDashboardStats = updateDashboard;
