/**
 * Centralized Date Utilities for DD-MM-YYYY Format
 * All date operations in the application should use these utilities
 */

// Types
export interface DateInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
  label?: string;
  min?: string;
}

// Constants
export const DATE_FORMAT = 'DD-MM-YYYY';
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const DDMMYYYY_DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

/**
 * Converts DD-MM-YYYY string to YYYY-MM-DD (ISO format)
 * Used for internal storage and API calls
 */
export const convertDDMMYYYYToISO = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 10) return '';
  const [day, month, year] = dateStr.split('-');
  if (!day || !month || !year || year.length !== 4) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Converts YYYY-MM-DD (ISO format) to DD-MM-YYYY
 * Used for display purposes
 */
export const convertISOToDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Validates if a DD-MM-YYYY date string is valid
 */
export const isValidDDMMYYYYDate = (dateStr: string): boolean => {
  if (!dateStr || dateStr.length !== 10) return false;
  if (!DDMMYYYY_DATE_REGEX.test(dateStr)) return false;
  
  const [day, month, year] = dateStr.split('-').map(Number);
  if (!day || !month || !year) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Check if date is actually valid (e.g., no Feb 30th)
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
};

/**
 * Formats any date input to DD-MM-YYYY for display
 * Handles various input formats
 */
export const formatDateForDisplay = (dateStr: string | undefined | null): string => {
  if (!dateStr) return 'N/A';
  
  // If already in DD-MM-YYYY format
  if (DDMMYYYY_DATE_REGEX.test(dateStr)) {
    return isValidDDMMYYYYDate(dateStr) ? dateStr : 'N/A';
  }
  
  // If in ISO format (YYYY-MM-DD)
  if (ISO_DATE_REGEX.test(dateStr)) {
    return convertISOToDDMMYYYY(dateStr) || 'N/A';
  }
  
  // Try to parse as Date object
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Gets today's date in DD-MM-YYYY format
 */
export const getTodayDDMMYYYY = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Gets today's date in ISO format (YYYY-MM-DD)
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Adds/subtracts days from a DD-MM-YYYY date
 */
export const addDaysToDDMMYYYY = (dateStr: string, days: number): string => {
  if (!isValidDDMMYYYYDate(dateStr)) return '';
  
  const isoDate = convertDDMMYYYYToISO(dateStr);
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  
  return convertISOToDDMMYYYY(date.toISOString().split('T')[0]);
};

/**
 * Gets the difference in days between two DD-MM-YYYY dates
 */
export const getDaysBetweenDDMMYYYY = (startDate: string, endDate: string): number => {
  if (!isValidDDMMYYYYDate(startDate) || !isValidDDMMYYYYDate(endDate)) return 0;
  
  const startISO = convertDDMMYYYYToISO(startDate);
  const endISO = convertDDMMYYYYToISO(endDate);
  
  const start = new Date(startISO);
  const end = new Date(endISO);
  
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Compares two DD-MM-YYYY dates
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDDMMYYYYDates = (date1: string, date2: string): number => {
  if (!isValidDDMMYYYYDate(date1) || !isValidDDMMYYYYDate(date2)) return 0;
  
  const iso1 = convertDDMMYYYYToISO(date1);
  const iso2 = convertDDMMYYYYToISO(date2);
  
  if (iso1 < iso2) return -1;
  if (iso1 > iso2) return 1;
  return 0;
};



/**
 * Formats a DD-MM-YYYY date to YYYY-MM-DD for HTML date input compatibility
 */
export const formatForHTMLDateInput = (ddmmyyyyDate: string): string => {
  return convertDDMMYYYYToISO(ddmmyyyyDate);
};

/**
 * Converts HTML date input (YYYY-MM-DD) to DD-MM-YYYY
 */
export const formatFromHTMLDateInput = (htmlDate: string): string => {
  return convertISOToDDMMYYYY(htmlDate);
};



/**
 * Age calculation from DD-MM-YYYY date of birth
 */
export const calculateAge = (dateOfBirth: string): number => {
  if (!isValidDDMMYYYYDate(dateOfBirth)) return 0;
  
  const isoDate = convertDDMMYYYYToISO(dateOfBirth);
  const dob = new Date(isoDate);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
};



 