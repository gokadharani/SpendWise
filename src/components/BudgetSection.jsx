import React, { useState, useEffect } from 'react';
import { formatCurrency, getCurrentYearMonthString } from '../utils';
import { getBudget, createBudget, updateBudget } from '../api/budgets';

const BudgetSection = ({ expenses, budget, setBudget, showToast }) => {
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentYearMonth = getCurrentYearMonthString();

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await getBudget(currentYearMonth);
      if (res.success && res.budget) {
        setBudgetData(res.budget);
        setBudget(res.budget.amount);
        setBudgetInput(res.budget.amount.toString());
      }
    } catch (err) {
      if (err.status === 404) {
        // No budget exists yet
        setBudgetData(null);
        setBudget(0);
        setBudgetInput('');
      } else {
        console.error('Failed to load budget:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh budget when expenses change or on mount
  useEffect(() => {
    fetchBudget();
  }, [expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid positive budget amount.', 'danger');
      return;
    }
    
    setLoading(true);
    try {
      if (budgetData) {
        await updateBudget(currentYearMonth, { amount: val });
        showToast('Monthly budget updated to ' + formatCurrency(val), 'success');
      } else {
        await createBudget({ amount: val, month: currentYearMonth });
        showToast('Monthly budget set to ' + formatCurrency(val), 'success');
      }
      await fetchBudget();
    } catch (err) {
      showToast(err.message || 'Failed to set budget', 'danger');
      setLoading(false);
    }
  };

  const isConfigured = !!budgetData;
  const spentThisMonth = budgetData ? budgetData.spent : 0;
  const remaining = budgetData ? budgetData.remaining : 0;
  const usedPercentage = budgetData ? budgetData.percentage : 0;
  const visualFill = Math.min(Math.max(usedPercentage, 0), 100);

  let fillClass = 'budget-progress-bar-fill';
  let alertBanner = null;

  if (isConfigured) {
    if (usedPercentage >= 100) {
      fillClass += ' danger';
      const overSpent = spentThisMonth - budget;
      alertBanner = (
        <div className="budget-alert-banner alert-danger">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>Alert: You have exceeded your monthly budget by {formatCurrency(overSpent)} ({usedPercentage}% used)!</span>
        </div>
      );
    } else if (usedPercentage >= 80) {
      fillClass += ' warning';
      alertBanner = (
        <div className="budget-alert-banner alert-warning">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>Warning: You have used {usedPercentage}% of your monthly budget!</span>
        </div>
      );
    }
  }

  return (
    <section className="budget-section" aria-labelledby="budget-heading">
      <div className="budget-card">
        <div className="budget-header">
          <div className="budget-title-area">
            <div className="budget-badge-icon">
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <div>
              <h2 id="budget-heading" className="budget-card-title">Monthly Budget Planner</h2>
              <p className="budget-subtitle">Monitor your spending threshold for the current month</p>
            </div>
          </div>

          <form className="budget-set-form" onSubmit={handleSubmit}>
            <label htmlFor="monthlyBudgetInput" className="sr-only">Set Monthly Budget</label>
            <div className="budget-input-group">
              <span className="currency-symbol">₹</span>
              <input 
                type="number" 
                id="monthlyBudgetInput" 
                placeholder="Set monthly budget" 
                min="1" 
                step="any" 
                required 
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                <i className="fa-solid fa-check"></i> {loading ? 'Saving...' : 'Set Budget'}
              </button>
            </div>
          </form>
        </div>

        <div className="budget-progress-container">
          <div className="budget-progress-bar-bg">
            <div className={fillClass} style={{ width: `${visualFill}%` }}></div>
          </div>
          <div className="budget-stats-row">
            <div className="budget-stat-item">
              <span className="budget-stat-label">Monthly Target</span>
              <span className="budget-stat-val">{formatCurrency(budget || 0)}</span>
            </div>
            <div className="budget-stat-item">
              <span className="budget-stat-label">Spent this month</span>
              <span className="budget-stat-val">{formatCurrency(spentThisMonth)}</span>
            </div>
            <div className="budget-stat-item">
              <span className="budget-stat-label">Remaining</span>
              <span className="budget-stat-val">{formatCurrency(isConfigured ? remaining : 0)}</span>
            </div>
            <div className="budget-stat-item">
              <span className="budget-stat-label">Used</span>
              <span className="budget-stat-val font-semibold">{usedPercentage}%</span>
            </div>
          </div>
        </div>
        
        {alertBanner}
      </div>
    </section>
  );
};

export default BudgetSection;
