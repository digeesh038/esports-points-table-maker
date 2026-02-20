import { format, formatDistance, parseISO } from 'date-fns';
import { DATE_FORMATS } from './constants';

// Format date
export const formatDate = (date, formatStr = DATE_FORMATS.SHORT) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr);
    } catch (error) {
        console.error('Date formatting error:', error);
        return '';
    }
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistance(dateObj, new Date(), { addSuffix: true });
    } catch (error) {
        console.error('Relative time formatting error:', error);
        return '';
    }
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format number with commas
export const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString();
};

// Generate random color
export const generateRandomColor = () => {
    const colors = [
        '#00f0ff', // Neon Blue
        '#a855f7', // Neon Purple
        '#ec4899', // Neon Pink
        '#10b981', // Neon Green
        '#fbbf24', // Neon Yellow
        '#f97316', // Orange
        '#06b6d4', // Cyan
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

// Debounce function
export const debounce = (func, wait = 300) => {
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

// Deep clone object
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
};

// Sort array of objects by key
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
};

// Group array by key
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

// Get unique values from array
export const unique = (array, key) => {
    if (!key) {
        return [...new Set(array)];
    }
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

// Sleep/delay function
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate UUID
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate email
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Validate URL
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
    }
};

// Format file size
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
};

// Get status badge class
export const getStatusClass = (status) => {
    const statusMap = {
        upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        ongoing: 'bg-green-500/20 text-green-400 border-green-500/50 animate-pulse',
        completed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
        live: 'bg-green-500/20 text-green-400 border-green-500/50 animate-pulse',
        scheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    };
    return statusMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
};

// Calculate win rate
export const calculateWinRate = (wins, total) => {
    if (!total || total === 0) return 0;
    return Math.round((wins / total) * 100);
};

// Format duration
export const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
};

export default {
    formatDate,
    formatRelativeTime,
    truncateText,
    capitalizeFirst,
    formatNumber,
    generateRandomColor,
    getInitials,
    calculatePercentage,
    debounce,
    deepClone,
    isEmpty,
    sortBy,
    groupBy,
    unique,
    sleep,
    generateId,
    isValidEmail,
    isValidUrl,
    copyToClipboard,
    formatFileSize,
    getStatusClass,
    calculateWinRate,
    formatDuration,
};