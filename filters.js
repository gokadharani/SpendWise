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

    // Month filter (search input)
    if (selectedMonth && selectedMonth.trim().toLowerCase() !== 'all' && selectedMonth.trim() !== '') {
      if (!expense.date) return false;
      const expenseMonth = expense.date.substring(0, 7);
      const formatted = formatMonthYear(expenseMonth).toLowerCase();
      const searchM = selectedMonth.trim().toLowerCase();
      let match = false;
      const searchParts = searchM.split(' ').filter(Boolean);
      if (searchParts.length === 2) {
        const [searchMonth, searchYear] = searchParts;
        const [formattedMonth, formattedYear] = formatted.split(' ');
        if (formattedMonth && formattedYear && formattedMonth.startsWith(searchMonth) && formattedYear.startsWith(searchYear)) {
          match = true;
        }
      } else {
        if (formatted.startsWith(searchM) || expenseMonth.startsWith(searchM)) {
          match = true;
        }
      }

      if (!match) return false;
    }










    // Specific date filter (search input)
    if (selectedDate && selectedDate.trim() !== '') {
      if (!expense.date) return false;
      if (!expense.date.includes(selectedDate.trim())) {
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
    filterMonth.value = '';

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

// ============================================================================
// CUSTOM DROPDOWN IMPLEMENTATION (Mobile-friendly)
// ============================================================================
function initCustomDropdowns() {
  const selects = document.querySelectorAll('.filter-group select');

  selects.forEach(select => {
    // Skip if already initialized
    if (select.parentElement.classList.contains('custom-select-container')) return;

    // Hide original select
    select.style.display = 'none';

    // Create container
    const container = document.createElement('div');
    container.className = 'custom-select-container';

    // Wrap select in container
    select.parentNode.insertBefore(container, select);
    container.appendChild(select);

    // Create Trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.tabIndex = 0; // Keyboard accessibility

    const valueSpan = document.createElement('span');
    valueSpan.className = 'custom-select-value';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-chevron-down';

    trigger.appendChild(valueSpan);
    trigger.appendChild(icon);

    // Create Options Container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';

    container.appendChild(trigger);
    container.appendChild(optionsContainer);

    // Function to build/rebuild custom options from the native select
    const rebuildOptions = () => {
      optionsContainer.innerHTML = '';
      Array.from(select.options).forEach((option, index) => {
        const customOption = document.createElement('div');
        customOption.className = 'custom-option';
        customOption.textContent = option.textContent;
        customOption.dataset.value = option.value;

        customOption.addEventListener('click', (e) => {
          e.stopPropagation();
          select.selectedIndex = index;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          closeAllDropdowns();
          updateSelectedVisuals();
        });
        optionsContainer.appendChild(customOption);
      });
      updateSelectedVisuals();
    };

    // Function to update the visual state based on native select
    const updateSelectedVisuals = () => {
      const selectedIndex = select.selectedIndex >= 0 ? select.selectedIndex : 0;
      if (select.options[selectedIndex]) {
        valueSpan.textContent = select.options[selectedIndex].textContent;
      }
      Array.from(optionsContainer.children).forEach((child, index) => {
        if (index === selectedIndex) {
          child.classList.add('selected');
        } else {
          child.classList.remove('selected');
        }
      });
    };

    // Initial build
    rebuildOptions();

    // Observe DOM changes on the select element (e.g. dynamic month filter)
    const observer = new MutationObserver(() => {
      rebuildOptions();
    });
    observer.observe(select, { childList: true });

    // Sync when select changes externally (e.g. Reset button)
    select.addEventListener('change', () => {
      updateSelectedVisuals();
    });

    // Handle opening/closing
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = container.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        openDropdown(container, trigger, optionsContainer);
      }
    });

    // Keyboard support
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  // Close all when clicking outside
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  // Reposition on resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('.custom-select-container.open').forEach(container => {
      const trigger = container.querySelector('.custom-select-trigger');
      const optionsContainer = container.querySelector('.custom-select-options');
      positionDropdown(trigger, optionsContainer);
    });
  });

  function closeAllDropdowns() {
    document.querySelectorAll('.custom-select-container.open').forEach(el => {
      el.classList.remove('open');
    });
  }

  function positionDropdown(trigger, optionsContainer) {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Match trigger width
    let width = rect.width;
    let left = rect.left;

    // Clamp left so it doesn't overflow right
    if (left + width > window.innerWidth) {
      left = window.innerWidth - width - 10;
    }
    // Clamp left so it doesn't overflow left
    if (left < 0) left = 10;

    optionsContainer.style.width = width + 'px';
    optionsContainer.style.left = left + 'px';

    // Determine vertical position
    if (spaceBelow < 250 && spaceAbove > spaceBelow) {
      // Open upwards
      optionsContainer.style.top = 'auto';
      optionsContainer.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
    } else {
      // Open downwards
      optionsContainer.style.bottom = 'auto';
      optionsContainer.style.top = (rect.bottom + 5) + 'px';
    }
  }

  function openDropdown(container, trigger, optionsContainer) {
    container.classList.add('open');
    positionDropdown(trigger, optionsContainer);
  }
}

// Initialize custom dropdowns on DOM load
document.addEventListener('DOMContentLoaded', initCustomDropdowns);

// ============================================================================
// CUSTOM DATEPICKER IMPLEMENTATION (Mobile-friendly)
// ============================================================================
function initCustomDatepicker() {
  const dateInput = document.getElementById('filterDate');
  if (!dateInput) return;

  // Convert to readonly text input to prevent native mobile keyboard/calendar
  dateInput.type = 'text';
  dateInput.readOnly = true;
  dateInput.placeholder = 'YYYY-MM-DD';
  dateInput.style.cursor = 'pointer';

  // Create picker container
  const pickerPopup = document.createElement('div');
  pickerPopup.className = 'custom-datepicker-popup';
  document.body.appendChild(pickerPopup);

  let currentViewDate = new Date(); // Month/Year currently viewed
  let selectedDateString = ''; // YYYY-MM-DD

  // Build internal structure
  pickerPopup.innerHTML = `
    <div class="datepicker-header">
      <button type="button" class="prev-month"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="current-month-year"></div>
      <button type="button" class="next-month"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <div class="datepicker-weekdays">
      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
    </div>
    <div class="datepicker-days"></div>
  `;

  const titleEl = pickerPopup.querySelector('.current-month-year');
  const daysEl = pickerPopup.querySelector('.datepicker-days');
  const prevBtn = pickerPopup.querySelector('.prev-month');
  const nextBtn = pickerPopup.querySelector('.next-month');

  function renderCalendar() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    titleEl.textContent = `${monthNames[month]} ${year}`;

    daysEl.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'datepicker-day empty';
      daysEl.appendChild(empty);
    }

    const today = new Date();

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'datepicker-day';
      dayEl.textContent = d;

      const padM = String(month + 1).padStart(2, '0');
      const padD = String(d).padStart(2, '0');
      const dateStr = `${year}-${padM}-${padD}`;

      if (dateStr === selectedDateString) {
        dayEl.classList.add('selected');
      }

      if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayEl.classList.add('today');
      }

      dayEl.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedDateString = dateStr;
        dateInput.value = dateStr;
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        closeDatepicker();
      });

      daysEl.appendChild(dayEl);
    }
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    renderCalendar();
  });

  function positionDatepicker() {
    const rect = dateInput.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let left = rect.left;
    const pickerWidth = 280;

    if (left + pickerWidth > window.innerWidth) {
      left = window.innerWidth - pickerWidth - 10;
    }
    if (left < 0) left = 10;

    pickerPopup.style.left = left + 'px';

    const popupHeight = 320; // approximate
    if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
      pickerPopup.style.top = 'auto';
      pickerPopup.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
    } else {
      pickerPopup.style.bottom = 'auto';
      pickerPopup.style.top = (rect.bottom + 5) + 'px';
    }
  }

  function openDatepicker() {
    if (dateInput.value && /^\\d{4}-\\d{2}-\\d{2}$/.test(dateInput.value)) {
      selectedDateString = dateInput.value;
      const parts = dateInput.value.split('-');
      currentViewDate = new Date(parts[0], parts[1] - 1, 1);
    } else {
      selectedDateString = '';
      currentViewDate = new Date();
      currentViewDate.setDate(1);
    }
    renderCalendar();
    pickerPopup.classList.add('open');
    positionDatepicker();
  }

  function closeDatepicker() {
    pickerPopup.classList.remove('open');
  }

  dateInput.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = pickerPopup.classList.contains('open');
    // Close custom dropdowns if any are open
    if (typeof closeAllDropdowns === 'function') closeAllDropdowns();
    if (!isOpen) {
      openDatepicker();
    }
  });

  // Keep synced if reset externally
  dateInput.addEventListener('change', () => {
    if (dateInput.value === '') {
      selectedDateString = '';
    }
  });

  document.addEventListener('click', (e) => {
    if (!pickerPopup.contains(e.target) && e.target !== dateInput) {
      closeDatepicker();
    }
  });

  window.addEventListener('resize', () => {
    if (pickerPopup.classList.contains('open')) {
      positionDatepicker();
    }
  });
}

document.addEventListener('DOMContentLoaded', initCustomDatepicker);
