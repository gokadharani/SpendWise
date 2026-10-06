import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import { DailySummary, MonthlySummary } from './components/DailyMonthlySummary';
import BudgetSection from './components/BudgetSection';
import ExpenseForm from './components/ExpenseForm';
import AnalyticsCharts from './components/AnalyticsCharts';
import SearchFilters from './components/SearchFilters';
import ExpenseHistory from './components/ExpenseHistory';
import SettingsSection from './components/SettingsSection';
import MobileNavigation from './components/MobileNavigation';
import DesktopNavigation from './components/DesktopNavigation';
import { DeleteModal, DetailsModal } from './components/Modals';
import ToastContainer from './components/ToastContainer';
import { formatMonthYear } from './utils';

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  
  // Filtering state
  const [filters, setFilters] = useState({
    search: '',
    category: 'ALL',
    payment: 'ALL',
    month: 'ALL',
    date: '',
    sortBy: 'date-desc'
  });

  // Mobile View state
  const [activeView, setActiveView] = useState('home');

  // Desktop View state
  const [desktopView, setDesktopView] = useState('dashboard');

  // Modal states
  const [detailsExpenseId, setDetailsExpenseId] = useState(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState(null);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [historyScrollPos, setHistoryScrollPos] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Initial Load
    try {
      const savedExpenses = localStorage.getItem('spendwise_expenses') || localStorage.getItem('expenses');
      if (savedExpenses) {
        const parsed = JSON.parse(savedExpenses);
        if (Array.isArray(parsed)) setExpenses(parsed);
      }
      const savedBudget = localStorage.getItem('spendwise_budget');
      if (savedBudget) {
        setBudget(parseFloat(savedBudget));
      }
    } catch (e) {
      console.error('Error loading data', e);
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-mobile-view', activeView);
  }, [activeView]);

  useEffect(() => {
    document.body.setAttribute('data-desktop-view', desktopView);
  }, [desktopView]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, closing: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, closing: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3200);
  };

  const handleImport = (newExpenses, newBudget) => {
    setExpenses(newExpenses);
    setBudget(newBudget);
    localStorage.setItem('spendwise_expenses', JSON.stringify(newExpenses));
    localStorage.setItem('spendwise_budget', newBudget.toString());
  };

  const handleClearAll = () => {
    setExpenses([]);
    setBudget(0);
    localStorage.removeItem('spendwise_expenses');
    localStorage.removeItem('spendwise_budget');
    localStorage.removeItem('expenses');
  };

  const handleDeleteConfirm = () => {
    if (!deleteExpenseId) return;
    const newExpenses = expenses.filter(e => e.id !== deleteExpenseId);
    setExpenses(newExpenses);
    localStorage.setItem('spendwise_expenses', JSON.stringify(newExpenses));
    setDeleteExpenseId(null);
    showToast('Expense deleted successfully', 'success');
    if (editExpenseId === deleteExpenseId) {
      setEditExpenseId(null);
      setExpenseToEdit(null);
    }
  };

  const handleDetailsEditClick = (id) => {
    setDetailsExpenseId(null); // close details modal
    setEditExpenseId(id);
    const exp = expenses.find(e => e.id === id);
    if (exp) {
      setHistoryScrollPos(window.scrollY);
      setExpenseToEdit(exp);
      setActiveView('add'); // switch to form on mobile
      setDesktopView('add'); // switch to form on desktop
      const formRoot = document.querySelector('.form-column');
      if (formRoot) {
        setTimeout(() => formRoot.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    }
  };

  const handleDetailsDeleteClick = (id) => {
    setDetailsExpenseId(null);
    setDeleteExpenseId(id);
  };

  const handleSaveExpense = (savedExpense, isEdit) => {
    let newExpenses;
    if (isEdit) {
      newExpenses = expenses.map(e => e.id === savedExpense.id ? savedExpense : e);
      showToast('Expense updated successfully!', 'success');
      setActiveView('history');
      setDesktopView('history');
      setTimeout(() => {
        const oldExp = expenses.find(e => e.id === savedExpense.id);
        if (oldExp && oldExp.date !== savedExpense.date) {
          const editedElement = document.getElementById(`expense-${savedExpense.id}`);
          if (editedElement) {
            editedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          window.scrollTo({ top: historyScrollPos, behavior: 'instant' });
        }
      }, 50);
    } else {
      newExpenses = [savedExpense, ...expenses];
      showToast(`Added ₹${savedExpense.amount.toFixed(2)} for ${savedExpense.category}`, 'success');
    }
    setExpenses(newExpenses);
    localStorage.setItem('spendwise_expenses', JSON.stringify(newExpenses));
    setEditExpenseId(null);
    setExpenseToEdit(null);
  };

  const filteredAndSortedExpenses = useMemo(() => {
    // 1. Calculate running balances chronologically using the complete dataset
    const chronological = [...expenses].sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return expenses.indexOf(b) - expenses.indexOf(a); // older items first
    });

    const balanceMap = new Map();
    let currentBalance = 0;
    chronological.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      const type = exp.type || 'Expense';
      if (type === 'Income') {
        currentBalance += amt;
      } else {
        currentBalance -= amt;
      }
      balanceMap.set(exp.id, currentBalance);
    });

    // 2. Apply filters
    let filtered = expenses.map(exp => ({
      ...exp,
      runningBalance: balanceMap.get(exp.id)
    })).filter(expense => {
      if (filters.search && !(expense.description || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category !== 'ALL' && expense.category !== filters.category) return false;
      if (filters.payment !== 'ALL' && expense.paymentMethod !== filters.payment && expense.payment !== filters.payment) return false;
      
      if (filters.month !== 'ALL' && filters.month.trim() !== '') {
        const expenseMonth = expense.date ? expense.date.substring(0, 7) : '';
        const searchM = filters.month.trim().toLowerCase();
        const formatted = formatMonthYear(expenseMonth).toLowerCase();
        let match = false;
        const searchParts = searchM.split(' ').filter(Boolean);
        if (searchParts.length === 2) {
          const [sm, sy] = searchParts;
          const [fm, fy] = formatted.split(' ');
          if (fm && fy && fm.startsWith(sm) && fy.startsWith(sy)) match = true;
        } else {
          if (formatted.startsWith(searchM) || expenseMonth.startsWith(searchM)) match = true;
        }
        if (!match) return false;
      }

      if (filters.date && filters.date.trim() !== '') {
        if (!expense.date || !expense.date.includes(filters.date.trim())) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-asc':
          return a.date.localeCompare(b.date) || expenses.indexOf(b) - expenses.indexOf(a);
        case 'date-desc':
          return b.date.localeCompare(a.date) || expenses.indexOf(a) - expenses.indexOf(b);
        case 'amount-asc':
          return Number(a.amount) - Number(b.amount);
        case 'amount-desc':
          return Number(b.amount) - Number(a.amount);
        default: return 0;
      }
    });
    return filtered;
  }, [expenses, filters]);

  const isFiltered = filters.search !== '' || filters.category !== 'ALL' || filters.payment !== 'ALL' || filters.month !== 'ALL' || filters.date !== '';

  return (
    <>
      <Header showToast={showToast} />
      
      <div className="app-body">
        <DesktopNavigation activeView={desktopView} setActiveView={setDesktopView} />
        
        <main className="main-container">
          <DashboardStats expenses={expenses} />
          <DailySummary expenses={expenses} />
          <MonthlySummary expenses={expenses} />
          <BudgetSection expenses={expenses} budget={budget} setBudget={setBudget} showToast={showToast} />

          <div className="content-split-layout">
            <ExpenseForm 
              onSave={handleSaveExpense} 
              expenseToEdit={expenseToEdit} 
              onCancelEdit={() => { setEditExpenseId(null); setExpenseToEdit(null); }} 
              showToast={showToast} 
            />
            
            <section className="list-and-charts-column">
              <AnalyticsCharts expenses={expenses} />
              <SearchFilters filters={filters} setFilters={setFilters} expenses={expenses} />
              <ExpenseHistory 
                displayedExpenses={filteredAndSortedExpenses} 
                onRowClick={(exp) => setDetailsExpenseId(exp.id)} 
                editExpenseId={editExpenseId} 
                isFiltered={isFiltered}
              />
            </section>
          </div>

          <SettingsSection 
            showToast={showToast} 
            onImport={handleImport} 
            onClearAll={handleClearAll} 
            expenses={expenses} 
            budget={budget} 
          />
        </main>
      </div>

      <DeleteModal 
        isOpen={!!deleteExpenseId} 
        onCancel={() => setDeleteExpenseId(null)} 
        onConfirm={handleDeleteConfirm} 
      />

      <DetailsModal 
        isOpen={!!detailsExpenseId} 
        expense={expenses.find(e => e.id === detailsExpenseId)} 
        onClose={() => setDetailsExpenseId(null)} 
        onEdit={handleDetailsEditClick} 
        onDelete={handleDetailsDeleteClick} 
      />

      <ToastContainer toasts={toasts} />
      <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
    </>
  );
};

export default App;
