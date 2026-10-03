import React, { useMemo } from 'react';
import { formatCurrency, formatDate, getCategoryEmoji, getPaymentIconClass } from '../utils';

const ExpenseHistory = ({ displayedExpenses, onRowClick, editExpenseId, isFiltered }) => {
  const displayedTotal = useMemo(() => {
    return displayedExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [displayedExpenses]);

  const grouped = useMemo(() => {
    const map = {};
    const orderedDates = [];
    displayedExpenses.forEach(exp => {
      const d = exp.date || 'Unknown';
      if (!map[d]) {
        map[d] = [];
        orderedDates.push(d);
      }
      map[d].push(exp);
    });
    return orderedDates.map(dateStr => ({
      dateStr,
      items: map[dateStr]
    }));
  }, [displayedExpenses]);

  const getHumanDate = (dateStr) => {
    if (dateStr === 'Unknown') return dateStr;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return formatDate(dateStr);
  };

  return (
    <div className="card expenses-card">
      <div className="expenses-card-header">
        <div>
          <h2 className="card-title">
            <i className="fa-solid fa-clock-rotate-left"></i> Expense History
          </h2>
          <p className="card-subtitle">
            Showing <span className="badge badge-accent">{displayedExpenses.length}</span> expenses
          </p>
        </div>
        <div className="filtered-total-box">
          <span className="filtered-total-label">Total:</span>
          <span className="filtered-total-value">{formatCurrency(displayedTotal)}</span>
        </div>
      </div>

      {displayedExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="fa-solid fa-receipt"></i>
          </div>
          <h3 className="empty-state-title">No expenses found</h3>
          <p className="empty-state-desc">
            {isFiltered 
              ? "No expenses match your search or filter criteria. Click 'Reset' to view all expenses."
              : "You haven't recorded any expenses yet. Use the form on the left to add your first expense!"}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <div className="transaction-history">
            {grouped.map(group => (
              <div key={group.dateStr} className="transaction-date-group">
                <h4 className="transaction-date-header">{getHumanDate(group.dateStr)}</h4>
                <div className="transaction-items">
                  {group.items.map(expense => (
                    <div 
                      key={expense.id} 
                      id={`expense-${expense.id}`}
                      className={`transaction-item ${editExpenseId === expense.id ? 'row-editing' : ''}`}
                      onClick={() => onRowClick(expense)}
                    >
                      <div className="transaction-left">
                        <div className={`transaction-icon cat-${expense.category}`}>
                          {getCategoryEmoji(expense.category)}
                        </div>
                        <div className="transaction-info">
                          <div className="transaction-desc">
                            {expense.description ? expense.description : <span className="text-muted">—</span>}
                          </div>
                          <div className="transaction-meta">
                            <span>{expense.category}</span>
                            <span className="meta-dot">•</span>
                            <span><i className={getPaymentIconClass(expense.paymentMethod || expense.payment)}></i> {expense.paymentMethod || expense.payment}</span>
                          </div>
                        </div>
                      </div>
                      <div className="transaction-right">
                        <div className="transaction-amount">{formatCurrency(expense.amount)}</div>
                        <i className="fa-solid fa-chevron-right transaction-chevron"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory;
