/**
 * validateSchema.js
 * 
 * Strict schema-based input validator.
 * Rejects payloads containing fields that do not match type, length, or format rules.
 */

// Basic email regex matching RFC standards
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Standard Indian mobile number regex (10 digits starting with 5-9)
const PHONE_REGEX = /^[5-9]\d{9}$/;

// Indian pincode regex (exactly 6 digits)
const PINCODE_REGEX = /^\d{6}$/;

// Allowed characters in customer name to prevent XSS and injections
const NAME_REGEX = /^[a-zA-Z\s\-.'\u00C0-\u00FF]+$/;

// ISO Date format YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a request body against a schema descriptor.
 * Returns an error string if validation fails, or null if successful.
 */
function validateSchema(data, schema) {
  if (!data || typeof data !== 'object') {
    return 'Invalid request payload structure.';
  }

  for (const field in schema) {
    const rules = schema[field];
    const value = data[field];

    // Check if field is required
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `Field "${field}" is required.`;
    }

    // Skip further validation if optional field is omitted/empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rules.type === 'string') {
      if (typeof value !== 'string') {
        return `Field "${field}" must be a string.`;
      }
      const trimmed = value.trim();

      // Length validations
      if (rules.min !== undefined && trimmed.length < rules.min) {
        return `Field "${field}" must be at least ${rules.min} characters.`;
      }
      if (rules.max !== undefined && trimmed.length > rules.max) {
        return `Field "${field}" must not exceed ${rules.max} characters.`;
      }

      // Format validations
      if (rules.format === 'email' && !EMAIL_REGEX.test(trimmed)) {
        return `Field "${field}" must be a valid email address.`;
      }
      if (rules.format === 'phone' && !PHONE_REGEX.test(trimmed)) {
        return `Field "${field}" must be a valid 10-digit mobile number.`;
      }
      if (rules.format === 'pincode' && !PINCODE_REGEX.test(trimmed)) {
        return `Field "${field}" must be a valid 6-digit PIN code.`;
      }
      if (rules.format === 'name' && !NAME_REGEX.test(trimmed)) {
        return `Field "${field}" contains invalid characters.`;
      }
      if (rules.format === 'date') {
        if (!DATE_REGEX.test(trimmed)) {
          return `Field "${field}" must be a valid date in YYYY-MM-DD format.`;
        }
        const parsed = Date.parse(trimmed);
        if (isNaN(parsed)) {
          return `Field "${field}" is not a valid calendar date.`;
        }
      }
    } else if (rules.type === 'number') {
      if (typeof value !== 'number' || isNaN(value)) {
        return `Field "${field}" must be a number.`;
      }
      if (rules.integer && !Number.isInteger(value)) {
        return `Field "${field}" must be an integer.`;
      }
      if (rules.min !== undefined && value < rules.min) {
        return `Field "${field}" must be at least ${rules.min}.`;
      }
      if (rules.max !== undefined && value > rules.max) {
        return `Field "${field}" must not exceed ${rules.max}.`;
      }
    } else if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        return `Field "${field}" must be an array.`;
      }
      if (rules.min !== undefined && value.length < rules.min) {
        return `Field "${field}" must contain at least ${rules.min} items.`;
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      return `Field "${field}" must be one of: ${rules.enum.join(', ')}.`;
    }
  }

  // Reject unexpected fields to prevent parameter injection
  for (const key in data) {
    if (!schema[key]) {
      return `Unexpected parameter "${key}" in request body.`;
    }
  }

  return null;
}

module.exports = { validateSchema };
