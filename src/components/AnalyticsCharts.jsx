import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { formatCurrency, formatMonthYear } from '../utils';

const AnalyticsCharts = ({ expenses }) => {
  const categoryChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const paymentChartRef = useRef(null);

  const categoryChartInstance = useRef(null);
  const trendChartInstance = useRef(null);
  const paymentChartInstance = useRef(null);

  useEffect(() => {
    // Make Chart.js inherit the app's dynamic text color hierarchy
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#666';
    Chart.defaults.color = textColor;

    const expenseOnly = expenses.filter(exp => !exp.type || exp.type === 'Expense');

    // 1. Category Chart
    if (categoryChartInstance.current) categoryChartInstance.current.destroy();
    if (!expenseOnly.length) {
      categoryChartInstance.current = new Chart(categoryChartRef.current, {
        type: 'doughnut',
        data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '70%' }
      });
    } else {
      const categoryTotals = {};
      expenseOnly.forEach(exp => {
        const cat = exp.category || 'Uncategorized';
        const amt = Number(exp.amount) || 0;
        if (amt > 0) categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      });
      const labels = Object.keys(categoryTotals);
      const data = Object.values(categoryTotals);
      if (labels.length === 0) {
        categoryChartInstance.current = new Chart(categoryChartRef.current, { type: 'doughnut', data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '70%' }});
      } else {
        const bg = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#6366f1'];
        categoryChartInstance.current = new Chart(categoryChartRef.current, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: bg, borderWidth: 1, borderColor: '#ffffff' }] },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '65%',
            plugins: {
              legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } },
              tooltip: { callbacks: { label: (ctx) => ` ${ctx.label || ''}: ${formatCurrency(ctx.raw || 0)}` } }
            }
          }
        });
      }
    }

    // 2. Trend Chart
    if (trendChartInstance.current) trendChartInstance.current.destroy();
    if (!expenseOnly.length) {
      trendChartInstance.current = new Chart(trendChartRef.current, {
        type: 'line', data: { labels: ['No Data'], datasets: [{ data: [0], borderColor: '#e5e7eb', borderWidth: 2, pointBackgroundColor: '#e5e7eb' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
      });
    } else {
      const monthlyTotals = {};
      expenseOnly.forEach(exp => {
        const amt = Number(exp.amount) || 0;
        if (amt > 0 && exp.date) {
          const monthStr = exp.date.substring(0, 7);
          monthlyTotals[monthStr] = (monthlyTotals[monthStr] || 0) + amt;
        }
      });
      const months = Object.keys(monthlyTotals).sort();
      if (months.length === 0) {
         trendChartInstance.current = new Chart(trendChartRef.current, { type: 'line', data: { labels: ['No Data'], datasets: [{ data: [0], borderColor: '#e5e7eb', borderWidth: 2, pointBackgroundColor: '#e5e7eb' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }});
      } else {
        const formattedLabels = months.map(m => formatMonthYear(m));
        const data = months.map(m => monthlyTotals[m]);
        trendChartInstance.current = new Chart(trendChartRef.current, {
          type: 'line',
          data: { labels: formattedLabels, datasets: [{ label: 'Total Spent', data, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, tension: 0.3, fill: true, pointBackgroundColor: '#ffffff', pointBorderColor: '#3b82f6', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6 }] },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${formatCurrency(ctx.raw || 0)}` } } },
            scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: (val) => formatCurrency(val) } } }
          }
        });
      }
    }

    // 3. Payment Chart
    if (paymentChartInstance.current) paymentChartInstance.current.destroy();
    if (!expenseOnly.length) {
      paymentChartInstance.current = new Chart(paymentChartRef.current, {
        type: 'pie', data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '0%' }
      });
    } else {
      const paymentTotals = {};
      expenseOnly.forEach(exp => {
        const method = exp.paymentMethod || exp.payment || 'Uncategorized';
        const amt = Number(exp.amount) || 0;
        if (amt > 0) paymentTotals[method] = (paymentTotals[method] || 0) + amt;
      });
      const labels = Object.keys(paymentTotals);
      const data = Object.values(paymentTotals);
      if (labels.length === 0) {
        paymentChartInstance.current = new Chart(paymentChartRef.current, { type: 'pie', data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '0%' }});
      } else {
        const bg = ['#f97316', '#84cc16', '#0ea5e9', '#d946ef', '#f43f5e', '#eab308', '#22c55e', '#6366f1', '#a855f7', '#ec4899'];
        paymentChartInstance.current = new Chart(paymentChartRef.current, {
          type: 'pie',
          data: { labels, datasets: [{ data, backgroundColor: bg, borderWidth: 1, borderColor: '#ffffff' }] },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '0%',
            plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label || ''}: ${formatCurrency(ctx.raw || 0)}` } } }
          }
        });
      }
    }
  }, [expenses]);

  return (
    <div className="card charts-card">
      <div className="charts-header">
        <div>
          <h2 className="card-title"><i className="fa-solid fa-chart-simple"></i> Spending Analytics</h2>
          <p className="card-subtitle">Visual representation of your financial habits</p>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-box">
          <h3 className="chart-title">Breakdown by Category</h3>
          <div className="chart-canvas-wrapper"><canvas ref={categoryChartRef}></canvas></div>
        </div>
        <div className="chart-box">
          <h3 className="chart-title">Monthly Spending Trend</h3>
          <div className="chart-canvas-wrapper"><canvas ref={trendChartRef}></canvas></div>
        </div>
        <div className="chart-box">
          <h3 className="chart-title">Spending by Payment Method</h3>
          <div className="chart-canvas-wrapper"><canvas ref={paymentChartRef}></canvas></div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
