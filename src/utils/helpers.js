import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
  return format(dateObj, formatString);
};

export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const dateObj = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
  
  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm');
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
};

// Currency formatting
export const formatCurrency = (amount, currency = 'INR') => {
  if (!amount || isNaN(amount)) return '₹0';
  
  const numAmount = parseFloat(amount);
  
  if (currency === 'INR') {
    return `₹${numAmount.toLocaleString('en-IN')}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(numAmount);
};

// String utilities
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// File utilities
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isPDFFile = (filename) => {
  return getFileExtension(filename) === 'pdf';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Status utilities
export const getStatusColor = (status, type = 'enquiry') => {
  const statusColors = {
    enquiry: {
      'New': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Follow-up Required': 'bg-orange-100 text-orange-800',
      'Assessment Completed': 'bg-purple-100 text-purple-800',
      'Application Submitted': 'bg-indigo-100 text-indigo-800',
      'Admitted': 'bg-green-100 text-green-800',
      'Visa Applied': 'bg-cyan-100 text-cyan-800',
      'Visa Approved': 'bg-emerald-100 text-emerald-800',
      'Departed': 'bg-gray-100 text-gray-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    },
    application: {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Additional Documents Required': 'bg-orange-100 text-orange-800',
      'Interview Scheduled': 'bg-purple-100 text-purple-800',
      'Decision Pending': 'bg-indigo-100 text-indigo-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Waitlisted': 'bg-yellow-100 text-yellow-800',
      'Deferred': 'bg-gray-100 text-gray-800'
    },
    payment: {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Paid': 'bg-green-100 text-green-800',
      'Partially Paid': 'bg-blue-100 text-blue-800',
      'Refunded': 'bg-purple-100 text-purple-800',
      'Failed': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    },
    assessment: {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-orange-100 text-orange-800',
      'Cancelled': 'bg-red-100 text-red-800'
    }
  };
  
  return statusColors[type]?.[status] || 'bg-gray-100 text-gray-800';
};

// Search and filter utilities
export const searchInObject = (obj, searchTerm) => {
  const term = searchTerm.toLowerCase();
  
  const searchInValue = (value) => {
    if (typeof value === 'string') {
      return value.toLowerCase().includes(term);
    } else if (typeof value === 'number') {
      return value.toString().includes(term);
    } else if (Array.isArray(value)) {
      return value.some(item => searchInValue(item));
    } else if (value && typeof value === 'object') {
      return Object.values(value).some(v => searchInValue(v));
    }
    return false;
  };
  
  return Object.values(obj).some(value => searchInValue(value));
};

export const filterArrayByMultipleCriteria = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '') return true;
      
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      
      return item[key] === value;
    });
  });
};

// Progress calculation utilities
export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getProgressColor = (percentage) => {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-blue-500';
  if (percentage >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Local storage utilities
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

// Export utilities
export const downloadAsCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Error handling utilities
export const handleAsyncError = async (asyncFunction, errorMessage = 'An error occurred') => {
  try {
    return await asyncFunction();
  } catch (error) {
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};