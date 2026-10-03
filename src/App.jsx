import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import ExpenseForm from './components/ExpenseForm';
import ExpenseHistory from './components/ExpenseHistory';

const App = () => {
  const [expenses, setExpenses] = useState([]);

  // Load expenses from localStorage when App mounts
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
        console.error('Error parsing expenses in React App:', e);
      }
    };
    
    // Expose fetchExpenses to Vanilla JS for the Delete bridge
    window.refreshReactExpenses = fetchExpenses;
    
    fetchExpenses();
    
    return () => {
      delete window.refreshReactExpenses;
    };
  }, []);

  const dashboardRoot = document.getElementById('react-dashboard-root');
  const expenseFormRoot = document.getElementById('react-expense-form-root');
  const expenseHistoryRoot = document.getElementById('react-expense-history-root');

  return (
    <>
      <Header />
      {dashboardRoot && createPortal(<DashboardStats expenses={expenses} />, dashboardRoot)}
      {expenseFormRoot && createPortal(<ExpenseForm expenses={expenses} setExpenses={setExpenses} />, expenseFormRoot)}
      {expenseHistoryRoot && createPortal(<ExpenseHistory expenses={expenses} />, expenseHistoryRoot)}
    </>
  );
};

export default App;
