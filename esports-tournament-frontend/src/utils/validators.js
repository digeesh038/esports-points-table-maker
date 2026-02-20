// Validation rules
export const validators = {
    required: (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'This field is required';
        }
        return null;
    },

    email: (value) => {
        if (!value) return null;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
            return 'Please enter a valid email address';
        }
        return null;
    },

    minLength: (min) => (value) => {
        if (!value) return null;
        if (value.length < min) {
            return `Must be at least ${min} characters`;
        }
        return null;
    },

    maxLength: (max) => (value) => {
        if (!value) return null;
        if (value.length > max) {
            return `Must be no more than ${max} characters`;
        }
        return null;
    },

    password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(value)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(value)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(value)) {
            return 'Password must contain at least one number';
        }
        return null;
    },

    confirmPassword: (password) => (value) => {
        if (!value) return 'Please confirm your password';
        if (value !== password) {
            return 'Passwords do not match';
        }
        return null;
    },

    url: (value) => {
        if (!value) return null;
        try {
            new URL(value);
            return null;
        } catch {
            return 'Please enter a valid URL';
        }
    },

    number: (value) => {
        if (!value) return null;
        if (isNaN(value)) {
            return 'Must be a valid number';
        }
        return null;
    },

    min: (min) => (value) => {
        if (!value) return null;
        if (Number(value) < min) {
            return `Must be at least ${min}`;
        }
        return null;
    },

    max: (max) => (value) => {
        if (!value) return null;
        if (Number(value) > max) {
            return `Must be no more than ${max}`;
        }
        return null;
    },

    date: (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return 'Please enter a valid date';
        }
        return null;
    },

    futureDate: (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (date <= new Date()) {
            return 'Date must be in the future';
        }
        return null;
    },

    pastDate: (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (date >= new Date()) {
            return 'Date must be in the past';
        }
        return null;
    },

    teamName: (value) => {
        if (!value) return 'Team name is required';
        if (value.length < 3) {
            return 'Team name must be at least 3 characters';
        }
        if (value.length > 50) {
            return 'Team name must be no more than 50 characters';
        }
        if (!/^[a-zA-Z0-9\s-_]+$/.test(value)) {
            return 'Team name can only contain letters, numbers, spaces, hyphens, and underscores';
        }
        return null;
    },

    username: (value) => {
        if (!value) return 'Username is required';
        if (value.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (value.length > 20) {
            return 'Username must be no more than 20 characters';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        return null;
    },
};

// Validate form data
export const validateForm = (data, rules) => {
    const errors = {};

    Object.keys(rules).forEach(field => {
        const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
        const value = data[field];

        for (const rule of fieldRules) {
            const error = rule(value);
            if (error) {
                errors[field] = error;
                break; // Stop at first error for this field
            }
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Validate single field
export const validateField = (value, rules) => {
    const fieldRules = Array.isArray(rules) ? rules : [rules];

    for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
            return error;
        }
    }

    return null;
};

export default {
    validators,
    validateForm,
    validateField,
};