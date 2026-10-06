import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsSection = ({ showToast, onImport, onClearAll, expenses, budget }) => {
  const fileInputRef = useRef(null);
  const { currentUser, logout } = useAuth();

  const handleExport = () => {
    try {
      const dataToExport = {
        expenses: expenses || [],
        monthlyBudget: budget || 0
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spendwise-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
    } catch (e) {
      showToast('Failed to export data', 'danger');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data || typeof data !== 'object') throw new Error('Imported data must be an object.');
        if (!Array.isArray(data.expenses)) throw new Error('Imported data must contain an expenses array.');
        if (typeof data.monthlyBudget !== 'number' || data.monthlyBudget < 0) throw new Error('Imported data must contain a valid non-negative monthlyBudget.');
        
        if (window.confirm('Are you sure you want to replace all existing data with this backup? This action cannot be undone.')) {
          onImport(data.expenses, data.monthlyBudget);
          showToast('Data imported successfully!', 'success');
        }
      } catch (err) {
        showToast(err.message || 'Invalid backup file.', 'danger');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to permanently delete all expenses and reset your monthly budget? This action cannot be undone unless you have an exported backup.')) {
      onClearAll();
      showToast('All data has been cleared successfully.', 'success');
    }
  };

  return (
    <section className="settings-section hidden-desktop" aria-labelledby="settings-heading">
      <div className="settings-header">
        <h2 id="settings-heading" className="settings-title">
          <i className="fa-solid fa-gear"></i> Settings
        </h2>
        <p className="settings-subtitle">Manage your SpendWise preferences</p>
      </div>
      
      <div className="settings-cards-grid">
        <div className="card settings-card">
          <h3 className="card-title">Appearance</h3>
          <p className="card-subtitle">Theme and styling options</p>
          <div className="settings-item">
            <span className="settings-label">Theme</span>
            <span className="settings-value">Use header button to toggle</span>
          </div>
        </div>

        <div className="card settings-card">
          <h3 className="card-title">Preferences</h3>
          <p className="card-subtitle">App behavior and formats</p>
          <div className="settings-item">
            <span className="settings-label">Currency</span>
            <span className="settings-value">INR (₹)</span>
          </div>
        </div>

        <div className="card settings-card">
          <h3 className="card-title">Data Management</h3>
          <p className="card-subtitle">Export, import, and clear your data</p>
          <div className="settings-actions">
            <button className="btn btn-outline btn-block" onClick={handleExport}><i className="fa-solid fa-file-export"></i> Export Data</button>
            <button className="btn btn-outline btn-block" onClick={handleImportClick}><i className="fa-solid fa-file-import"></i> Import Data</button>
            <button className="btn btn-danger btn-block" onClick={handleClearAll}><i className="fa-solid fa-trash-can"></i> Clear All Data</button>
          </div>
          <input type="file" accept=".json,application/json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>

        <div className="card settings-card">
          <h3 className="card-title">Account Profile</h3>
          <p className="card-subtitle">Manage your account sessions</p>
          {currentUser && (
            <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span className="settings-label">Logged in as {currentUser.name}</span>
              <span className="settings-value">{currentUser.email}</span>
            </div>
          )}
          <div className="settings-actions" style={{ marginTop: '1rem' }}>
            <button className="btn btn-outline btn-block" onClick={logout}><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsSection;
