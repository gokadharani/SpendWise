// ============================================================================
// STAGE 2.1: ANALYTICS & INSIGHTS
// ============================================================================

// Global variable to keep track of the Chart instance so we can destroy it before re-rendering
let categoryChartInstance = null;

/**
 * Updates the Category Doughnut Chart using Chart.js.
 * Reads directly from the global `expenses` array.
 */
function updateCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;

  // Destroy existing chart instance to prevent duplicates
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  // Handle empty state gracefully
  if (!expenses || expenses.length === 0) {
    const ctx = canvas.getContext('2d');
    categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'], // Gray empty state
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        cutout: '70%'
      }
    });
    return;
  }

  // Aggregate expenses by category
  const categoryTotals = {};
  expenses.forEach(function(exp) {
    const category = exp.category || 'Uncategorized';
    const amount = Number(exp.amount) || 0;
    
    // Only aggregate valid positive expenses
    if (amount > 0) {
      if (categoryTotals[category]) {
        categoryTotals[category] += amount;
      } else {
        categoryTotals[category] = amount;
      }
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  // If we have expenses but they are all 0 or negative
  if (labels.length === 0) {
    const ctx = canvas.getContext('2d');
    categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        cutout: '70%'
      }
    });
    return;
  }

  // Simple predefined vibrant palette
  const backgroundColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#6366f1'
  ];

  // Render the real chart
  const ctx = canvas.getContext('2d');
  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, padding: 15 }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const formattedValue = (typeof formatCurrency === 'function') 
                ? formatCurrency(value) 
                : ('\u20B9' + value.toFixed(2));
              return ' ' + label + ': ' + formattedValue;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

// Global variable to keep track of the Trend Chart instance
let trendChartInstance = null;

/**
 * Updates the Monthly Spending Trend Line Chart using Chart.js.
 * Reads directly from the global `expenses` array.
 */
function updateTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;

  // Destroy existing chart instance to prevent duplicates
  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  // Handle empty state gracefully
  if (!expenses || expenses.length === 0) {
    const ctx = canvas.getContext('2d');
    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          borderColor: '#e5e7eb',
          borderWidth: 2,
          pointBackgroundColor: '#e5e7eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
    return;
  }

  // Aggregate expenses by month (YYYY-MM)
  const monthlyTotals = {};
  expenses.forEach(function(exp) {
    const amount = Number(exp.amount) || 0;
    if (amount > 0 && exp.date) {
      const monthStr = exp.date.substring(0, 7); // Extracts 'YYYY-MM'
      if (monthlyTotals[monthStr]) {
        monthlyTotals[monthStr] += amount;
      } else {
        monthlyTotals[monthStr] = amount;
      }
    }
  });

  // Sort the aggregated months chronologically (oldest to newest)
  const months = Object.keys(monthlyTotals).sort();
  
  // If we have expenses but they are all 0 or negative/invalid date
  if (months.length === 0) {
    const ctx = canvas.getContext('2d');
    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          borderColor: '#e5e7eb',
          borderWidth: 2,
          pointBackgroundColor: '#e5e7eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
    return;
  }

  // Format labels nicely (e.g., 'YYYY-MM' -> 'Jan 2026') using existing helper if available
  const formattedLabels = months.map(function(m) {
    if (typeof formatMonthYear === 'function') {
      return formatMonthYear(m);
    }
    return m;
  });

  const data = months.map(function(m) { return monthlyTotals[m]; });

  // Render the real line chart
  const ctx = canvas.getContext('2d');
  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: formattedLabels,
      datasets: [{
        label: 'Total Spent',
        data: data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.3, // Adds a smooth curve
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw || 0;
              const formattedValue = (typeof formatCurrency === 'function') 
                ? formatCurrency(value) 
                : ('\u20B9' + value.toFixed(2));
              return ' ' + formattedValue;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return (typeof formatCurrency === 'function') 
                ? formatCurrency(value) 
                : ('\u20B9' + value);
            }
          }
        }
      }
    }
  });
}

// Global variable to keep track of the Payment Chart instance
let paymentChartInstance = null;

/**
 * Updates the Payment Method Pie Chart using Chart.js.
 * Reads directly from the global `expenses` array.
 */
function updatePaymentChart() {
  const canvas = document.getElementById('paymentChart');
  if (!canvas) return;

  // Destroy existing chart instance to prevent duplicates
  if (paymentChartInstance) {
    paymentChartInstance.destroy();
  }

  // Handle empty state gracefully
  if (!expenses || expenses.length === 0) {
    const ctx = canvas.getContext('2d');
    paymentChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'], // Gray empty state
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        cutout: '0%'
      }
    });
    return;
  }

  // Aggregate expenses by payment method
  const paymentTotals = {};
  expenses.forEach(function(exp) {
    const method = exp.paymentMethod || 'Uncategorized';
    const amount = Number(exp.amount) || 0;
    
    // Only aggregate valid positive expenses
    if (amount > 0) {
      if (paymentTotals[method]) {
        paymentTotals[method] += amount;
      } else {
        paymentTotals[method] = amount;
      }
    }
  });

  const labels = Object.keys(paymentTotals);
  const data = Object.values(paymentTotals);

  // If we have expenses but they are all 0 or negative
  if (labels.length === 0) {
    const ctx = canvas.getContext('2d');
    paymentChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        cutout: '0%'
      }
    });
    return;
  }

  // Vibrant palette for pie chart (different from doughnut to avoid visual fatigue)
  const backgroundColors = [
    '#f97316', '#84cc16', '#0ea5e9', '#d946ef', '#f43f5e',
    '#eab308', '#22c55e', '#6366f1', '#a855f7', '#ec4899'
  ];

  // Render the real pie chart
  const ctx = canvas.getContext('2d');
  paymentChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, padding: 15 }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const formattedValue = (typeof formatCurrency === 'function') 
                ? formatCurrency(value) 
                : ('\u20B9' + value.toFixed(2));
              return ' ' + label + ': ' + formattedValue;
            }
          }
        }
      }
    }
  });
}
