import React, { useState, useEffect, useMemo } from 'react';
import StatCard from './StatCard';

const DashboardStats = () => {
  const [expenses, setExpenses] = useState([]);

  // Poll localStorage for expenses to stay in sync with the vanilla JS app during migration
  useEffect(() => {
    const fetchExpenses = () => {
      try {
        const savedData = localStorage.getItem('spendwise_expenses') || localStorage.getItem('expenses');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) {
            setExpenses(parsed);
          }
        }
      } catch (e) {
        console.error('Error parsing expenses in React:', e);
      }
    };

    fetchExpenses(); // initial load
    const interval = setInterval(fetchExpenses, 500);
    return () => clearInterval(interval);
  }, []);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Helper to get current Year-Month string
  const getCurrentYearMonthString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return year + '-' + month;
  };

  // Calculate stats using useMemo
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    
    const currentYearMonth = getCurrentYearMonthString();
    const month = expenses.reduce((sum, exp) => {
      return (exp.date && exp.date.startsWith(currentYearMonth))
        ? sum + (Number(exp.amount) || 0)
        : sum;
    }, 0);

    const count = expenses.length;

    // Top Category Calculation
    const categoryTotals = {};
    expenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      const amt = Number(exp.amount) || 0;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    });

    let topCategory = 'None';
    let maxSpent = 0;
    for (const cat in categoryTotals) {
      if (categoryTotals[cat] > maxSpent) {
        maxSpent = categoryTotals[cat];
        topCategory = cat;
      }
    }

    return { total, month, count, topCategory, maxSpent };
  }, [expenses]);

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading" className="sr-only">Financial Summary Dashboard</h2>

      <div className="stats-grid">
        <StatCard 
          cardClass="stat-total"
          iconClass="fa-solid fa-coins"
          label="Total Expenses"
          value={formatCurrency(stats.total)}
          metaText="Lifetime logged"
        />

        <StatCard 
          cardClass="stat-month"
          iconClass="fa-solid fa-calendar-days"
          label="This Month"
          value={formatCurrency(stats.month)}
          metaText="Current Month"
          metaId="currentMonthLabel"
        />

        <StatCard 
          cardClass="stat-count"
          iconClass="fa-solid fa-receipt"
          label="Transactions"
          value={stats.count.toString()}
          metaText="Recorded entries"
        />

        <StatCard 
          cardClass="stat-top-category"
          iconClass="fa-solid fa-chart-pie"
          label="Top Spending"
          value={stats.topCategory}
          metaText={stats.maxSpent > 0 ? `${formatCurrency(stats.maxSpent)} spent` : '₹0.00 spent'}
          metaId="topCategoryAmount"
        />
      </div>
    </section>
  );
};

export default DashboardStats;
