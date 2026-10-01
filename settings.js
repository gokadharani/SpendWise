/**
 * settings.js
 * Handles Settings functionality like Export Data.
 */

document.addEventListener('DOMContentLoaded', () => {
  const exportDataBtn = document.getElementById('exportDataBtn');
  const importDataBtn = document.getElementById('importDataBtn');
  const importDataInput = document.getElementById('importDataInput');
  
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', exportData);
  }
  
  if (importDataBtn && importDataInput) {
    importDataBtn.addEventListener('click', () => {
      importDataInput.click();
    });
    
    importDataInput.addEventListener('change', handleImportData);
  }
  
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');
  if (clearAllDataBtn) {
    clearAllDataBtn.addEventListener('click', clearAllData);
  }
});

/**
 * Creates a JSON backup of expenses and monthly budget.
 * Triggers a download of spendwise-backup.json.
 */
function exportData() {
  try {
    // Collect data to export
    const dataToExport = {
      expenses: typeof expenses !== 'undefined' ? expenses : [],
      monthlyBudget: typeof monthlyBudget !== 'undefined' ? monthlyBudget : 0
    };
    
    // Convert to formatted JSON string
    const jsonString = JSON.stringify(dataToExport, null, 2);
    
    // Create a Blob with application/json
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spendwise-backup.json';
    
    // Programmatically click the link to trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
      showToast('Data exported successfully!', 'success');
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    if (typeof showToast === 'function') {
      showToast('Failed to export data', 'danger');
    }
  }
}

/**
 * Reads and processes the imported JSON file.
 */
function handleImportData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Validate structure
      if (!data || typeof data !== 'object') {
        throw new Error('Imported data must be an object.');
      }
      
      if (!Array.isArray(data.expenses)) {
        throw new Error('Imported data must contain an expenses array.');
      }
      
      if (typeof data.monthlyBudget !== 'number' || data.monthlyBudget < 0) {
        throw new Error('Imported data must contain a valid non-negative monthlyBudget.');
      }
      
      // Confirm with user
      const isConfirmed = confirm('Are you sure you want to replace all existing data with this backup? This action cannot be undone.');
      
      if (isConfirmed) {
        // Replace existing data
        if (typeof expenses !== 'undefined') {
          expenses.length = 0;
          expenses.push(...data.expenses);
        }
        
        if (typeof monthlyBudget !== 'undefined') {
          monthlyBudget = data.monthlyBudget;
        }
        
        // Save using existing functions
        if (typeof saveExpenses === 'function') saveExpenses();
        if (typeof saveBudget === 'function') saveBudget();
        
        // Refresh UI
        if (typeof renderExpenses === 'function') renderExpenses();
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof calculateBudget === 'function') calculateBudget();
        if (typeof renderCharts === 'function') renderCharts();
        
        if (typeof showToast === 'function') {
          showToast('Data imported successfully!', 'success');
        } else {
          alert('Data imported successfully!');
        }
      }
    } catch (error) {
      console.error('Error importing data:', error);
      if (typeof showToast === 'function') {
        showToast(error.message || 'Invalid backup file.', 'danger');
      } else {
        alert(error.message || 'Invalid backup file.');
      }
    } finally {
      // Clear input so the same file can be selected again
      event.target.value = '';
    }
  };
  
  reader.onerror = function() {
    console.error('Error reading file.');
    if (typeof showToast === 'function') {
      showToast('Error reading the imported file', 'danger');
    }
  };

  reader.readAsText(file);
}

/**
 * Clears all existing data (expenses and budget) after user confirmation.
 */
function clearAllData() {
  try {
    const isConfirmed = confirm('Are you sure you want to permanently delete all expenses and reset your monthly budget? This action cannot be undone unless you have an exported backup.');
    
    if (isConfirmed) {
      // Clear variables
      if (typeof expenses !== 'undefined') {
        expenses.length = 0;
      }
      
      if (typeof monthlyBudget !== 'undefined') {
        monthlyBudget = 0;
      }
      
      // Remove LocalStorage keys
      localStorage.removeItem('spendwise_expenses');
      localStorage.removeItem('expenses'); // Fallback key
      localStorage.removeItem('spendwise_budget');
      
      // Refresh UI
      if (typeof renderExpenses === 'function') renderExpenses();
      if (typeof updateDashboard === 'function') updateDashboard();
      if (typeof calculateBudget === 'function') calculateBudget();
      if (typeof renderCharts === 'function') renderCharts();
      
      if (typeof showToast === 'function') {
        showToast('All data has been cleared successfully.', 'success');
      } else {
        alert('All data has been cleared successfully.');
      }
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    if (typeof showToast === 'function') {
      showToast('Failed to clear data.', 'danger');
    } else {
      alert('Failed to clear data.');
    }
  }
}


