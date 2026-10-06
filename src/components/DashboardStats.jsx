import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { getAnalyticsSummary } from '../api/analytics';

const DashboardStats = ({ expenses = [] }) => {
  const [activeDetail, setActiveDetail] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const [summaryStats, setSummaryStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    totalInvestments: 0,
    balance: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const res = await getAnalyticsSummary();
        if (isMounted && res.success && res.summary) {
          setSummaryStats({
            totalIncome: res.summary.totalIncome || 0,
            totalExpenses: res.summary.totalExpenses || 0,
            totalSavings: res.summary.totalSavings || 0,
            totalInvestments: res.summary.totalInvestments || 0,
            balance: res.summary.availableBalance || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard summary stats", err);
      }
    };
    fetchSummary();
    return () => { isMounted = false; };
  }, [expenses]);

  const renderDetailView = () => {
    let detailTitle = '';
    let detailContent = null;
    let detailValue = '';

    if (activeDetail === 'balance') {
      detailTitle = 'Available Balance';
      detailValue = formatCurrency(summaryStats.balance);
      detailContent = (
        <div>
          <p>This is your total income minus all expenses, savings, and investments.</p>
        </div>
      );
    } else if (activeDetail === 'income') {
      detailTitle = 'Total Income';
      detailValue = formatCurrency(summaryStats.totalIncome);
      detailContent = (
        <div>
          <p>Total money earned or received across all time.</p>
        </div>
      );
    } else if (activeDetail === 'expense') {
      detailTitle = 'Total Expenses';
      detailValue = formatCurrency(summaryStats.totalExpenses);
      detailContent = (
        <div>
          <p>Money spent on daily needs, bills, and other expenses.</p>
        </div>
      );
    } else if (activeDetail === 'savings') {
      detailTitle = 'Total Savings & Investments';
      detailValue = formatCurrency(summaryStats.totalSavings + summaryStats.totalInvestments);
      detailContent = (
        <div>
          <p>Savings: <strong>{formatCurrency(summaryStats.totalSavings)}</strong></p>
          <p>Investments: <strong>{formatCurrency(summaryStats.totalInvestments)}</strong></p>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="form-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="card-title"><i className="fa-solid fa-circle-info"></i> {detailTitle} Details</h2>
            <p className="card-subtitle">A closer look at your statistics</p>
          </div>
          <button className="btn-close-modal" onClick={() => setActiveDetail(null)} aria-label="Close details" title="Close details">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div style={{ padding: '1rem 0' }}>
          <div className="details-amount-large" style={{ marginBottom: '1rem', textAlign: 'left', fontSize: '1.8rem' }}>
            {detailValue}
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {detailContent}
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setActiveDetail(null)}>
            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading" className="sr-only">Financial Summary Dashboard</h2>

      {activeDetail ? (
        renderDetailView()
      ) : (
        <div className="stats-grid">
          <StatCard 
            cardClass="stat-total"
            iconClass="fa-solid fa-wallet"
            label="Balance"
            value={formatCurrency(summaryStats.balance)}
            metaText="Available funds"
            onClick={() => setActiveDetail('balance')}
          />

          <StatCard 
            cardClass="stat-income"
            iconClass="fa-solid fa-arrow-down"
            label="Income"
            value={formatCurrency(summaryStats.totalIncome)}
            metaText="Lifetime earned"
            onClick={() => setActiveDetail('income')}
          />

          <StatCard 
            cardClass="stat-expense"
            iconClass="fa-solid fa-arrow-up"
            label="Expenses"
            value={formatCurrency(summaryStats.totalExpenses)}
            metaText="Lifetime spent"
            onClick={() => setActiveDetail('expense')}
          />

          <StatCard 
            cardClass="stat-savings"
            iconClass="fa-solid fa-piggy-bank"
            label="Saved/Invested"
            value={formatCurrency(summaryStats.totalSavings + summaryStats.totalInvestments)}
            metaText="Lifetime secured"
            onClick={() => setActiveDetail('savings')}
          />
        </div>
      )}
    </section>
  );
};

export default DashboardStats;
