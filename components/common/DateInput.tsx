import React from 'react';
import { 
  formatForHTMLDateInput,
  formatFromHTMLDateInput,
  DateInputProps,
  getTodayDDMMYYYY,
  isValidDDMMYYYYDate,
  compareDDMMYYYYDates
} from '../../utils/dateUtils';

/**
 * Simple DateInput component with calendar picker
 * Automatically opens calendar when clicked, no manual typing allowed
 */
interface EnhancedDateInputProps extends DateInputProps {
  isExpiryDate?: boolean; // Whether this is an expiry date (cannot be in the past)
  max?: string; // Maximum date in DD-MM-YYYY format
  showValidation?: boolean; // Whether to show validation messages
}

const DateInput: React.FC<EnhancedDateInputProps> = ({ 
  name, 
  value, 
  onChange, 
  className = '', 
  required = false, 
  label,
  min,
  max,
  isExpiryDate = false,
  showValidation = true
}) => {
  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatFromHTMLDateInput(e.target.value);
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: formattedDate
      }
    };
    
    onChange(syntheticEvent);
  };

  // Set minimum date for expiry dates or use provided min
  const todayForMin = getTodayDDMMYYYY();
  const effectiveMin = isExpiryDate ? formatForHTMLDateInput(todayForMin) : (min ? formatForHTMLDateInput(min) : undefined);
  const effectiveMax = max ? formatForHTMLDateInput(max) : undefined;
  
  // Validation logic
  const getValidationMessage = (): string | null => {
    if (!value || !showValidation) return null;
    
    if (!isValidDDMMYYYYDate(value)) {
      return 'Please enter a valid date in DD-MM-YYYY format';
    }
    
    if (isExpiryDate && compareDDMMYYYYDates(value, todayForMin) < 0) {
      return 'Expiry date cannot be in the past';
    }
    
    if (min && compareDDMMYYYYDates(value, min) < 0) {
      return `Date cannot be before ${min}`;
    }
    
    if (max && compareDDMMYYYYDates(value, max) > 0) {
      return `Date cannot be after ${max}`;
    }
    
    return null;
  };
  
  const validationMessage = getValidationMessage();
  const hasError = validationMessage !== null;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {isExpiryDate && <span className="text-blue-500 ml-1">(Expiry)</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="date"
          name={name}
          value={value ? formatForHTMLDateInput(value) : ''}
          onChange={handleCalendarChange}
          min={effectiveMin}
          max={effectiveMax}
          className={`
            w-full p-3 border rounded-lg text-sm
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-1
            cursor-pointer
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${className}
          `}
          required={required}
          title="Click to open calendar"
          aria-label={`Calendar picker for ${label || 'date'}`}
        />
      </div>
      
      {/* Validation message */}
      {validationMessage && showValidation && (
        <div className="text-xs mt-2 text-red-600 font-medium">
          ⚠️ {validationMessage}
        </div>
      )}
      
      {/* Helper text for expiry dates when no error */}
      {isExpiryDate && !hasError && (
        <div className="text-xs mt-2 text-blue-600">
          💡 Select a date that is today or later
        </div>
      )}
    </div>
  );
};

export default DateInput; 
