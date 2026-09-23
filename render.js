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
 * Visually highlights the table row currently open in Edit Mode.
 * 
 * @param {string|null} id
 */
function highlightEditingRow(id) {
  if (!typeof expensesTableBody !== 'undefined' && !expensesTableBody) return;
  const rows = expensesTableBody.querySelectorAll('tr');
  rows.forEach(tr => {
    if (id && tr.getAttribute('data-id') === id) {
      tr.classList.add('row-editing');
    } else {
      tr.classList.remove('row-editing');
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

  const tableContainer = (typeof expensesTable !== 'undefined' && expensesTable) ? expensesTable.closest('.table-responsive') : null;

  // Case 1: No expenses to display
  if (displayedExpenses.length === 0) {
    if (typeof emptyState !== 'undefined' && emptyState) emptyState.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (typeof expensesTable !== 'undefined' && expensesTable) expensesTable.classList.add('hidden');
    if (typeof expensesTableBody !== 'undefined' && expensesTableBody) expensesTableBody.innerHTML = '';

    if (typeof emptyStateDesc !== 'undefined' && emptyStateDesc) {
      if (expenses.length === 0) {
        emptyStateDesc.textContent = "You haven't recorded any expenses yet. Use the form on the left to add your first expense!";
      } else {
        emptyStateDesc.textContent = "No expenses match your search or filter criteria. Click 'Reset' to view all expenses.";
      }
    }
    return;
  }

  // Case 2: Expenses exist -> Hide Empty State, Show Table
  if (typeof emptyState !== 'undefined' && emptyState) emptyState.classList.add('hidden');
  if (tableContainer) tableContainer.classList.remove('hidden');
  if (typeof expensesTable !== 'undefined' && expensesTable) expensesTable.classList.remove('hidden');

  // Clear previous rows
  if (typeof expensesTableBody !== 'undefined' && expensesTableBody) {
    expensesTableBody.innerHTML = '';
  }

  // Loop through each displayed expense object and generate a table row <tr>
  displayedExpenses.forEach((expense) => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', expense.id);

    // Escape HTML description safely to avoid XSS
    const displayDesc = expense.description
      ? escapeHtml(expense.description)
      : '<span class="text-muted">—</span>';

    tr.innerHTML = `
      <!-- Category Pill -->
      <td>
        <span class="category-pill cat-${expense.category}">
          <span>${getCategoryEmoji(expense.category)}</span>
          <span>${expense.category}</span>
        </span>
      </td>

      <!-- Description / Note -->
      <td>
        <span class="expense-desc-text">${displayDesc}</span>
      </td>

      <!-- Date -->
      <td>
        <span class="expense-date-text">${formatDate(expense.date)}</span>
      </td>

      <!-- Payment Method Badge -->
      <td>
        <span class="payment-badge">
          ${getPaymentIcon(expense.paymentMethod)}
          <span>${expense.paymentMethod}</span>
        </span>
      </td>

      <!-- Amount -->
      <td class="text-right">
        <span class="amount-cell">${formatCurrency(expense.amount)}</span>
      </td>

      <!-- Actions: Edit & Delete (Stage 3) -->
      <td class="text-center">
        <div class="action-buttons">
          <button type="button" class="btn btn-icon btn-edit" title="Edit Expense" data-id="${expense.id}" aria-label="Edit expense">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button type="button" class="btn btn-icon btn-delete" title="Delete Expense" data-id="${expense.id}" aria-label="Delete expense">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;

    // Attach event listeners to action buttons
    const editBtn = tr.querySelector('.btn-edit');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
          if (typeof startEdit === 'function') startEdit(expense.id);
      });
    }
    const deleteBtn = tr.querySelector('.btn-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
          if (typeof promptDelete === 'function') promptDelete(expense.id);
      });
    }

    // Highlight row if currently being edited
    if (typeof editExpenseIdInput !== 'undefined' && editExpenseIdInput && editExpenseIdInput.value === expense.id) {
      tr.classList.add('row-editing');
    }

    // Append this row to the table body
    if (typeof expensesTableBody !== 'undefined' && expensesTableBody) {
      expensesTableBody.appendChild(tr);
    }
  });
}
