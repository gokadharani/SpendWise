import React from 'react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand">
          <div className="brand-icon">
            <i className="fa-solid fa-wallet"></i>
          </div>
          <div>
            <h1 className="brand-title">SpendWise</h1>
            <p className="brand-subtitle">Smart Personal Expense Tracker</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Quick Currency Indicator */}
          <span className="currency-badge">
            <i className="fa-solid fa-indian-rupee-sign"></i> INR (₹)
          </span>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          {/* Note: ID is slightly changed to avoid conflict with the existing Vanilla JS button during transition */}
          <button id="reactThemeToggleBtn" className="theme-toggle-btn" aria-label="Toggle light and dark mode"
            title="Toggle Theme">
            <i className="fa-solid fa-moon theme-icon-moon"></i>
            <i className="fa-solid fa-sun theme-icon-sun"></i>
            <span className="theme-label">Dark Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
