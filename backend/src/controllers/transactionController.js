const prisma = require('../prisma');

// Helper to format transaction for response
const formatTransaction = (tx) => ({
  ...tx,
  amount: tx.amount.toNumber(),
});

const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    const validTypes = ['Income', 'Expense', 'Savings', 'Investment'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Type must be one of: ${validTypes.join(', ')}` });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ success: false, message: 'Category is required and must be a string' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        category,
        description: description || null,
        date: parsedDate,
      },
    });

    res.status(201).json({
      success: true,
      transaction: formatTransaction(transaction),
    });
  } catch (error) {
    console.error('Error in createTransaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, category, from, to } = req.query;

    const where = { userId };

    if (type) {
      const validTypes = ['Income', 'Expense', 'Savings', 'Investment'];
      if (validTypes.includes(type)) {
        where.type = type;
      }
    }

    if (category) {
      where.category = category;
    }

    if (from || to) {
      where.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          where.date.gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          where.date.lte = toDate;
        }
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.status(200).json({
      success: true,
      transactions: transactions.map(formatTransaction),
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      transaction: formatTransaction(transaction),
    });
  } catch (error) {
    console.error('Error in getTransaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, type, category, description, date } = req.body;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const dataToUpdate = {};

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
      }
      dataToUpdate.amount = amount;
    }

    if (type !== undefined) {
      const validTypes = ['Income', 'Expense', 'Savings', 'Investment'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ success: false, message: `Type must be one of: ${validTypes.join(', ')}` });
      }
      dataToUpdate.type = type;
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || !category) {
        return res.status(400).json({ success: false, message: 'Category must be a non-empty string' });
      }
      dataToUpdate.category = category;
    }

    if (description !== undefined) {
      dataToUpdate.description = description || null;
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
      dataToUpdate.date = parsedDate;
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({
      success: true,
      transaction: formatTransaction(updatedTransaction),
    });
  } catch (error) {
    console.error('Error in updateTransaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
