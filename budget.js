// ============================================================================
// STAGE 6: MONTHLY BUDGET PLANNER
// ============================================================================

/**
 * Calculates and updates all Monthly Budget Planner metrics,
 * progress bar width, alert colors, and threshold warning messages.
 */
function calculateBudget() {
  const spentThisMonth = (typeof calculateMonthlyExpenses === 'function') ? calculateMonthlyExpenses() : 0;

  if (typeof targetBudgetDisplay !== 'undefined' && targetBudgetDisplay) targetBudgetDisplay.textContent = formatCurrency(monthlyBudget);
  if (typeof budgetSpentDisplay !== 'undefined' && budgetSpentDisplay) budgetSpentDisplay.textContent = formatCurrency(spentThisMonth);

  // Case: No budget set or budget is 0
  if (!monthlyBudget || monthlyBudget <= 0) {
    if (typeof budgetRemainingDisplay !== 'undefined' && budgetRemainingDisplay) budgetRemainingDisplay.textContent = '₹0.00';
    if (typeof budgetPercentDisplay !== 'undefined' && budgetPercentDisplay) budgetPercentDisplay.textContent = '0%';
    if (typeof budgetProgressFill !== 'undefined' && budgetProgressFill) {
      budgetProgressFill.style.width = '0%';
      budgetProgressFill.className = 'budget-progress-bar-fill';
    }
    if (typeof budgetWarningAlert !== 'undefined' && budgetWarningAlert) budgetWarningAlert.classList.add('hidden');
    return;
  }

  // Budget is configured
  const remaining = Math.max(0, monthlyBudget - spentThisMonth);
  const usedPercentage = Math.round((spentThisMonth / monthlyBudget) * 100);

  if (typeof budgetRemainingDisplay !== 'undefined' && budgetRemainingDisplay) budgetRemainingDisplay.textContent = formatCurrency(remaining);
  if (typeof budgetPercentDisplay !== 'undefined' && budgetPercentDisplay) budgetPercentDisplay.textContent = usedPercentage + '%';

  // Visual progress bar fill is clamped to 0-100% so it never overflows its container
  const visualFill = Math.min(Math.max(usedPercentage, 0), 100);
  if (typeof budgetProgressFill !== 'undefined' && budgetProgressFill) {
    budgetProgressFill.style.width = visualFill + '%';

    // Apply color class based on threshold
    if (usedPercentage >= 100) {
      budgetProgressFill.className = 'budget-progress-bar-fill danger';
    } else if (usedPercentage >= 80) {
      budgetProgressFill.className = 'budget-progress-bar-fill warning';
    } else {
      budgetProgressFill.className = 'budget-progress-bar-fill';
    }
  }

  // Threshold Warning Banner (>80% or >=100%)
  if (typeof budgetWarningAlert !== 'undefined' && budgetWarningAlert) {
    if (usedPercentage >= 100) {
      budgetWarningAlert.classList.remove('hidden');
      budgetWarningAlert.classList.remove('alert-warning');
      budgetWarningAlert.classList.add('alert-danger');
      if (typeof budgetWarningText !== 'undefined' && budgetWarningText) {
        const overSpent = spentThisMonth - monthlyBudget;
        budgetWarningText.textContent = 'Alert: You have exceeded your monthly budget by ' + formatCurrency(overSpent) + ' (' + usedPercentage + '% used)!';
      }
    } else if (usedPercentage >= 80) {
      budgetWarningAlert.classList.remove('hidden');
      budgetWarningAlert.classList.remove('alert-danger');
      budgetWarningAlert.classList.add('alert-warning');
      if (typeof budgetWarningText !== 'undefined' && budgetWarningText) {
        budgetWarningText.textContent = 'Warning: You have used ' + usedPercentage + '% of your monthly budget!';
      }
    } else {
      budgetWarningAlert.classList.add('hidden');
      budgetWarningAlert.classList.remove('alert-warning', 'alert-danger');
    }
  }
}

/**
 * Handles the submit event of the Set Monthly Budget form.
 * 
 * @param {Event} event
 */
function handleSetBudget(event) {
  event.preventDefault();
  if (typeof monthlyBudgetInput === 'undefined' || !monthlyBudgetInput) return;

  const value = parseFloat(monthlyBudgetInput.value.trim());
  if (isNaN(value) || value < 0) {
    showToast('Please enter a valid positive budget amount.', 'danger');
    return;
  }

  monthlyBudget = value;
  if (typeof saveBudget === 'function') saveBudget();
  calculateBudget();
  showToast('Monthly budget set to ' + formatCurrency(monthlyBudget), 'success');
}
