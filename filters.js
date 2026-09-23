// ============================================================================
// STAGE 5: SEARCH, FILTER & SORT
// ============================================================================

let cachedMonthFilterKeys = '';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Formats a "YYYY-MM" string into a user-friendly label like "August 2026".
 * 
 * @param {string} yearMonthStr - e.g. "2026-08"
 * @returns {string} e.g. "August 2026"
 */
function formatMonthYear(yearMonthStr) {
  if (!yearMonthStr) return '';
  const parts = yearMonthStr.split('-');
  if (parts.length !== 2) return yearMonthStr;
  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;
  if (monthIndex >= 0 && monthIndex < 12 && !isNaN(year)) {
    return MONTH_NAMES[monthIndex] + ' ' + year;
  }
  const dateObj = new Date(year, monthIndex, 1);
  return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Dynamically populates the Month filter dropdown based on distinct dates in `expenses`.
 * Displays months in readable "Month YYYY" format (e.g. "January 2026", "February 2026").
 * Preserves the currently selected month if it still exists.
 */
function populateMonthFilter() {
  if (typeof filterMonth === 'undefined' || !filterMonth) return;

  const currentSelection = filterMonth.value || 'ALL';

  // Collect unique YYYY-MM keys from existing expense dates
  const monthSet = new Set();
  expenses.forEach((exp) => {
    if (exp.date && typeof exp.date === 'string') {
      const yearMonth = exp.date.substring(0, 7);
      if (/^\d{4}-\d{2}$/.test(yearMonth)) {
        monthSet.add(yearMonth);
      }
    }
  });

  // Sort months chronologically ascending (e.g. January 2026, February 2026, March 2026...)
  const sortedMonths = Array.from(monthSet).sort((a, b) => a.localeCompare(b));

  // Build options: Default "All Months" first
  filterMonth.innerHTML = '<option value="ALL">All Months</option>';

  sortedMonths.forEach((yearMonth) => {
    const label = formatMonthYear(yearMonth);
    const option = document.createElement('option');
    option.value = yearMonth;
    option.textContent = label;
    filterMonth.appendChild(option);
  });

  // Restore selection if still present in options, otherwise reset to ALL
  const hasSelection = sortedMonths.includes(currentSelection);
  filterMonth.value = hasSelection ? currentSelection : 'ALL';
  filterState.month = filterMonth.value;
}

/**
 * Checks if unique months in `expenses` changed and re-populates filterMonth if needed.
 */
function checkAndSyncMonthFilter() {
  const currentKeys = expenses.map(e => (e.date ? e.date.substring(0, 7) : '')).filter(Boolean).sort().join(',');
  if (currentKeys !== cachedMonthFilterKeys) {
    cachedMonthFilterKeys = currentKeys;
    populateMonthFilter();
  }
}

/**
 * Computes and returns a filtered and sorted copy of the `expenses` array.
 * The original `expenses` array is never mutated.
 * 
 * @returns {Array} Filtered and sorted expenses
 */
function getFilteredAndSortedExpenses() {
  const searchTerm = (typeof searchInput !== 'undefined' && searchInput) ? searchInput.value.trim().toLowerCase() : '';
  const selectedCategory = (typeof filterCategory !== 'undefined' && filterCategory) ? filterCategory.value : 'ALL';
  const selectedPayment = (typeof filterPayment !== 'undefined' && filterPayment) ? filterPayment.value : 'ALL';
  const selectedMonth = (typeof filterMonth !== 'undefined' && filterMonth) ? filterMonth.value : 'ALL';
  const selectedDate = (typeof filterDate !== 'undefined' && filterDate) ? filterDate.value : '';
  const selectedSort = (typeof sortBy !== 'undefined' && sortBy) ? sortBy.value : 'date-desc';

  // Sync underlying filter state
  filterState.search = searchTerm;
  filterState.category = selectedCategory;
  filterState.payment = selectedPayment;
  filterState.month = selectedMonth;
  filterState.date = selectedDate;
  filterState.sortBy = selectedSort;

  // 1. Filter expenses matching all criteria (AND combination)
  const filtered = expenses.filter((expense) => {
    // Description search (case-insensitive substring match)
    if (searchTerm) {
      const desc = (expense.description || '').toLowerCase();
      if (!desc.includes(searchTerm)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'ALL') {
      if (expense.category !== selectedCategory) {
        return false;
      }
    }

    // Payment method filter
    if (selectedPayment && selectedPayment !== 'ALL') {
      if (expense.paymentMethod !== selectedPayment) {
        return false;
      }
    }

    // Month filter (matches YYYY-MM or formatted "Month YYYY")
    if (selectedMonth && selectedMonth !== 'ALL') {
      if (!expense.date) return false;
      const expenseMonth = expense.date.substring(0, 7);
      const isMatch = (expenseMonth === selectedMonth) ||
        (formatMonthYear(expenseMonth) === selectedMonth);
      if (!isMatch) {
        return false;
      }
    }

    // Specific date filter (YYYY-MM-DD)
    if (selectedDate) {
      if (expense.date !== selectedDate) {
        return false;
      }
    }

    return true;
  });

  // 2. Sort the filtered results
  filtered.sort((a, b) => {
    switch (selectedSort) {
      case 'date-asc': {
        const dateDiff = a.date.localeCompare(b.date);
        if (dateDiff !== 0) return dateDiff;
        return expenses.indexOf(b) - expenses.indexOf(a);
      }
      case 'date-desc': {
        const dateDiff = b.date.localeCompare(a.date);
        if (dateDiff !== 0) return dateDiff;
        return expenses.indexOf(a) - expenses.indexOf(b);
      }
      case 'amount-asc':
        return Number(a.amount) - Number(b.amount);
      case 'amount-desc':
        return Number(b.amount) - Number(a.amount);
      default:
        return 0;
    }
  });

  return filtered;
}

/**
 * Calculates the total sum of amounts for the currently displayed/filtered expenses.
 * Sorting order does not change this total because it computes over the same set of items.
 * 
 * @param {Array} [displayedList] - Optional pre-filtered expenses array
 * @returns {number} Sum of amounts
 */
function calculateFilteredTotal(displayedList) {
  const list = Array.isArray(displayedList) ? displayedList : getFilteredAndSortedExpenses();
  return list.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
}

/**
 * Resets search input, category, payment method, date, and sorting to defaults.
 * Does NOT alter or delete stored expenses.
 * Updates both the UI controls and the underlying filter state.
 * 
 * @param {Event} [e] - Optional event object
 */
function resetFilters(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  // 1. Reset UI input elements back to defaults
  if (typeof searchInput !== 'undefined' && searchInput) {
    searchInput.value = '';
  }
  if (typeof filterCategory !== 'undefined' && filterCategory) {
    filterCategory.value = 'ALL';
    filterCategory.selectedIndex = 0;
  }
  if (typeof filterPayment !== 'undefined' && filterPayment) {
    filterPayment.value = 'ALL';
    filterPayment.selectedIndex = 0;
  }
  if (typeof filterMonth !== 'undefined' && filterMonth) {
    filterMonth.value = 'ALL';
    filterMonth.selectedIndex = 0;
  }
  if (typeof filterDate !== 'undefined' && filterDate) {
    filterDate.value = '';
  }
  if (typeof sortBy !== 'undefined' && sortBy) {
    sortBy.value = 'date-desc';
    sortBy.selectedIndex = 0;
  }

  // 2. Reset underlying filter state
  filterState.search = '';
  filterState.category = 'ALL';
  filterState.payment = 'ALL';
  filterState.month = 'ALL';
  filterState.date = '';
  filterState.sortBy = 'date-desc';

  // 3. Dispatch change and input events to notify any external observers
  if (typeof searchInput !== 'undefined' && searchInput) {
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (typeof filterCategory !== 'undefined' && filterCategory) {
    filterCategory.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (typeof filterPayment !== 'undefined' && filterPayment) {
    filterPayment.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (typeof filterMonth !== 'undefined' && filterMonth) {
    filterMonth.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (typeof filterDate !== 'undefined' && filterDate) {
    filterDate.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (typeof sortBy !== 'undefined' && sortBy) {
    sortBy.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 4. Refresh displayed expense list based on reset filters
  if (typeof renderExpenses === 'function') renderExpenses();
  if (typeof showToast === 'function') showToast('Filters cleared', 'info');
}
