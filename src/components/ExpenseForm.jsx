import React, { useState, useEffect } from 'react';
import { getTodayDateString } from '../utils';

const ExpenseForm = ({ onSave, expenseToEdit, onCancelEdit, showToast }) => {
  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [payment, setPayment] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expenseToEdit) {
      setType(expenseToEdit.type || 'Expense');
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category || (expenseToEdit.type === 'Income' ? 'Salary' : ''));
      setDate(expenseToEdit.date);
      setPayment(expenseToEdit.paymentMethod || expenseToEdit.payment);
      setDescription(expenseToEdit.description || '');
      setErrors({});
    } else {
      resetForm();
    }
  }, [expenseToEdit]);

  useEffect(() => {
    if (!expenseToEdit) {
      setDate(getTodayDateString());
    }
  }, [expenseToEdit]);

  const validate = () => {
    const newErrors = {};
    let isValid = true;
    if (!type) { newErrors.type = 'Please select a type.'; isValid = false; }
    if (!amount) { newErrors.amount = 'Please enter an amount.'; isValid = false; }
    else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { newErrors.amount = 'Amount must be a positive number greater than 0.'; isValid = false; }
    if (!category) { newErrors.category = 'Please select a category.'; isValid = false; }
    if (!date) { newErrors.date = 'Please select a date.'; isValid = false; }
    if (!payment) { newErrors.payment = 'Please choose a payment method.'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setType('Expense');
    setAmount('');
    setCategory('');
    setPayment('');
    setDescription('');
    setErrors({});
    setDate(getTodayDateString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors in the form.', 'danger');
      return;
    }

    const expenseAmount = parseFloat(amount);
    
    const savedExpense = {
      id: expenseToEdit ? expenseToEdit.id : 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type,
      amount: expenseAmount,
      category,
      date,
      paymentMethod: payment,
      description
    };

    onSave(savedExpense, !!expenseToEdit);
    if (!expenseToEdit) resetForm();
  };

  return (
    <aside className="form-column">
      <div className="card form-card">
        <div className="form-card-header">
          <h2 className="card-title">
            {expenseToEdit ? <><i className="fa-solid fa-pen-to-square"></i> Edit Transaction</> : <><i className="fa-solid fa-circle-plus"></i> Add New Transaction</>}
          </h2>
          <p className="card-subtitle">Keep your records detailed and up-to-date</p>
        </div>

        <form className="expense-form" noValidate onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-exchange-alt input-icon"></i>
              <select required value={type} onChange={(e) => { setType(e.target.value); setErrors({...errors, type: ''}); }}
                style={{ borderColor: errors.type ? 'var(--danger)' : '' }}>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Savings">Savings</option>
                <option value="Investment">Investment</option>
              </select>
            </div>
            <small className="form-error">{errors.type}</small>
          </div>
          <div className="form-group">
            <label>Amount (₹) <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-indian-rupee-sign input-icon"></i>
              <input type="number" placeholder="e.g. 450" min="0.01" step="any" required
                value={amount} onChange={(e) => { setAmount(e.target.value); setErrors({...errors, amount: ''}); }}
                style={{ borderColor: errors.amount ? 'var(--danger)' : '' }} />
            </div>
            <small className="form-error">{errors.amount}</small>
          </div>
          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-shapes input-icon"></i>
              <select required value={category} onChange={(e) => { setCategory(e.target.value); setErrors({...errors, category: ''}); }}
                style={{ borderColor: errors.category ? 'var(--danger)' : '' }}>
                <option value="" disabled>Select Category</option>
                {type === 'Income' ? (
                  <>
                    <option value="Salary">💰 Salary</option>
                    <option value="Business">🏢 Business</option>
                    <option value="Gift">🎁 Gift</option>
                    <option value="Other Income">💵 Other Income</option>
                  </>
                ) : type === 'Savings' || type === 'Investment' ? (
                  <>
                    <option value="Bank">🏦 Bank</option>
                    <option value="Stocks">📈 Stocks</option>
                    <option value="Mutual Funds">📊 Mutual Funds</option>
                    <option value="Crypto">🪙 Crypto</option>
                    <option value="Other">✨ Other</option>
                  </>
                ) : (
                  <>
                    <option value="Food">🍔 Food</option>
                    <option value="Travel">✈️ Travel</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Bills">💡 Bills</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Health">💊 Health</option>
                    <option value="Education">📚 Education</option>
                    <option value="Other">✨ Other</option>
                  </>
                )}
              </select>
            </div>
            <small className="form-error">{errors.category}</small>
          </div>
          <div className="form-group">
            <label>Date <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-calendar-day input-icon"></i>
              <input type="date" required value={date} onChange={(e) => { setDate(e.target.value); setErrors({...errors, date: ''}); }}
                style={{ borderColor: errors.date ? 'var(--danger)' : '' }} />
            </div>
            <small className="form-error">{errors.date}</small>
          </div>
          <div className="form-group">
            <label>Payment Method <span className="required">*</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-credit-card input-icon"></i>
              <select required value={payment} onChange={(e) => { setPayment(e.target.value); setErrors({...errors, payment: ''}); }}
                style={{ borderColor: errors.payment ? 'var(--danger)' : '' }}>
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
          <div className="form-group">
            <label>Description / Note <span className="text-muted">(Optional)</span></label>
            <div className="input-with-icon">
              <i className="fa-solid fa-pen input-icon"></i>
              <input type="text" placeholder="e.g. Grocery store run or Coffee" maxLength="100"
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <small className="form-error"></small>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">
              {expenseToEdit ? <><i className="fa-solid fa-check"></i> <span>Update Expense</span></> : <><i className="fa-solid fa-plus"></i> <span>Add Expense</span></>}
            </button>
            {expenseToEdit && (
              <button type="button" className="btn btn-secondary btn-block" onClick={onCancelEdit}>
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
