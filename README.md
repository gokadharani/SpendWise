# SpendWise
Smart Personal Expense Tracker

SpendWise is a responsive personal expense tracking web application that helps users record, manage, filter, and analyze their daily expenses. It has recently been fully migrated to a clean, component-based React architecture.

## Features
- Add new expenses
- Edit existing expenses
- Delete expenses
- Store expenses using browser localStorage
- Search expenses
- Filter expenses by month and category
- Sort expenses
- View total expenses and monthly spending
- Track today's and yesterday's expenses
- Compare current and previous month spending
- Set and track a monthly budget
- View spending analytics and charts
- Responsive design for desktop and mobile devices
- Settings for exporting, importing, and clearing data
- Form validation and Toast notifications
- Dark/light mode theme toggling
- Mobile bottom navigation

## Technologies Used
- React
- Vite
- JavaScript (ES6+)
- HTML5
- CSS3
- Chart.js / react-chartjs-2
- Browser localStorage API

## React Architecture
The application has been fully migrated from Vanilla JavaScript to a modern React stack. The UI, logic, and state management have been re-architected into modular, reusable React components. 

Core Components include:
- `App.jsx` - Main state container and layout orchestrator.
- `ExpenseForm.jsx` - Form to add and edit expenses.
- `ExpenseHistory.jsx` - Displays the categorized list of transactions.
- `Header.jsx` - Top navigation and theme toggling.
- `DashboardStats.jsx` - Top-level financial summaries.
- `AnalyticsCharts.jsx` - Integration with Chart.js to visualize spending.
- `BudgetSection.jsx` - Budget planner and progress bar.
- `SearchFilters.jsx` - Controls for searching and sorting data.
- `SettingsSection.jsx` - Data export/import and reset functionality.
- `MobileNavigation.jsx` - Bottom navigation bar for mobile views.
- `Modals.jsx` - Confirmation and detail view modals.
- `ToastContainer.jsx` - Custom notification system.
- `DailyMonthlySummary.jsx` - Additional summarized metrics.

## Project Structure
```
SpendWise/
├── index.html
├── package.json
├── style.css
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── utils.js
    └── components/
        ├── AnalyticsCharts.jsx
        ├── BudgetSection.jsx
        ├── DailyMonthlySummary.jsx
        ├── DashboardStats.jsx
        ├── ExpenseForm.jsx
        ├── ExpenseHistory.jsx
        ├── Header.jsx
        ├── MobileNavigation.jsx
        ├── Modals.jsx
        ├── SearchFilters.jsx
        ├── SettingsSection.jsx
        ├── StatCard.jsx
        └── ToastContainer.jsx
```

## How to Run

1. Clone or download the repository.
2. Open the project folder in your terminal.
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the displayed local URL in your browser.

To verify the production build, run:
```bash
npm run build
```

## Data Storage
SpendWise stores expense data in the browser's `localStorage` under the `spendwise_expenses` key (and `spendwise_budget` for the budget). This means the data is stored locally on the user's device/browser and does not require a backend database.

## Future Improvements
- Multiple currency support
- Global/localized currency handling
- User authentication
- Backend/database integration
- Improved analytics and reporting

## Author
Dharani Goka
GitHub: [https://github.com/gokadharani](https://github.com/gokadharani)
