import React, { useState, useEffect } from 'react';
import { formatCurrency, getCurrentYearMonthString } from '../utils';

const BudgetSection = ({ expenses, budget, setBudget, showToast }) => {
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    if (budget > 0) {
      setBudgetInput(budget.toString());
    } else {
      setBudgetInput('');
    }
  }, [budget]);

  const currentYearMonth = getCurrentYearMonthString();
  const spentThisMonth = expenses.reduce((sum, exp) => {
    return (exp.date && exp.date.startsWith(currentYearMonth))
      ? sum + (Number(exp.amount) || 0)
      : sum;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) {
      showToast('Please enter a valid positive budget amount.', 'danger');
      return;
    }
    setBudget(val);
    localStorage.setItem('spendwise_budget', val.toString());
    showToast('Monthly budget set to ' + formatCurrency(val), 'success');
  };

  const isConfigured = budget && budget > 0;
  const remaining = Math.max(0, budget - spentThisMonth);
  const usedPercentage = isConfigured ? Math.round((spentThisMonth / budget) * 100) : 0;
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
                min="0" 
                step="any" 
                required 
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <i className="fa-solid fa-check"></i> Set Budget
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
