const validationAmountInput = document.getElementById('expenseAmount');
const validationCategoryInput = document.getElementById('expenseCategory');
const validationDateInput = document.getElementById('expenseDate');
const validationPaymentInput = document.getElementById('expensePayment');

const validationAmountError = document.getElementById('amountError');
const validationCategoryError = document.getElementById('categoryError');
const validationDateError = document.getElementById('dateError');
const validationPaymentError = document.getElementById('paymentError');
const validationDescriptionError = document.getElementById('descriptionError');

// ============================================================================
// 5. STAGE 2: FORM VALIDATION
// ============================================================================

/**
 * Clears all inline error messages from the form inputs.
 */
function clearValidationErrors() {
    validationAmountError.textContent = '';
    validationCategoryError.textContent = '';
    validationDateError.textContent = '';
    validationPaymentError.textContent = '';
    validationDescriptionError.textContent = '';

    // Remove red border styling if applied
    validationAmountInput.style.borderColor = '';
    validationCategoryInput.style.borderColor = '';
    validationDateInput.style.borderColor = '';
    validationPaymentInput.style.borderColor = '';
}

/**
 * Validates the user inputs against business requirements:
 * 1. Amount must be a valid number greater than 0
 * 2. Category must be selected
 * 3. Date must be provided
 * 4. Payment method must be selected
 * 5. Description is optional
 *
 * @returns {boolean} true if all fields are valid, false otherwise
 */
function validateExpenseForm() {
    clearValidationErrors();
    let isValid = true;

    // 1. Validate Amount
    const amountVal = validationAmountInput.value.trim();
    const parsedAmount = parseFloat(amountVal);

    if (amountVal === '') {
        validationAmountError.textContent = 'Please enter an expense amount.';
        validationAmountInput.style.borderColor = 'var(--danger)';
        isValid = false;
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
        validationAmountError.textContent = 'Amount must be a positive number greater than 0.';
        validationAmountInput.style.borderColor = 'var(--danger)';
        isValid = false;
    }

    // 2. Validate Category
    const categoryVal = validationCategoryInput.value;

    if (!categoryVal) {
        validationCategoryError.textContent = 'Please select an expense category.';
        validationCategoryInput.style.borderColor = 'var(--danger)';
        isValid = false;
    }

    // 3. Validate Date
    const dateVal = validationDateInput.value;

    if (!dateVal) {
        validationDateError.textContent = 'Please select a date.';
        validationDateInput.style.borderColor = 'var(--danger)';
        isValid = false;
    }

    // 4. Validate Payment Method
    const paymentVal = validationPaymentInput.value;

    if (!paymentVal) {
        validationPaymentError.textContent = 'Please choose a payment method.';
        validationPaymentInput.style.borderColor = 'var(--danger)';
        isValid = false;
    }

    return isValid;
}

// Clear individual error as soon as the user starts typing or selecting

validationAmountInput.addEventListener('input', () => {
    validationAmountError.textContent = '';
    validationAmountInput.style.borderColor = '';
});

validationCategoryInput.addEventListener('change', () => {
    validationCategoryError.textContent = '';
    validationCategoryInput.style.borderColor = '';
});

validationDateInput.addEventListener('input', () => {
    validationDateError.textContent = '';
    validationDateInput.style.borderColor = '';
});

validationDateInput.addEventListener('change', () => {
    validationDateError.textContent = '';
    validationDateInput.style.borderColor = '';
});

validationPaymentInput.addEventListener('change', () => {
    validationPaymentError.textContent = '';
    validationPaymentInput.style.borderColor = '';
});

// Make validation functions available to script.js
window.validateExpenseForm = validateExpenseForm;
window.clearValidationErrors = clearValidationErrors;