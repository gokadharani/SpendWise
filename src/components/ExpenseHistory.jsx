import React, { useMemo } from 'react';

const ExpenseHistory = ({ expenses = [] }) => {
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(num);
  };

  const getHumanDate = (dateStr) => {
    if (!dateStr || dateStr === 'Unknown') return dateStr || 'Unknown';
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    
    // Fallback: DD MMM, YYYY
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const formatted = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // Replace default non-breaking spaces if they appear or format to "DD MMM, YYYY"
    const [day, month, year] = formatted.split(' ');
    return `${day} ${month}, ${year}`; 
  };

  const groupedExpenses = useMemo(() => {
    if (!expenses.length) return [];

    // Create a copy to sort
    const sorted = [...expenses].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      const dateDiff = dateB.localeCompare(dateA); // Default: date-desc (newest -> oldest)
      if (dateDiff !== 0) return dateDiff;
      // Fallback: preserve original array insertion order
      return expenses.indexOf(a) - expenses.indexOf(b);
    });

    // Group by date
    const groups = [];
    const groupMap = {};

    sorted.forEach((exp) => {
      const d = exp.date || 'Unknown';
      if (!groupMap[d]) {
        const newGroup = {
          dateStr: d,
          humanDate: getHumanDate(d),
          items: []
        };
        groupMap[d] = newGroup;
        groups.push(newGroup);
      }
      groupMap[d].items.push(exp);
    });

    return groups;
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="react-expense-history-placeholder">
        <p>No expenses found.</p>
      </div>
    );
  }

  return (
    <div className="react-expense-history-container">
      <h3>React Expense History (Preview)</h3>
      {groupedExpenses.map((group) => (
        <div key={group.dateStr} className="react-expense-date-group" style={{ marginBottom: '20px' }}>
          <h4 style={{ borderBottom: '2px solid #eee', paddingBottom: '5px' }}>{group.humanDate}</h4>
          <ul className="react-expense-history-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
            {group.items.map((expense) => (
              <li key={expense.id} className="react-expense-item" style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                <div><strong>Description:</strong> {expense.description || '—'}</div>
                <div><strong>Category:</strong> {expense.category}</div>
                <div><strong>Payment Method:</strong> {expense.paymentMethod}</div>
                <div><strong>Amount:</strong> {formatCurrency(expense.amount)}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ExpenseHistory;
