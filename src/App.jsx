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
import AuthScreen from './components/AuthScreen';
import { useAuth } from './context/AuthContext';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from './api/transactions';

const App = () => {
  const { currentUser, loading: authLoading } = useAuth();
  
  const [expenses, setExpenses] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
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
    // Legacy localStorage data fallback check removed.
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setLoadingTransactions(true);
      getTransactions()
        .then(data => {
          if (data && data.transactions) {
            setExpenses(data.transactions);
          }
        })
        .catch(err => {
          console.error("Failed to load transactions", err);
          showToast("Failed to load transactions", "error");
        })
        .finally(() => setLoadingTransactions(false));
    }
  }, [currentUser]);

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
    // Import functionality is disabled because data is now managed by the backend
    showToast('Import functionality is disabled in the cloud version.', 'warning');
  };

  const handleClearAll = () => {
    // Clear all functionality is disabled to prevent accidental cloud data loss
    showToast('Clear all data functionality is disabled in the cloud version.', 'warning');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteExpenseId) return;
    try {
      await deleteTransaction(deleteExpenseId);
      const newExpenses = expenses.filter(e => e.id !== deleteExpenseId);
      setExpenses(newExpenses);
      setDeleteExpenseId(null);
      showToast('Transaction deleted successfully', 'success');
      if (editExpenseId === deleteExpenseId) {
        setEditExpenseId(null);
        setExpenseToEdit(null);
      }
    } catch (error) {
      showToast(error.message || 'Failed to delete transaction', 'error');
      setDeleteExpenseId(null);
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

  const handleSaveExpense = async (savedExpense, isEdit) => {
    try {
      // Backend expects 'date' formatted as a string/Date but frontend provides it. Ensure correct fields
      const payload = {
        amount: Number(savedExpense.amount),
        type: savedExpense.type,
        category: savedExpense.category,
        description: savedExpense.description,
        date: savedExpense.date
      };

      let returnedTransaction;
      
      if (isEdit) {
        const res = await updateTransaction(savedExpense.id, payload);
        returnedTransaction = res.transaction;
        const newExpenses = expenses.map(e => e.id === savedExpense.id ? returnedTransaction : e);
        setExpenses(newExpenses);
        
        showToast('Transaction updated successfully!', 'success');
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
        const res = await createTransaction(payload);
        returnedTransaction = res.transaction;
        setExpenses([returnedTransaction, ...expenses]);
        showToast(`Added ₹${returnedTransaction.amount.toFixed(2)} for ${returnedTransaction.category}`, 'success');
      }
      
      setEditExpenseId(null);
      setExpenseToEdit(null);
    } catch (error) {
      showToast(error.message || 'Failed to save transaction', 'error');
    }
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

  if (authLoading) {
    return <div className="auth-screen"><div className="auth-container"><h2>Loading SpendWise...</h2></div></div>;
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

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

          {loadingTransactions ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading your transactions...
            </div>
          ) : (
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
          )}

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
