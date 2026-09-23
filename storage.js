// ============================================================================
// STAGE 4: LOCALSTORAGE PERSISTENCE
// ============================================================================

// LocalStorage Persistence Keys
const STORAGE_KEY = 'spendwise_expenses';
const STORAGE_KEY_FALLBACK = 'expenses';
const BUDGET_STORAGE_KEY = 'spendwise_budget';

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
        if (typeof monthlyBudgetInput !== 'undefined' && monthlyBudgetInput && monthlyBudget > 0) {
          monthlyBudgetInput.value = monthlyBudget.toString();
        }
        if (typeof calculateBudget === 'function') calculateBudget();
        return monthlyBudget;
      }
    }
  } catch (error) {
    console.error('Error loading budget from LocalStorage:', error);
  }
  monthlyBudget = 0;
  if (typeof calculateBudget === 'function') calculateBudget();
  return monthlyBudget;
}
