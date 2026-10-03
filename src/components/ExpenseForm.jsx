import React, { useState, useEffect } from 'react';

const ExpenseForm = ({ expenses, setExpenses }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [payment, setPayment] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  // Set default date to today on mount
  useEffect(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    setDate(localISOTime);
  }, []);

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!amount) {
      newErrors.amount = 'Please enter an expense amount.';
      isValid = false;
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number greater than 0.';
      isValid = false;
    }

    if (!category) {
      newErrors.category = 'Please select an expense category.';
      isValid = false;
    }

    if (!date) {
      newErrors.date = 'Please select a date.';
      isValid = false;
    }

    if (!payment) {
      newErrors.payment = 'Please choose a payment method.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      if (window.showToast) window.showToast('Please fix the errors in the form.', 'danger');
      return;
    }

    const savedData = localStorage.getItem('spendwise_expenses') || localStorage.getItem('expenses');
    let updatedExpenses = [];
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) updatedExpenses = parsed;
      } catch (err) {}
    }

    const expenseAmount = parseFloat(amount);
    
    if (isEditing) {
      // EDIT EXPENSE
      const index = updatedExpenses.findIndex(item => item.id === editId);
      if (index !== -1) {
        updatedExpenses[index] = {
          ...updatedExpenses[index],
          amount: expenseAmount,
          category,
          date,
          paymentMethod: payment,
          description
        };
        localStorage.setItem('spendwise_expenses', JSON.stringify(updatedExpenses));
        
        // Update React state
        if (setExpenses) setExpenses(updatedExpenses);

        // Sync with Vanilla JS by telling it to reload from localStorage
        if (window.loadExpenses) {
          window.loadExpenses();
        }
        
        handleCancelEdit();
        if (window.showToast) window.showToast('Expense updated successfully!', 'success');
        if (window.renderExpenses) window.renderExpenses();
      } else {
        if (window.showToast) window.showToast('Error: Expense record not found.', 'danger');
      }
    } else {
      // ADD EXPENSE
      const newExpense = {
        id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        amount: expenseAmount,
        category,
        date,
        paymentMethod: payment,
        description
      };

      updatedExpenses.unshift(newExpense);
      localStorage.setItem('spendwise_expenses', JSON.stringify(updatedExpenses));
      
      // Update React state
      if (setExpenses) setExpenses(updatedExpenses);

      // Sync with Vanilla JS by telling it to reload from localStorage
      if (window.loadExpenses) {
        window.loadExpenses();
      }

      resetForm();
      if (window.renderExpenses) window.renderExpenses();
      if (window.showToast) window.showToast(`Added ₹${expenseAmount.toFixed(2)} for ${category}`, 'success');
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setPayment('');
    setDescription('');
    setErrors({});
    
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    setDate(localISOTime);
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
    setEditId('');
    if (window.highlightEditingRow) window.highlightEditingRow(null);
  };

  // Allow Vanilla JS to trigger React edit mode
  useEffect(() => {
    // We can expose a global function that Vanilla JS can call to trigger edit in React
    window.startReactEdit = (id) => {
      const savedData = localStorage.getItem('spendwise_expenses') || localStorage.getItem('expenses');
      let expenses = [];
      if (savedData) {
        try {
          expenses = JSON.parse(savedData);
        } catch (err) {}
      }
      
      const expense = expenses.find(item => item.id === id);
      if (expense) {
        setIsEditing(true);
        setEditId(expense.id);
        setAmount(expense.amount);
        setCategory(expense.category);
        setDate(expense.date);
        setPayment(expense.paymentMethod || expense.payment);
        setDescription(expense.description || '');
        setErrors({});
        
        if (window.highlightEditingRow) window.highlightEditingRow(expense.id);
        
        if (window.switchMobileView) {
          window.switchMobileView('add');
        }
        
        // Scroll to form
        const formRoot = document.getElementById('react-expense-form-root');
        if (formRoot) {
          setTimeout(() => {
            formRoot.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }
      }
    };
    
    // Override the vanilla startEdit
    if (window.startEdit) {
      window.startEdit = window.startReactEdit;
    }
  }, []);

  return (
    <aside className="form-column">
      <div className="card form-card">
        <div className="form-card-header">
          <h2 className="card-title">
            {isEditing ? (
              <><i className="fa-solid fa-pen-to-square"></i> Edit Expense</>
            ) : (
              <><i className="fa-solid fa-circle-plus"></i> Add New Expense</>
            )}
          </h2>
          <p className="card-subtitle">Keep your records detailed and up-to-date</p>
        </div>

        <form className="expense-form" noValidate onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="form-group">
            <label htmlFor="reactExpenseAmount">Amount (₹) <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-indian-rupee-sign input-icon"></i>
              <input 
                type="number" 
                id="reactExpenseAmount" 
                placeholder="e.g. 450" 
                min="0.01"
                step="any" 
                required
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors({...errors, amount: ''}); }}
                style={{ borderColor: errors.amount ? 'var(--danger)' : '' }}
              />
            </div>
            <small className="form-error">{errors.amount}</small>
          </div>

          {/* Category Select */}
          <div className="form-group">
            <label htmlFor="reactExpenseCategory">Category <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-shapes input-icon"></i>
              <select 
                id="reactExpenseCategory" 
                required
                value={category}
                onChange={(e) => { setCategory(e.target.value); setErrors({...errors, category: ''}); }}
                style={{ borderColor: errors.category ? 'var(--danger)' : '' }}
              >
                <option value="" disabled>Select Category</option>
                <option value="Food">🍔 Food</option>
                <option value="Travel">✈️ Travel</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Bills">💡 Bills</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Health">💊 Health</option>
                <option value="Education">📚 Education</option>
                <option value="Other">✨ Other</option>
              </select>
            </div>
            <small className="form-error">{errors.category}</small>
          </div>

          {/* Date Input */}
          <div className="form-group">
            <label htmlFor="reactExpenseDate">Date <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-calendar-day input-icon"></i>
              <input 
                type="date" 
                id="reactExpenseDate" 
                required
                value={date}
                onChange={(e) => { setDate(e.target.value); setErrors({...errors, date: ''}); }}
                style={{ borderColor: errors.date ? 'var(--danger)' : '' }}
              />
            </div>
            <small className="form-error">{errors.date}</small>
          </div>

          {/* Payment Method Select */}
          <div className="form-group">
            <label htmlFor="reactExpensePayment">Payment Method <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-credit-card input-icon"></i>
              <select 
                id="reactExpensePayment" 
                required
                value={payment}
                onChange={(e) => { setPayment(e.target.value); setErrors({...errors, payment: ''}); }}
                style={{ borderColor: errors.payment ? 'var(--danger)' : '' }}
              >
                <option value="" disabled>Select Payment Method</option>
                <option value="UPI">📱 UPI</option>
                <option value="Cash">💵 Cash</option>
                <option value="Debit Card">💳 Debit Card</option>
                <option value="Credit Card">💳 Credit Card</option>
                <option value="Other">🌐 Other</option>
              </select>
            </div>
            <small className="form-error">{errors.payment}</small>
          </div>

          {/* Description / Note Input */}
          <div className="form-group">
            <label htmlFor="reactExpenseDescription">Description / Note <span className="text-muted">(Optional)</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-pen input-icon"></i>
              <input 
                type="text" 
                id="reactExpenseDescription" 
                placeholder="e.g. Grocery store run or Coffee" 
                maxLength="100"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <small className="form-error"></small>
          </div>

          {/* Form Action Buttons */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">
              {isEditing ? (
                <><i className="fa-solid fa-check"></i> <span>Update Expense</span></>
              ) : (
                <><i className="fa-solid fa-plus"></i> <span>Add Expense</span></>
              )}
            </button>
            {isEditing && (
              <button 
                type="button" 
                className="btn btn-secondary btn-block" 
                onClick={handleCancelEdit}
              >
                <i className="fa-solid fa-xmark"></i> Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </aside>
  );
};

export default ExpenseForm;
