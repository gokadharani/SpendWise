import React, { useEffect, useState } from 'react';

const Header = ({ showToast }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('spendwise_theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('spendwise_theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    if (showToast) showToast(`Switched to ${newTheme} mode`, 'info');
  };

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
          <span className="currency-badge">
            <i className="fa-solid fa-indian-rupee-sign"></i> INR (₹)
          </span>

          <button 
            className="theme-toggle-btn" 
            aria-label="Toggle light and dark mode"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
          >
            <i className="fa-solid fa-moon theme-icon-moon"></i>
            <i className="fa-solid fa-sun theme-icon-sun"></i>
            <span className="theme-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
