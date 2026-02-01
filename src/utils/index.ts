/**
 * Safely decode a URI component, returning the original value if decoding fails
 */
export const safeDecode = (value: string | undefined | null): string => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * Safely encode a URI component
 */
export const safeEncode = (value: string): string => {
  try {
    return encodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * Delay execution for a specified number of milliseconds
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 500
): Promise<T | null> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await delay(baseDelayMs * Math.pow(2, attempt));
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
};

/**
 * Format a distance in miles to a readable string
 */
export const formatDistance = (distanceMiles: number, decimals: number = 2): string =>
  `${distanceMiles.toFixed(decimals)} miles`;

/**
 * Truncate a string to a maximum length with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
};

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert allergen key to display label
 */
export const formatAllergenLabel = (key: string): string => {
  return key
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Get error message from unknown error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};
