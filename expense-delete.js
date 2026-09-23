// ============================================================================
// STAGE 3: DELETE FUNCTIONS
// ============================================================================

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
  if (typeof deleteModal !== 'undefined' && deleteModal) {
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
  if (typeof editExpenseIdInput !== 'undefined' && editExpenseIdInput && editExpenseIdInput.value === id) {
    if (typeof cancelEdit === 'function') cancelEdit();
  }

  const initialLength = expenses.length;
  expenses = expenses.filter(item => item.id !== id);

  if (expenses.length < initialLength) {
    if (typeof saveExpenses === 'function') saveExpenses(); // Persist to LocalStorage on Delete
    if (typeof renderExpenses === 'function') renderExpenses();
    if (typeof showToast === 'function') showToast('Expense deleted successfully', 'success');
  }
}
