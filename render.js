// ============================================================================
// STAGE 8: RENDER EXPENSES (DISPLAY FUNCTION) & FORMATTING
// ============================================================================

/**
 * Formats a numeric amount into Indian Rupee currency format (e.g. ₹450.00).
 * Uses JavaScript's built-in Intl.NumberFormat.
 * 
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Converts a "YYYY-MM-DD" date string into a user-friendly string like "15 Sep 2026".
 * 
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  // Note: Month is 0-indexed in the Date constructor (0 = January, 8 = September)
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Maps a category name to a corresponding emoji icon for visual appeal.
 * 
 * @param {string} category
 * @returns {string} emoji
 */
function getCategoryEmoji(category) {
  const emojis = {
    Food: '🍔',
    Travel: '✈️',
    Shopping: '🛍️',
    Bills: '💡',
    Entertainment: '🎬',
    Health: '💊',
    Education: '📚',
    Other: '✨'
  };
  return emojis[category] || '🏷️';
}

/**
 * Maps a payment method to an appropriate FontAwesome icon.
 * 
 * @param {string} method
 * @returns {string} HTML icon string
 */
function getPaymentIcon(method) {
  const icons = {
    UPI: '<i class="fa-solid fa-mobile-screen"></i>',
    Cash: '<i class="fa-solid fa-money-bill-wave"></i>',
    'Debit Card': '<i class="fa-solid fa-credit-card"></i>',
    'Credit Card': '<i class="fa-regular fa-credit-card"></i>',
    Other: '<i class="fa-solid fa-wallet"></i>'
  };
  return icons[method] || '<i class="fa-solid fa-wallet"></i>';
}

/**
 * Visually highlights the item currently open in Edit Mode.
 * 
 * @param {string|null} id
 */
function highlightEditingRow(id) {
  const list = document.getElementById('expensesList');
  if (!list) return;
  const rows = list.querySelectorAll('.transaction-item');
  rows.forEach(item => {
    if (id && item.getAttribute('data-id') === id) {
      item.classList.add('row-editing');
    } else {
      item.classList.remove('row-editing');
    }
  });
}

/**
 * Basic HTML escaping helper to prevent any script injection in text inputs
 * 
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Separate rendering function responsible for updating the DOM table/cards.
 * Re-rendering from data (the `expenses` array) ensures single source of truth.
 */
function renderExpenses() {
  // Always update summary dashboard statistics from full expenses array
  if (typeof updateDashboard === 'function') updateDashboard();
  if (typeof updateCategoryChart === 'function') updateCategoryChart();
  if (typeof updateTrendChart === 'function') updateTrendChart();
  if (typeof updatePaymentChart === 'function') updatePaymentChart();

  // Ensure Month filter options reflect current expense dates
  if (typeof checkAndSyncMonthFilter === 'function') checkAndSyncMonthFilter();

  // Obtain filtered and sorted copy of expenses
  const displayedExpenses = (typeof getFilteredAndSortedExpenses === 'function') 
      ? getFilteredAndSortedExpenses() 
      : expenses;

  // Calculate total amount of currently displayed expenses (unaffected by sort order)
  const displayedTotal = (typeof calculateFilteredTotal === 'function') 
      ? calculateFilteredTotal(displayedExpenses) 
      : 0;

  // Update transaction count badge to reflect currently displayed/filtered results
  if (typeof filteredCountBadge !== 'undefined' && filteredCountBadge) {
    filteredCountBadge.textContent = displayedExpenses.length.toString();
  }

  // Update total amount display for currently displayed expenses
  if (typeof filteredTotalAmount !== 'undefined' && filteredTotalAmount) {
    filteredTotalAmount.textContent = formatCurrency(displayedTotal);
  }

  const listContainer = document.getElementById('expensesListContainer');
  const expensesList = document.getElementById('expensesList');

  // Case 1: No expenses to display
  if (displayedExpenses.length === 0) {
    if (typeof emptyState !== 'undefined' && emptyState) emptyState.classList.remove('hidden');
    if (listContainer) listContainer.classList.add('hidden');
    if (expensesList) expensesList.innerHTML = '';

    if (typeof emptyStateDesc !== 'undefined' && emptyStateDesc) {
      if (expenses.length === 0) {
        emptyStateDesc.textContent = "You haven't recorded any expenses yet. Use the form on the left to add your first expense!";
      } else {
        emptyStateDesc.textContent = "No expenses match your search or filter criteria. Click 'Reset' to view all expenses.";
      }
    }
    return;
  }

  // Case 2: Expenses exist -> Hide Empty State, Show List
  if (typeof emptyState !== 'undefined' && emptyState) emptyState.classList.add('hidden');
  if (listContainer) listContainer.classList.remove('hidden');

  if (expensesList) {
    expensesList.innerHTML = '';
  }

  // Group by date
  const grouped = {};
  const orderedDates = [];
  displayedExpenses.forEach(exp => {
    const d = exp.date || 'Unknown';
    if (!grouped[d]) {
      grouped[d] = [];
      orderedDates.push(d);
    }
    grouped[d].push(exp);
  });

  // Helper for human readable date
  const getHumanDate = (dateStr) => {
    if (dateStr === 'Unknown') return dateStr;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return formatDate(dateStr);
  };

  // Render each date group
  orderedDates.forEach(dateStr => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'transaction-date-group';

    const header = document.createElement('h4');
    header.className = 'transaction-date-header';
    header.textContent = getHumanDate(dateStr);
    groupDiv.appendChild(header);

    const itemsList = document.createElement('div');
    itemsList.className = 'transaction-items';

    grouped[dateStr].forEach(expense => {
      const item = document.createElement('div');
      item.className = 'transaction-item';
      item.setAttribute('data-id', expense.id);

      const displayDesc = expense.description
        ? escapeHtml(expense.description)
        : '<span class="text-muted">—</span>';

      item.innerHTML = `
        <div class="transaction-left">
          <div class="transaction-icon cat-${expense.category}">
            ${getCategoryEmoji(expense.category)}
          </div>
          <div class="transaction-info">
            <div class="transaction-desc">${displayDesc}</div>
            <div class="transaction-meta">
              <span>${expense.category}</span>
              <span class="meta-dot">•</span>
              <span>${getPaymentIcon(expense.paymentMethod)} ${expense.paymentMethod}</span>
            </div>
          </div>
        </div>
        <div class="transaction-right">
          <div class="transaction-amount">${formatCurrency(expense.amount)}</div>
          <i class="fa-solid fa-chevron-right transaction-chevron"></i>
        </div>
      `;

      // Highlight row if currently being edited
      if (typeof editExpenseIdInput !== 'undefined' && editExpenseIdInput && editExpenseIdInput.value === expense.id) {
        item.classList.add('row-editing');
      }

      // Attach click listener to open details modal
      item.addEventListener('click', () => {
        if (typeof openTransactionDetails === 'function') {
          openTransactionDetails(expense.id);
        }
      });

      itemsList.appendChild(item);
    });

    groupDiv.appendChild(itemsList);
    if (expensesList) {
      expensesList.appendChild(groupDiv);
    }
  });
}
