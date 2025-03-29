/**
 * Format utilities for consistent display throughout the application
 */

/**
 * Format a number as Indian Rupees (INR)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined, options: { compact?: boolean } = {}): string {
  if (amount === null || amount === undefined) return '—';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: options.compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });
  
  return formatter.format(amount);
}

/**
 * Format a date consistently throughout the application
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Format square footage with appropriate Indian units (square feet)
 * @param sqft - The square footage to format
 * @returns Formatted square footage string
 */
export function formatArea(sqft: number | null | undefined): string {
  if (sqft === null || sqft === undefined) return '—';
  
  return `${sqft.toLocaleString('en-IN')} sq.ft.`;
}