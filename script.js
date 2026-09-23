/**
 * ============================================================================
 * SPENDWISE - Personal Expense Tracker (Refactored)
 * ============================================================================
 */

// ============================================================================
// 1. APPLICATION STATE
// ============================================================================
let expenses = [];
let monthlyBudget = 0;
let filterState = {
  search: '',
  category: 'ALL',
  payment: 'ALL',
  month: 'ALL',
  date: '',
  sortBy: 'date-desc'
};

// ============================================================================
// 2. DOM ELEMENT SELECTORS
// ============================================================================
const expenseForm = document.getElementById('expenseForm');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseCategoryInput = document.getElementById('expenseCategory');
const expenseDateInput = document.getElementById('expenseDate');
const expensePaymentInput = document.getElementById('expensePayment');
const expenseDescriptionInput = document.getElementById('expenseDescription');
const submitExpenseBtn = document.getElementById('submitExpenseBtn');

const editExpenseIdInput = document.getElementById('editExpenseId');
const formTitle = document.getElementById('formTitle');
const submitBtnText = document.getElementById('submitBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const expensesTable = document.getElementById('expensesTable');
const expensesTableBody = document.getElementById('expensesTableBody');
const emptyState = document.getElementById('emptyState');
const filteredCountBadge = document.getElementById('filteredCountBadge');
const filteredTotalAmount = document.getElementById('filteredTotalAmount');
const emptyStateDesc = document.getElementById('emptyStateDesc');

const toastContainer = document.getElementById('toastContainer');

const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterPayment = document.getElementById('filterPayment');
const filterMonth = document.getElementById('filterMonth');
const filterDate = document.getElementById('filterDate');
const sortBy = document.getElementById('sortBy');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

const totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
const todayExpensesDisplay = document.getElementById('todayExpensesDisplay');
const monthExpensesDisplay = document.getElementById('monthExpensesDisplay');
const transactionCountDisplay = document.getElementById('transactionCountDisplay');
const topCategoryDisplay = document.getElementById('topCategoryDisplay');
const topCategoryAmount = document.getElementById('topCategoryAmount');

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

const todayDateLabel = document.getElementById('todayDateLabel');
const currentMonthLabel = document.getElementById('currentMonthLabel');

const yesterdayDateLabel = document.getElementById('yesterdayDateLabel');
const yesterdayTotalDisplay = document.getElementById('yesterdayTotalDisplay');
const todaySummaryDateLabel = document.getElementById('todaySummaryDateLabel');
const todaySummaryTotalDisplay = document.getElementById('todaySummaryTotalDisplay');

const lastMonthDateLabel = document.getElementById('lastMonthDateLabel');
const lastMonthTotalDisplay = document.getElementById('lastMonthTotalDisplay');
const thisMonthSummaryDateLabel = document.getElementById('thisMonthSummaryDateLabel');
const thisMonthSummaryTotalDisplay = document.getElementById('thisMonthSummaryTotalDisplay');

// ============================================================================
// 3. UTILITY & HELPER FUNCTIONS
// ============================================================================

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function getCurrentYearMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return year + '-' + month;
}

function getPreviousYearMonthString() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); 

  if (month === 0) {
    month = 12;
    year -= 1;
  }
  const monthStr = String(month).padStart(2, '0');
  return year + '-' + monthStr;
}

function showToast(message, type = 'info') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  const iconMap = {
    success: 'fa-circle-check',
    danger: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = 
    '<i class="fa-solid ' + (iconMap[type] || 'fa-bell') + '"></i>\n' +
    '    <span>' + message + '</span>';

  toastContainer.appendChild(toast);

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
// 4. APPLICATION INITIALIZATION
// ============================================================================

function initApp() {
  const todayStr = getTodayDateString();
  if (expenseDateInput) {
    expenseDateInput.value = todayStr;
  }

  const now = new Date();
  if (todayDateLabel) {
    todayDateLabel.textContent = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }
  if (currentMonthLabel) {
    currentMonthLabel.textContent = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  if (typeof loadExpenses === 'function') loadExpenses();
  if (typeof loadBudget === 'function') loadBudget();
  if (typeof renderExpenses === 'function') renderExpenses();

  if (expenseForm && typeof handleFormSubmit === 'function') {
      expenseForm.addEventListener('submit', handleFormSubmit);
  }

  if (cancelEditBtn && typeof cancelEdit === 'function') {
    cancelEditBtn.addEventListener('click', cancelEdit);
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      if (deleteModal) deleteModal.classList.add('hidden');
      if (typeof pendingDeleteId !== 'undefined') pendingDeleteId = null;
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (typeof pendingDeleteId !== 'undefined' && pendingDeleteId && typeof deleteExpense === 'function') {
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
        if (typeof pendingDeleteId !== 'undefined') pendingDeleteId = null;
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deleteModal && !deleteModal.classList.contains('hidden')) {
      deleteModal.classList.add('hidden');
      if (typeof pendingDeleteId !== 'undefined') pendingDeleteId = null;
    }
  });

  if (searchInput && typeof renderExpenses === 'function') {
    searchInput.addEventListener('input', renderExpenses);
  }
  if (filterCategory && typeof renderExpenses === 'function') {
    filterCategory.addEventListener('change', renderExpenses);
  }
  if (filterPayment && typeof renderExpenses === 'function') {
    filterPayment.addEventListener('change', renderExpenses);
  }
  if (filterMonth && typeof renderExpenses === 'function') {
    filterMonth.addEventListener('change', renderExpenses);
  }
  if (filterDate && typeof renderExpenses === 'function') {
    filterDate.addEventListener('input', renderExpenses);
    filterDate.addEventListener('change', renderExpenses);
  }
  if (sortBy && typeof renderExpenses === 'function') {
    sortBy.addEventListener('change', renderExpenses);
  }
  if (resetFiltersBtn && typeof resetFilters === 'function') {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }
  if (budgetForm && typeof handleSetBudget === 'function') {
    budgetForm.addEventListener('submit', handleSetBudget);
  }

  if (typeof populateMonthFilter === 'function') populateMonthFilter();
  if (typeof loadBudget === 'function') loadBudget();

  console.log('✅ SpendWise Modular Architecture Initialized.');
}

document.addEventListener('DOMContentLoaded', initApp);
