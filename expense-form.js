// ============================================================================
// STAGE 2 & 3: ADD/EDIT EXPENSE HANDLER
// ============================================================================

/**
 * Handles form submission for both Adding new expenses and Updating existing ones.
 * 
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  // Validate the inputs
  if (typeof validateExpenseForm === 'function' && !validateExpenseForm()) {
    if (typeof showToast === 'function') showToast('Please fix the errors in the form.', 'danger');
    return;
  }

  // Read clean values from the inputs
  const amount = parseFloat(expenseAmountInput.value.trim());
  const category = expenseCategoryInput.value;
  const date = expenseDateInput.value;
  const paymentMethod = expensePaymentInput.value;
  const description = expenseDescriptionInput.value.trim();

  const editId = (typeof editExpenseIdInput !== 'undefined' && editExpenseIdInput) ? editExpenseIdInput.value.trim() : '';

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
      if (typeof renderExpenses === 'function') renderExpenses();
      cancelEdit();
      if (typeof showToast === 'function') showToast('Expense updated successfully!', 'success');
    } else {
      if (typeof showToast === 'function') showToast('Error: Expense record not found.', 'danger');
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
    if (typeof saveExpenses === 'function') saveExpenses(); // Persist to LocalStorage on Add
    resetExpenseForm();
    if (typeof renderExpenses === 'function') renderExpenses();
    if (typeof showToast === 'function') showToast('Added \u20B9' + amount.toFixed(2) + ' for ' + category, 'success');
  }
}

/**
 * Resets form fields back to their clean default state
 */
function resetExpenseForm() {
  if (typeof expenseForm !== 'undefined' && expenseForm) expenseForm.reset();
  if (typeof clearValidationErrors === 'function') clearValidationErrors();

  // Restore the date to today
  if (typeof expenseDateInput !== 'undefined' && expenseDateInput && typeof getTodayDateString === 'function') {
    expenseDateInput.value = getTodayDateString();
  }

  // Reset select options
  if (typeof expenseCategoryInput !== 'undefined' && expenseCategoryInput) expenseCategoryInput.value = '';
  if (typeof expensePaymentInput !== 'undefined' && expensePaymentInput) expensePaymentInput.value = '';
}

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
  if (typeof editExpenseIdInput !== 'undefined' && editExpenseIdInput) {
    editExpenseIdInput.value = expense.id;
  }

  // Load existing values into form fields
  if (typeof expenseAmountInput !== 'undefined' && expenseAmountInput) expenseAmountInput.value = expense.amount;
  if (typeof expenseCategoryInput !== 'undefined' && expenseCategoryInput) expenseCategoryInput.value = expense.category;
  if (typeof expenseDateInput !== 'undefined' && expenseDateInput) expenseDateInput.value = expense.date;
  if (typeof expensePaymentInput !== 'undefined' && expensePaymentInput) expensePaymentInput.value = expense.paymentMethod;
  if (typeof expenseDescriptionInput !== 'undefined' && expenseDescriptionInput) expenseDescriptionInput.value = expense.description || '';

  // Clear any existing validation errors
  if (typeof clearValidationErrors === 'function') clearValidationErrors();

  // Indicate Edit Mode in the UI
  if (typeof formTitle !== 'undefined' && formTitle) {
    formTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Expense';
  }
  if (typeof submitBtnText !== 'undefined' && submitBtnText) {
    submitBtnText.textContent = 'Update Expense';
  }
  if (typeof submitExpenseBtn !== 'undefined' && submitExpenseBtn) {
    const icon = submitExpenseBtn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-check';
  }
  if (typeof cancelEditBtn !== 'undefined' && cancelEditBtn) {
    cancelEditBtn.classList.remove('hidden');
  }

  // Visually highlight active editing row
  if (typeof highlightEditingRow === 'function') highlightEditingRow(expense.id);

  // Scroll to form and focus amount input
  if (typeof expenseForm !== 'undefined' && expenseForm) {
    expenseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (typeof expenseAmountInput !== 'undefined' && expenseAmountInput) expenseAmountInput.focus();
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

  if (typeof saveExpenses === 'function') saveExpenses(); // Persist to LocalStorage on Edit
  return true;
}

/**
 * Leaves Edit Mode without saving changes.
 * Reverts form title, button labels, clears inputs, and hides Cancel Edit button.
 */
function cancelEdit() {
  if (typeof editExpenseIdInput !== 'undefined' && editExpenseIdInput) {
    editExpenseIdInput.value = '';
  }

  resetExpenseForm();

  if (typeof formTitle !== 'undefined' && formTitle) {
    formTitle.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add New Expense';
  }
  if (typeof submitBtnText !== 'undefined' && submitBtnText) {
    submitBtnText.textContent = 'Add Expense';
  }
  if (typeof submitExpenseBtn !== 'undefined' && submitExpenseBtn) {
    const icon = submitExpenseBtn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-plus';
  }
  if (typeof cancelEditBtn !== 'undefined' && cancelEditBtn) {
    cancelEditBtn.classList.add('hidden');
  }

  // Clear row highlight
  if (typeof highlightEditingRow === 'function') highlightEditingRow(null);
}