import React from 'react';
import { formatCurrency, formatDate, formatMonthYear, getTodayDateString, getYesterdayDateString, getCurrentYearMonthString, getPreviousYearMonthString } from '../utils';

export const DailySummary = ({ expenses }) => {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const todayTotal = expenses.reduce((sum, exp) => exp.date === todayStr ? sum + (Number(exp.amount) || 0) : sum, 0);
  const yesterdayTotal = expenses.reduce((sum, exp) => exp.date === yesterdayStr ? sum + (Number(exp.amount) || 0) : sum, 0);

  return (
    <section className="daily-summary-section" aria-label="Daily Spending Summary">
      <div className="daily-summary-grid">
        <div className="daily-summary-card daily-card-yesterday">
          <div className="daily-card-header">
            <div className="daily-card-icon"><i className="fa-solid fa-clock-rotate-left"></i></div>
            <div className="daily-card-title-group">
              <span className="daily-card-title">Yesterday's Expenses</span>
              <span className="daily-card-date">{formatDate(yesterdayStr)}</span>
            </div>
          </div>
          <div className="daily-card-total-row">
            <span className="daily-total-label">Total:</span>
            <span className="daily-total-amount">{formatCurrency(yesterdayTotal)}</span>
          </div>
        </div>
        <div className="daily-summary-card daily-card-today">
          <div className="daily-card-header">
            <div className="daily-card-icon"><i className="fa-solid fa-calendar-day"></i></div>
            <div className="daily-card-title-group">
              <span className="daily-card-title">Today's Expenses</span>
              <span className="daily-card-date">{formatDate(todayStr)}</span>
            </div>
          </div>
          <div className="daily-card-total-row">
            <span className="daily-total-label">Total:</span>
            <span className="daily-total-amount">{formatCurrency(todayTotal)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export const MonthlySummary = ({ expenses }) => {
  const currentYearMonth = getCurrentYearMonthString();
  const prevYearMonth = getPreviousYearMonthString();

  const thisMonthTotal = expenses.reduce((sum, exp) => (exp.date && exp.date.startsWith(currentYearMonth)) ? sum + (Number(exp.amount) || 0) : sum, 0);
  const lastMonthTotal = expenses.reduce((sum, exp) => (exp.date && exp.date.startsWith(prevYearMonth)) ? sum + (Number(exp.amount) || 0) : sum, 0);

  return (
    <section className="monthly-summary-section" aria-label="Monthly Spending Summary">
      <div className="monthly-summary-grid">
        <div className="monthly-summary-card monthly-card-last">
          <div className="monthly-card-header">
            <div className="monthly-card-icon"><i className="fa-solid fa-calendar-minus"></i></div>
            <div className="monthly-card-title-group">
              <span className="monthly-card-title">Last Month's Expenses</span>
              <span className="monthly-card-date">{formatMonthYear(prevYearMonth)}</span>
            </div>
          </div>
          <div className="monthly-card-total-row">
            <span className="monthly-total-label">Total:</span>
            <span className="monthly-total-amount">{formatCurrency(lastMonthTotal)}</span>
          </div>
        </div>
        <div className="monthly-summary-card monthly-card-current">
          <div className="monthly-card-header">
            <div className="monthly-card-icon"><i className="fa-solid fa-calendar-check"></i></div>
            <div className="monthly-card-title-group">
              <span className="monthly-card-title">This Month's Expenses</span>
              <span className="monthly-card-date">{formatMonthYear(currentYearMonth)}</span>
            </div>
          </div>
          <div className="monthly-card-total-row">
            <span className="monthly-total-label">Total:</span>
            <span className="monthly-total-amount">{formatCurrency(thisMonthTotal)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
