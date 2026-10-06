export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getCategoryEmoji = (category) => {
  const emojis = {
    Food: '🍔',
    Travel: '✈️',
    Shopping: '🛍️',
    Bills: '💡',
    Entertainment: '🎬',
    Health: '💊',
    Education: '📚',
    Salary: '💰',
    Business: '🏢',
    Gift: '🎁',
    'Other Income': '💵',
    Bank: '🏦',
    Stocks: '📈',
    'Mutual Funds': '📊',
    Crypto: '🪙',
    Other: '✨'
  };
  return emojis[category] || '🏷️';
};

export const getPaymentIconClass = (method) => {
  const icons = {
    UPI: 'fa-solid fa-mobile-screen',
    Cash: 'fa-solid fa-money-bill-wave',
    'Debit Card': 'fa-solid fa-credit-card',
    'Credit Card': 'fa-regular fa-credit-card',
    Other: 'fa-solid fa-wallet'
  };
  return icons[method] || 'fa-solid fa-wallet';
};

export const getTodayDateString = () => {
  const today = new Date();
  const tzOffset = today.getTimezoneOffset() * 60000;
  return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
};

export const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tzOffset = yesterday.getTimezoneOffset() * 60000;
  return (new Date(yesterday.getTime() - tzOffset)).toISOString().split('T')[0];
};

export const getCurrentYearMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return year + '-' + month;
};

export const getPreviousYearMonthString = () => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); 
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  return year + '-' + String(month).padStart(2, '0');
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const formatMonthYear = (yearMonthStr) => {
  if (!yearMonthStr) return '';
  const parts = yearMonthStr.split('-');
  if (parts.length !== 2) return yearMonthStr;
  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;
  if (monthIndex >= 0 && monthIndex < 12 && !isNaN(year)) {
    return MONTH_NAMES[monthIndex] + ' ' + year;
  }
  return yearMonthStr;
};
