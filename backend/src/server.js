require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3333'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: "SpendWise backend is running"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
