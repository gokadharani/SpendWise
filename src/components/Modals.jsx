import React from 'react';
import { formatCurrency, formatDate, getCategoryEmoji, getPaymentIconClass } from '../utils';

export const DeleteModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modalTitle" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-card">
        <div className="modal-icon-danger">
          <i className="fa-solid fa-trash-can"></i>
        </div>
        <h3 id="modalTitle" className="modal-title">Delete Expense</h3>
        <p className="modal-desc">
          Are you sure you want to delete this expense record? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
};

export const DetailsModal = ({ isOpen, expense, onClose, onEdit, onDelete }) => {
  if (!isOpen || !expense) return null;
  
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="detailsModalTitle" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card details-modal-card">
        <div className="details-modal-header">
          <h3 id="detailsModalTitle" className="modal-title">Transaction Details</h3>
          <button type="button" className="btn-icon btn-close-modal" onClick={onClose} aria-label="Close details">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="details-modal-content">
          <div className="details-view-content">
            <div className="details-amount-large">{formatCurrency(expense.amount)}</div>

            {expense.description && (
              <div className="details-row">
                <div className="details-label">Notes</div>
                <div className="details-value">{expense.description}</div>
              </div>
            )}

            <div className="details-row">
              <div className="details-label">Category</div>
              <div className="details-value">
                <span className={`category-pill cat-${expense.category}`}>
                  <span>{getCategoryEmoji(expense.category)}</span>
                  <span>{expense.category}</span>
                </span>
              </div>
            </div>

            <div className="details-row">
              <div className="details-label">Date</div>
              <div className="details-value">{formatDate(expense.date)}</div>
            </div>

            <div className="details-row">
              <div className="details-label">Payment Method</div>
              <div className="details-value">
                <span className="payment-badge">
                  <i className={getPaymentIconClass(expense.paymentMethod || expense.payment)}></i>
                  <span>{expense.paymentMethod || expense.payment}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions details-modal-actions">
          <button type="button" className="btn btn-outline" onClick={() => onEdit(expense.id)}>
            <i className="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button type="button" className="btn btn-danger" onClick={() => onDelete(expense.id)}>
            <i className="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
};
