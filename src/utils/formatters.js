export const formatCurrency = (value) => {
  if (!value) return '0';
  
  // Convert to number if string
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  // Format with Indian numbering system (lakhs and crores)
  const formatter = Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  
  return formatter.format(number);
};

export const formatArea = (value) => {
  if (!value) return '0';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-IN').format(number);
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};