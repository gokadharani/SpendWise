import React, { useMemo } from 'react';
import { formatMonthYear } from '../utils';

const SearchFilters = ({ filters, setFilters, expenses }) => {
  const handleReset = () => {
    setFilters({ search: '', category: 'ALL', payment: 'ALL', month: 'ALL', date: '', sortBy: 'date-desc' });
  };

  const months = useMemo(() => {
    const monthSet = new Set();
    expenses.forEach(exp => {
      if (exp.date) {
        const yearMonth = exp.date.substring(0, 7);
        if (/^\d{4}-\d{2}$/.test(yearMonth)) monthSet.add(yearMonth);
      }
    });
    return Array.from(monthSet).sort((a, b) => a.localeCompare(b));
  }, [expenses]);

  return (
    <div className="card toolbar-card">
      <div className="toolbar-header">
        <h2 className="card-title"><i className="fa-solid fa-filter"></i> Search & Filters</h2>
        <button type="button" className="btn btn-outline btn-sm" title="Clear all filters" onClick={handleReset}>
          <i className="fa-solid fa-rotate-left"></i> Reset
        </button>
      </div>
      <div className="filter-controls-grid">
        <div className="filter-group filter-search">
          <label>Search Note</label>
          <div className="input-with-icon">
            <i className="fa-solid fa-magnifying-glass input-icon"></i>
            <input type="text" placeholder="Search by note..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
          </div>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="ALL">All Categories</option>
            <optgroup label="Income">
              <option value="Salary">Salary</option>
              <option value="Business">Business</option>
              <option value="Gift">Gift</option>
              <option value="Other Income">Other Income</option>
            </optgroup>
            <optgroup label="Expenses">
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </optgroup>
            <optgroup label="Savings & Investments">
              <option value="Bank">Bank</option>
              <option value="Stocks">Stocks</option>
              <option value="Mutual Funds">Mutual Funds</option>
              <option value="Crypto">Crypto</option>
            </optgroup>
          </select>
        </div>
        <div className="filter-group">
          <label>Payment Method</label>
          <select value={filters.payment} onChange={e => setFilters({ ...filters, payment: e.target.value })}>
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Month</label>
          <div className="input-with-icon">
            <i className="fa-solid fa-calendar-minus input-icon"></i>
            <select value={filters.month} onChange={e => {
              const newMonth = e.target.value;
              setFilters(prev => ({ ...prev, month: newMonth, date: newMonth !== 'ALL' ? '' : prev.date }));
            }}>
              <option value="ALL">All Months</option>
              {months.map(m => (
                <option key={m} value={m}>{formatMonthYear(m)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-group">
          <label>Specific Date</label>
          <div className="input-with-icon">
            <i className="fa-solid fa-calendar-day input-icon"></i>
            <input type="date" value={filters.date} onChange={e => {
              const newDate = e.target.value;
              setFilters(prev => ({ ...prev, date: newDate, month: newDate ? 'ALL' : prev.month }));
            }} />
          </div>
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select value={filters.sortBy} onChange={e => setFilters({ ...filters, sortBy: e.target.value })}>
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
