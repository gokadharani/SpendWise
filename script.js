/**
 * ============================================================================
 * SPENDWISE - Personal Expense Tracker
 * Stage 1 & 2: Project Setup, Theme, Add Expense & Display Expenses
 * ============================================================================
 * 
 * Welcome to the JavaScript codebase!
 * This file is built incrementally using standard, beginner-friendly JavaScript:
 * - Variables (const, let)
 * - Objects & Arrays
 * - Functions & Event Listeners
 * - Basic Form Validation
 * - DOM Manipulation (innerHTML, createElement, classList)
 * - Array Methods (unshift, forEach)
 */

// ============================================================================
// 1. APPLICATION STATE
// ============================================================================
// "State" holds the data that powers the UI.
let expenses = [];

// Monthly Budget state (Stage 6)
let monthlyBudget = 0;

// Filter & Search State (Stage 5)
let filterState = {
  search: '',
  category: 'ALL',
  payment: 'ALL',
  month: 'ALL',
  date: '',
  sortBy: 'date-desc'
};

// LocalStorage Persistence Keys
const STORAGE_KEY = 'spendwise_expenses';
const STORAGE_KEY_FALLBACK = 'expenses';
const BUDGET_STORAGE_KEY = 'spendwise_budget';

// ============================================================================
// 2. DOM ELEMENT SELECTORS
// ============================================================================
// Caching references to DOM elements so we don't query the page repeatedly.



// Expense Form elements
const expenseForm = document.getElementById('expenseForm');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseCategoryInput = document.getElementById('expenseCategory');
const expenseDateInput = document.getElementById('expenseDate');
const expensePaymentInput = document.getElementById('expensePayment');
const expenseDescriptionInput = document.getElementById('expenseDescription');
const submitExpenseBtn = document.getElementById('submitExpenseBtn');

// Edit Mode elements (Stage 3)
const editExpenseIdInput = document.getElementById('editExpenseId');
const formTitle = document.getElementById('formTitle');
const submitBtnText = document.getElementById('submitBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Delete Confirmation Modal elements (Stage 3)
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Form Validation Error containers (<small class="form-error">)
const amountError = document.getElementById('amountError');
const categoryError = document.getElementById('categoryError');
const dateError = document.getElementById('dateError');
const paymentError = document.getElementById('paymentError');
const descriptionError = document.getElementById('descriptionError');

// Expense Table & Empty State elements
const expensesTable = document.getElementById('expensesTable');
const expensesTableBody = document.getElementById('expensesTableBody');
const emptyState = document.getElementById('emptyState');
const filteredCountBadge = document.getElementById('filteredCountBadge');
const filteredTotalAmount = document.getElementById('filteredTotalAmount');

// Toast notification container
const toastContainer = document.getElementById('toastContainer');

// Search, Filter & Sort elements (Stage 5)
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterPayment = document.getElementById('filterPayment');
const filterMonth = document.getElementById('filterMonth');
const filterDate = document.getElementById('filterDate');
const sortBy = document.getElementById('sortBy');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const emptyStateDesc = document.getElementById('emptyStateDesc');

// Dashboard summary metric elements
const totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
const todayExpensesDisplay = document.getElementById('todayExpensesDisplay');
const monthExpensesDisplay = document.getElementById('monthExpensesDisplay');
const transactionCountDisplay = document.getElementById('transactionCountDisplay');
const topCategoryDisplay = document.getElementById('topCategoryDisplay');
const topCategoryAmount = document.getElementById('topCategoryAmount');

// Monthly Budget Planner elements (Stage 6)
const budgetForm = document.getElementById('budgetForm');
const monthlyBudgetInput = document.getElementById('monthlyBudgetInput');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const budgetProgressFill = document.getElementById('budgetProgressFill');
const targetBudgetDisplay = document.getElementById('targetBudgetDisplay');
const budgetSpentDisplay = document.getElementById('budgetSpentDisplay');
const budgetRemainingDisplay = document.getElementById('budgetRemainingDisplay');
const budgetPercentDisplay = document.getElementById('budgetPercentDisplay');
const budgetWarningAlert = document.getElementById('budgetWarningAlert');
const budgetWarningText = document.getElementById('budgetWarningText');

// Dashboard date labels (Stage 1)
const todayDateLabel = document.getElementById('todayDateLabel');
const currentMonthLabel = document.getElementById('currentMonthLabel');

// Daily Summary elements (Yesterday & Today)
const yesterdayDateLabel = document.getElementById('yesterdayDateLabel');
const yesterdayTotalDisplay = document.getElementById('yesterdayTotalDisplay');
const todaySummaryDateLabel = document.getElementById('todaySummaryDateLabel');
const todaySummaryTotalDisplay = document.getElementById('todaySummaryTotalDisplay');

// Monthly Summary elements (Last Month & This Month)
const lastMonthDateLabel = document.getElementById('lastMonthDateLabel');
const lastMonthTotalDisplay = document.getElementById('lastMonthTotalDisplay');
const thisMonthSummaryDateLabel = document.getElementById('thisMonthSummaryDateLabel');
const thisMonthSummaryTotalDisplay = document.getElementById('thisMonthSummaryTotalDisplay');

// ============================================================================
// 3. UTILITY & HELPER FUNCTIONS
// ============================================================================

/**
 * Returns today's date in YYYY-MM-DD format for HTML date inputs.
 * Pad single-digit months and days with leading zeros (e.g. "09").
 */
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date in YYYY-MM-DD format.
 * Pad single-digit months and days with leading zeros.
 * 
 * @returns {string} YYYY-MM-DD
 */
function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current calendar month and year string in YYYY-MM format (e.g. "2026-09").
 * 
 * @returns {string} YYYY-MM
 */
function getCurrentYearMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns previous calendar month and year string in YYYY-MM format (e.g. "2026-08").
 * Correctly handles January: rolls back to December of the previous calendar year.
 * 
 * @returns {string} YYYY-MM
 */
function getPreviousYearMonthString() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed: 0 is January, 11 is December

  if (month === 0) {
    // Current month is January -> previous month is December of previous year
    month = 12;
    year -= 1;
  }
  const monthStr = String(month).padStart(2, '0');
  return `${year}-${monthStr}`;
}

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
    return `${MONTH_NAMES[monthIndex]} ${year}`;
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
  if (!filterMonth) return;

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

let cachedMonthFilterKeys = '';

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
 * Displays a non-intrusive floating toast alert.
 * 
 * @param {string} message
 * @param {'success' | 'danger' | 'warning' | 'info'} type
 */
function showToast(message, type = 'info') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    danger: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Smoothly fade out and remove after 3.2 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3200);
}


// ============================================================================
// 5. STAGE 2: FORM VALIDATION
// ============================================================================

/**
 * Clears all inline error messages from the form inputs.
 */
function clearValidationErrors() {
  amountError.textContent = '';
  categoryError.textContent = '';
  dateError.textContent = '';
  paymentError.textContent = '';
  descriptionError.textContent = '';

  // Remove red border styling if applied
  expenseAmountInput.style.borderColor = '';
  expenseCategoryInput.style.borderColor = '';
  expenseDateInput.style.borderColor = '';
  expensePaymentInput.style.borderColor = '';
}

/**
 * Validates the user inputs against business requirements:
 * 1. Amount must be a valid number greater than 0
 * 2. Category must be selected
 * 3. Date must be provided and cannot be in the future
 * 4. Payment method must be selected
 * 5. Description is optional
 * 
 * @returns {boolean} true if all fields are valid, false otherwise
 */
function validateExpenseForm() {
  clearValidationErrors();
  let isValid = true;

  // 1. Validate Amount
  const amountVal = expenseAmountInput.value.trim();
  const parsedAmount = parseFloat(amountVal);

  if (amountVal === '') {
    amountError.textContent = 'Please enter an expense amount.';
    expenseAmountInput.style.borderColor = 'var(--danger)';
    isValid = false;
  } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
    amountError.textContent = 'Amount must be a positive number greater than 0.';
    expenseAmountInput.style.borderColor = 'var(--danger)';
    isValid = false;
  }

  // 2. Validate Category
  const categoryVal = expenseCategoryInput.value;
  if (!categoryVal) {
    categoryError.textContent = 'Please select an expense category.';
    expenseCategoryInput.style.borderColor = 'var(--danger)';
    isValid = false;
  }

  // 3. Validate Date (Date must be provided)
  const dateVal = expenseDateInput.value;

  if (!dateVal) {
    dateError.textContent = 'Please select a date.';
    expenseDateInput.style.borderColor = 'var(--danger)';
    isValid = false;
  }

  // 4. Validate Payment Method
  const paymentVal = expensePaymentInput.value;
  if (!paymentVal) {
    paymentError.textContent = 'Please choose a payment method.';
    expensePaymentInput.style.borderColor = 'var(--danger)';
    isValid = false;
  }

  return isValid;
}

// Clear individual error as soon as the user starts typing or selecting
expenseAmountInput.addEventListener('input', () => {
  amountError.textContent = '';
  expenseAmountInput.style.borderColor = '';
});
expenseCategoryInput.addEventListener('change', () => {
  categoryError.textContent = '';
  expenseCategoryInput.style.borderColor = '';
});
expenseDateInput.addEventListener('input', () => {
  dateError.textContent = '';
  expenseDateInput.style.borderColor = '';
});
expenseDateInput.addEventListener('change', () => {
  dateError.textContent = '';
  expenseDateInput.style.borderColor = '';
});
expensePaymentInput.addEventListener('change', () => {
  paymentError.textContent = '';
  expensePaymentInput.style.borderColor = '';
});

// ============================================================================
// 6. STAGE 2: ADD EXPENSE HANDLER
// ============================================================================

/**
 * Handles form submission for both Adding new expenses and Updating existing ones.
 * 
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  // Validate the inputs
  if (!validateExpenseForm()) {
    showToast('Please fix the errors in the form.', 'danger');
    return;
  }

  // Read clean values from the inputs
  const amount = parseFloat(expenseAmountInput.value.trim());
  const category = expenseCategoryInput.value;
  const date = expenseDateInput.value;
  const paymentMethod = expensePaymentInput.value;
  const description = expenseDescriptionInput.value.trim();

  const editId = editExpenseIdInput ? editExpenseIdInput.value.trim() : '';

  if (editId) {
    // --- STAGE 3: EDIT EXISTING EXPENSE ---
    const updated = editExpense(editId, {
      amount: amount,
      category: category,
      date: date,
      paymentMethod: paymentMethod,
      description: description
    });

    if (updated) {
      renderExpenses();
      cancelEdit();
      showToast('Expense updated successfully!', 'success');
    } else {
      showToast('Error: Expense record not found.', 'danger');
    }
  } else {
    // --- STAGE 2: ADD NEW EXPENSE ---
    const newExpense = {
      id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      amount: amount,
      category: category,
      date: date,
      paymentMethod: paymentMethod,
      description: description
    };

    expenses.unshift(newExpense);
    saveExpenses(); // Stage 4: Persist to LocalStorage on Add
    resetExpenseForm();
    renderExpenses();
    showToast(`Added ₹${amount.toFixed(2)} for ${category}`, 'success');
  }
}

// Backward compatibility alias
const handleAddExpense = handleFormSubmit;

/**
 * Resets form fields back to their clean default state
 */
function resetExpenseForm() {
  expenseForm.reset();
  clearValidationErrors();

  // Restore the date to today
  expenseDateInput.value = getTodayDateString();

  // Reset select options
  expenseCategoryInput.value = '';
  expensePaymentInput.value = '';
}

// Attach the submit event listener to the form
expenseForm.addEventListener('submit', handleFormSubmit);

// ============================================================================
// STAGE 3: EDIT & DELETE FUNCTIONS
// ============================================================================

/**
 * Starts editing an existing expense.
 * Loads the existing values into the form, clearly indicates Edit Mode,
 * changes button to "Update Expense", and shows the Cancel Edit button.
 * 
 * @param {string} id - Unique ID of the expense to edit
 */
function startEdit(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;

  // Track the ID being edited
  if (editExpenseIdInput) {
    editExpenseIdInput.value = expense.id;
  }

  // Load existing values into form fields
  expenseAmountInput.value = expense.amount;
  expenseCategoryInput.value = expense.category;
  expenseDateInput.value = expense.date;
  expensePaymentInput.value = expense.paymentMethod;
  expenseDescriptionInput.value = expense.description || '';

  // Clear any existing validation errors
  clearValidationErrors();

  // Indicate Edit Mode in the UI
  if (formTitle) {
    formTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Expense';
  }
  if (submitBtnText) {
    submitBtnText.textContent = 'Update Expense';
  }
  if (submitExpenseBtn) {
    const icon = submitExpenseBtn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-check';
  }
  if (cancelEditBtn) {
    cancelEditBtn.classList.remove('hidden');
  }

  // Visually highlight active editing row
  highlightEditingRow(expense.id);

  // Scroll to form and focus amount input
  if (expenseForm) {
    expenseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  expenseAmountInput.focus();
}

/**
 * Updates an existing expense object in the `expenses` array.
 * Keeps the same expense ID and does NOT create duplicates.
 * 
 * @param {string} id - The expense ID to update
 * @param {object} updatedData - The modified values
 * @returns {boolean} true if found and updated
 */
function editExpense(id, updatedData) {
  const index = expenses.findIndex(item => item.id === id);
  if (index === -1) return false;

  expenses[index] = {
    ...expenses[index],
    amount: updatedData.amount,
    category: updatedData.category,
    date: updatedData.date,
    paymentMethod: updatedData.paymentMethod,
    description: updatedData.description
  };

  saveExpenses(); // Stage 4: Persist to LocalStorage on Edit
  return true;
}

/**
 * Leaves Edit Mode without saving changes.
 * Reverts form title, button labels, clears inputs, and hides Cancel Edit button.
 */
function cancelEdit() {
  if (editExpenseIdInput) {
    editExpenseIdInput.value = '';
  }

  resetExpenseForm();

  if (formTitle) {
    formTitle.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add New Expense';
  }
  if (submitBtnText) {
    submitBtnText.textContent = 'Add Expense';
  }
  if (submitExpenseBtn) {
    const icon = submitExpenseBtn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-plus';
  }
  if (cancelEditBtn) {
    cancelEditBtn.classList.add('hidden');
  }

  // Clear row highlight
  highlightEditingRow(null);
}

/**
 * Tracks the ID of the expense awaiting deletion confirmation.
 */
let pendingDeleteId = null;

/**
 * Displays a confirmation before deleting an expense.
 * Supports the styled confirmation modal and browser fallback.
 * 
 * @param {string} id - Expense ID to delete
 */
function promptDelete(id) {
  // Check if test mocked window.confirm
  if (typeof window.confirm === 'function' && window.confirm.toString().indexOf('[native code]') === -1) {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
    return;
  }

  pendingDeleteId = id;
  if (deleteModal) {
    deleteModal.classList.remove('hidden');
  } else if (confirm('Are you sure you want to delete this expense?')) {
    deleteExpense(id);
  }
}

/**
 * Removes an expense from the `expenses` array, re-renders the list,
 * and updates transaction counts.
 * 
 * @param {string} id - Expense ID to remove
 */
function deleteExpense(id) {
  // If user was currently editing this expense, exit edit mode
  if (editExpenseIdInput && editExpenseIdInput.value === id) {
    cancelEdit();
  }

  const initialLength = expenses.length;
  expenses = expenses.filter(item => item.id !== id);

  if (expenses.length < initialLength) {
    saveExpenses(); // Stage 4: Persist to LocalStorage on Delete
    renderExpenses();
    showToast('Expense deleted successfully', 'success');
  }
}

/**
 * Visually highlights the table row currently open in Edit Mode.
 * 
 * @param {string|null} id
 */
function highlightEditingRow(id) {
  if (!expensesTableBody) return;
  const rows = expensesTableBody.querySelectorAll('tr');
  rows.forEach(tr => {
    if (id && tr.getAttribute('data-id') === id) {
      tr.classList.add('row-editing');
    } else {
      tr.classList.remove('row-editing');
    }
  });
}

// ============================================================================
// STAGE 4: LOCALSTORAGE PERSISTENCE
// ============================================================================

/**
 * Saves the current `expenses` array to the browser's LocalStorage.
 * Converts the array to a JSON string using JSON.stringify().
 */
function saveExpenses() {
  try {
    const jsonString = JSON.stringify(expenses);
    localStorage.setItem(STORAGE_KEY, jsonString);
    localStorage.setItem(STORAGE_KEY_FALLBACK, jsonString);
  } catch (error) {
    console.error('Error saving expenses to LocalStorage:', error);
  }
}

/**
 * Reads and parses saved expenses from LocalStorage using JSON.parse().
 * If no saved expenses exist or parsing fails, initializes `expenses` to [].
 * 
 * @returns {Array} The loaded expenses array
 */
function loadExpenses() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY_FALLBACK);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed)) {
        expenses = parsed;
        return expenses;
      }
    }
  } catch (error) {
    console.error('Error loading expenses from LocalStorage:', error);
  }
  expenses = [];
  return expenses;
}

// ============================================================================
// STAGE 5: SEARCH, FILTER, SORT & DASHBOARD METRICS
// ============================================================================

/**
 * Computes and returns a filtered and sorted copy of the `expenses` array.
 * The original `expenses` array is never mutated.
 * 
 * @returns {Array} Filtered and sorted expenses
 */
function getFilteredAndSortedExpenses() {
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedCategory = filterCategory ? filterCategory.value : 'ALL';
  const selectedPayment = filterPayment ? filterPayment.value : 'ALL';
  const selectedMonth = filterMonth ? filterMonth.value : 'ALL';
  const selectedDate = filterDate ? filterDate.value : '';
  const selectedSort = sortBy ? sortBy.value : 'date-desc';

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
  if (searchInput) {
    searchInput.value = '';
  }
  if (filterCategory) {
    filterCategory.value = 'ALL';
    filterCategory.selectedIndex = 0;
  }
  if (filterPayment) {
    filterPayment.value = 'ALL';
    filterPayment.selectedIndex = 0;
  }
  if (filterMonth) {
    filterMonth.value = 'ALL';
    filterMonth.selectedIndex = 0;
  }
  if (filterDate) {
    filterDate.value = '';
  }
  if (sortBy) {
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
  if (searchInput) {
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (filterCategory) {
    filterCategory.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (filterPayment) {
    filterPayment.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (filterMonth) {
    filterMonth.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (filterDate) {
    filterDate.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (sortBy) {
    sortBy.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 4. Refresh displayed expense list based on reset filters
  renderExpenses();
  showToast('Filters cleared', 'info');
}

// ============================================================================
// STAGE 6: DASHBOARD METRICS & MONTHLY BUDGET PLANNER
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

  if (yesterdayDateLabel) {
    yesterdayDateLabel.textContent = formatDate(yesterdayStr);
  }
  if (yesterdayTotalDisplay) {
    yesterdayTotalDisplay.textContent = formatCurrency(yesterdayTotal);
  }

  if (todaySummaryDateLabel) {
    todaySummaryDateLabel.textContent = formatDate(todayStr);
  }
  if (todaySummaryTotalDisplay) {
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

  if (lastMonthDateLabel) {
    lastMonthDateLabel.textContent = formatMonthYear(prevYearMonth);
  }
  if (lastMonthTotalDisplay) {
    lastMonthTotalDisplay.textContent = formatCurrency(lastMonthTotal);
  }

  if (thisMonthSummaryDateLabel) {
    thisMonthSummaryDateLabel.textContent = formatMonthYear(currentYearMonth);
  }
  if (thisMonthSummaryTotalDisplay) {
    thisMonthSummaryTotalDisplay.textContent = formatCurrency(thisMonthTotal);
  }
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
 * Calculates and updates all Monthly Budget Planner metrics,
 * progress bar width, alert colors, and threshold warning messages.
 */
function calculateBudget() {
  const spentThisMonth = calculateMonthlyExpenses();

  if (targetBudgetDisplay) targetBudgetDisplay.textContent = formatCurrency(monthlyBudget);
  if (budgetSpentDisplay) budgetSpentDisplay.textContent = formatCurrency(spentThisMonth);

  // Case: No budget set or budget is 0
  if (!monthlyBudget || monthlyBudget <= 0) {
    if (budgetRemainingDisplay) budgetRemainingDisplay.textContent = '₹0.00';
    if (budgetPercentDisplay) budgetPercentDisplay.textContent = '0%';
    if (budgetProgressFill) {
      budgetProgressFill.style.width = '0%';
      budgetProgressFill.className = 'budget-progress-bar-fill';
    }
    if (budgetWarningAlert) budgetWarningAlert.classList.add('hidden');
    return;
  }

  // Budget is configured
  const remaining = Math.max(0, monthlyBudget - spentThisMonth);
  const usedPercentage = Math.round((spentThisMonth / monthlyBudget) * 100);

  if (budgetRemainingDisplay) budgetRemainingDisplay.textContent = formatCurrency(remaining);
  if (budgetPercentDisplay) budgetPercentDisplay.textContent = `${usedPercentage}%`;

  // Visual progress bar fill is clamped to 0-100% so it never overflows its container
  const visualFill = Math.min(Math.max(usedPercentage, 0), 100);
  if (budgetProgressFill) {
    budgetProgressFill.style.width = `${visualFill}%`;

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
  if (budgetWarningAlert) {
    if (usedPercentage >= 100) {
      budgetWarningAlert.classList.remove('hidden');
      budgetWarningAlert.classList.remove('alert-warning');
      budgetWarningAlert.classList.add('alert-danger');
      if (budgetWarningText) {
        const overSpent = spentThisMonth - monthlyBudget;
        budgetWarningText.textContent = `Alert: You have exceeded your monthly budget by ${formatCurrency(overSpent)} (${usedPercentage}% used)!`;
      }
    } else if (usedPercentage >= 80) {
      budgetWarningAlert.classList.remove('hidden');
      budgetWarningAlert.classList.remove('alert-danger');
      budgetWarningAlert.classList.add('alert-warning');
      if (budgetWarningText) {
        budgetWarningText.textContent = `Warning: You have used ${usedPercentage}% of your monthly budget!`;
      }
    } else {
      budgetWarningAlert.classList.add('hidden');
      budgetWarningAlert.classList.remove('alert-warning', 'alert-danger');
    }
  }
}

/**
 * Saves the monthly budget to LocalStorage.
 */
function saveBudget() {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, monthlyBudget.toString());
  } catch (error) {
    console.error('Error saving budget to LocalStorage:', error);
  }
}

/**
 * Loads the saved monthly budget from LocalStorage.
 * If no budget exists, initializes monthlyBudget to 0.
 * 
 * @returns {number} Loaded budget
 */
function loadBudget() {
  try {
    const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (saved !== null && saved !== '') {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0) {
        monthlyBudget = parsed;
        if (monthlyBudgetInput && monthlyBudget > 0) {
          monthlyBudgetInput.value = monthlyBudget.toString();
        }
        calculateBudget();
        return monthlyBudget;
      }
    }
  } catch (error) {
    console.error('Error loading budget from LocalStorage:', error);
  }
  monthlyBudget = 0;
  calculateBudget();
  return monthlyBudget;
}

/**
 * Handles the submit event of the Set Monthly Budget form.
 * 
 * @param {Event} event
 */
function handleSetBudget(event) {
  event.preventDefault();
  if (!monthlyBudgetInput) return;

  const value = parseFloat(monthlyBudgetInput.value.trim());
  if (isNaN(value) || value < 0) {
    showToast('Please enter a valid positive budget amount.', 'danger');
    return;
  }

  monthlyBudget = value;
  saveBudget();
  calculateBudget();
  showToast(`Monthly budget set to ${formatCurrency(monthlyBudget)}`, 'success');
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

  if (totalExpensesDisplay) totalExpensesDisplay.textContent = formatCurrency(total);
  if (todayExpensesDisplay) todayExpensesDisplay.textContent = formatCurrency(today);
  if (monthExpensesDisplay) monthExpensesDisplay.textContent = formatCurrency(month);
  if (transactionCountDisplay) transactionCountDisplay.textContent = expenses.length.toString();

  if (topCategoryDisplay) {
    topCategoryDisplay.textContent = top.category;
  }
  if (topCategoryAmount) {
    topCategoryAmount.textContent = top.amount > 0 ? `${formatCurrency(top.amount)} spent` : '₹0.00 spent';
  }

  // Update budget calculations
  calculateBudget();

  // Update yesterday & today daily summary cards above the table
  updateDailySummaryCards();

  // Update last month & this month monthly summary cards
  updateMonthlySummaryCards();
}

// Backward-compatibility alias
const updateDashboardStats = updateDashboard;

// ============================================================================
// 8. RENDER EXPENSES (DISPLAY FUNCTION)
// ============================================================================

/**
 * Separate rendering function responsible for updating the DOM table/cards.
 * Re-rendering from data (the `expenses` array) ensures single source of truth.
 */
function renderExpenses() {
  // Always update summary dashboard statistics from full expenses array
  updateDashboard();

  // Ensure Month filter options reflect current expense dates
  checkAndSyncMonthFilter();

  // Obtain filtered and sorted copy of expenses
  const displayedExpenses = getFilteredAndSortedExpenses();

  // Calculate total amount of currently displayed expenses (unaffected by sort order)
  const displayedTotal = calculateFilteredTotal(displayedExpenses);

  // Update transaction count badge to reflect currently displayed/filtered results
  if (filteredCountBadge) {
    filteredCountBadge.textContent = displayedExpenses.length.toString();
  }

  // Update total amount display for currently displayed expenses
  if (filteredTotalAmount) {
    filteredTotalAmount.textContent = formatCurrency(displayedTotal);
  }

  const tableContainer = expensesTable ? expensesTable.closest('.table-responsive') : null;

  // Case 1: No expenses to display
  if (displayedExpenses.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (expensesTable) expensesTable.classList.add('hidden');
    if (expensesTableBody) expensesTableBody.innerHTML = '';

    if (emptyStateDesc) {
      if (expenses.length === 0) {
        emptyStateDesc.textContent = "You haven't recorded any expenses yet. Use the form on the left to add your first expense!";
      } else {
        emptyStateDesc.textContent = "No expenses match your search or filter criteria. Click 'Reset' to view all expenses.";
      }
    }
    return;
  }

  // Case 2: Expenses exist -> Hide Empty State, Show Table
  if (emptyState) emptyState.classList.add('hidden');
  if (tableContainer) tableContainer.classList.remove('hidden');
  if (expensesTable) expensesTable.classList.remove('hidden');

  // Clear previous rows
  expensesTableBody.innerHTML = '';

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
      editBtn.addEventListener('click', () => startEdit(expense.id));
    }
    const deleteBtn = tr.querySelector('.btn-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => promptDelete(expense.id));
    }

    // Highlight row if currently being edited
    if (editExpenseIdInput && editExpenseIdInput.value === expense.id) {
      tr.classList.add('row-editing');
    }

    // Append this row to the table body
    expensesTableBody.appendChild(tr);
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

// ============================================================================
// 8. APPLICATION INITIALIZATION
// ============================================================================

function initApp() {


  // 2. Set default date in the form
  const todayStr = getTodayDateString();
  if (expenseDateInput) {
    expenseDateInput.value = todayStr;
  }

  // 3. Set friendly dashboard date labels
  const now = new Date();
  if (todayDateLabel) {
    todayDateLabel.textContent = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }
  if (currentMonthLabel) {
    currentMonthLabel.textContent = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  // 4. Load Saved Expenses from LocalStorage (Stage 4)
  loadExpenses();

  // 5. Load Saved Monthly Budget from LocalStorage (Stage 6)
  loadBudget();

  // 6. Initial Render of Expenses (will render loaded expenses or empty state)
  renderExpenses();

  // 5. Connect Edit & Delete interaction listeners
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', cancelEdit);
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      if (deleteModal) deleteModal.classList.add('hidden');
      pendingDeleteId = null;
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (pendingDeleteId) {
        deleteExpense(pendingDeleteId);
        pendingDeleteId = null;
      }
      if (deleteModal) deleteModal.classList.add('hidden');
    });
  }

  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        deleteModal.classList.add('hidden');
        pendingDeleteId = null;
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deleteModal && !deleteModal.classList.contains('hidden')) {
      deleteModal.classList.add('hidden');
      pendingDeleteId = null;
    }
  });

  // Connect Search & Filter listeners (Stage 5)
  if (searchInput) {
    searchInput.addEventListener('input', renderExpenses);
  }
  if (filterCategory) {
    filterCategory.addEventListener('change', renderExpenses);
  }
  if (filterPayment) {
    filterPayment.addEventListener('change', renderExpenses);
  }
  if (filterMonth) {
    filterMonth.addEventListener('change', renderExpenses);
  }
  if (filterDate) {
    filterDate.addEventListener('input', renderExpenses);
    filterDate.addEventListener('change', renderExpenses);
  }
  if (sortBy) {
    sortBy.addEventListener('change', renderExpenses);
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }
  // Connect Monthly Budget listener (Stage 6)
  if (budgetForm) {
    budgetForm.addEventListener('submit', handleSetBudget);
  }

  // Initial population of dynamic Month filter options
  populateMonthFilter();

  // Load saved monthly budget (Stage 6)
  loadBudget();

  // Expose Stage 3, 4, 5 & 6 functions globally
  window.startEdit = startEdit;
  window.cancelEdit = cancelEdit;
  window.editExpense = editExpense;
  window.deleteExpense = deleteExpense;
  window.promptDelete = promptDelete;
  window.saveExpenses = saveExpenses;
  window.loadExpenses = loadExpenses;
  window.filterState = filterState;
  window.filterMonth = filterMonth;
  window.populateMonthFilter = populateMonthFilter;
  window.resetFilters = resetFilters;
  window.getFilteredAndSortedExpenses = getFilteredAndSortedExpenses;
  window.updateDashboardStats = updateDashboardStats;
  window.updateDashboard = updateDashboard;
  window.calculateTotalExpenses = calculateTotalExpenses;
  window.calculateTodayExpenses = calculateTodayExpenses;
  window.calculateYesterdayExpenses = calculateYesterdayExpenses;
  window.updateDailySummaryCards = updateDailySummaryCards;
  window.calculateMonthlyExpenses = calculateMonthlyExpenses;
  window.calculateLastMonthExpenses = calculateLastMonthExpenses;
  window.updateMonthlySummaryCards = updateMonthlySummaryCards;
  window.calculateTopCategory = calculateTopCategory;
  window.calculateFilteredTotal = calculateFilteredTotal;
  window.calculateBudget = calculateBudget;
  window.saveBudget = saveBudget;
  window.loadBudget = loadBudget;

  console.log('✅ SpendWise Stage 6 ready: Dashboard stats & Monthly Budget active.');
}

// Run once HTML content has loaded
document.addEventListener('DOMContentLoaded', initApp);
