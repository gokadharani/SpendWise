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

const detailsModal = document.getElementById('detailsModal');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const detailsModalContent = document.getElementById('detailsModalContent');
const detailsEditBtn = document.getElementById('detailsEditBtn');
const detailsDeleteBtn = document.getElementById('detailsDeleteBtn');

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
// 4. TRANSACTION DETAILS
// ============================================================================

function openTransactionDetails(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;

  if (detailsModalContent) {
    const descHTML = expense.description ? `
        <div class="details-row">
          <div class="details-label">Notes</div>
          <div class="details-value">${escapeHtml(expense.description)}</div>
        </div>
    ` : '';

    detailsModalContent.innerHTML = `
      <div class="details-view-content">
        <div class="details-amount-large">${formatCurrency(expense.amount)}</div>

        ${descHTML}

        <div class="details-row">
          <div class="details-label">Category</div>
          <div class="details-value">
            <span class="category-pill cat-${expense.category}">
              <span>${getCategoryEmoji(expense.category)}</span>
              <span>${expense.category}</span>
            </span>
          </div>
        </div>

        <div class="details-row">
          <div class="details-label">Date</div>
          <div class="details-value">${formatDate(expense.date)}</div>
        </div>

        <div class="details-row">
          <div class="details-label">Payment Method</div>
          <div class="details-value">
            <span class="payment-badge">
              ${getPaymentIcon(expense.paymentMethod)}
              <span>${expense.paymentMethod}</span>
            </span>
          </div>
        </div>
      </div>
    `;
  }

  if (detailsEditBtn) detailsEditBtn.setAttribute('data-id', id);
  if (detailsDeleteBtn) detailsDeleteBtn.setAttribute('data-id', id);

  if (detailsModal) detailsModal.classList.remove('hidden');
}

function closeTransactionDetails() {
  if (detailsModal) detailsModal.classList.add('hidden');
}

// ============================================================================
// 5. APPLICATION INITIALIZATION
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

  if (detailsModal) {
    detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) {
        closeTransactionDetails();
      }
    });
  }

  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', closeTransactionDetails);
  }

  if (detailsEditBtn) {
    detailsEditBtn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (id && typeof startEdit === 'function') {
        closeTransactionDetails();
        startEdit(id);
      }
    });
  }

  if (detailsDeleteBtn) {
    detailsDeleteBtn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (id && typeof promptDelete === 'function') {
        closeTransactionDetails();
        promptDelete(id);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (deleteModal && !deleteModal.classList.contains('hidden')) {
        deleteModal.classList.add('hidden');
        if (typeof pendingDeleteId !== 'undefined') pendingDeleteId = null;
      }
      if (detailsModal && !detailsModal.classList.contains('hidden')) {
        closeTransactionDetails();
      }
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
    const handleMonthChange = () => {
      if (filterMonth.value !== 'ALL' && filterMonth.value !== '') {
        if (filterDate && filterDate.value !== '') {
          filterDate.value = '';
          filterDate.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      renderExpenses();
    };
    filterMonth.addEventListener('input', handleMonthChange);
    filterMonth.addEventListener('change', handleMonthChange);
  }
  if (filterDate && typeof renderExpenses === 'function') {
    const handleDateChange = () => {
      if (filterDate.value !== '') {
        if (filterMonth && filterMonth.value !== 'ALL') {
          filterMonth.value = 'ALL';
          filterMonth.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      renderExpenses();
    };
    filterDate.addEventListener('input', handleDateChange);
    filterDate.addEventListener('change', handleDateChange);
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
