export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getCategoryColor = (category) => {
  const colors = {
    Soda: 'badge-blue',
    Juice: 'badge-green',
    Milk: 'badge-yellow',
    Curd: 'badge-purple',
    Buttermilk: 'badge-gold',
    Water: 'badge-blue',
    'Ice Cream': 'badge-red',
    Other: 'badge-blue',
  };
  return colors[category] || 'badge-blue';
};

export const getProductEmoji = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('lemon') || lower.includes('soda')) return '🍋';
  if (lower.includes('buttermilk')) return '🥛';
  if (lower.includes('curd')) return '🍶';
  if (lower.includes('mint')) return '🌿';
  if (lower.includes('cola')) return '🥤';
  if (lower.includes('water')) return '💧';
  if (lower.includes('juice')) return '🧃';
  if (lower.includes('ice cream')) return '🍦';
  return '🥤';
};
