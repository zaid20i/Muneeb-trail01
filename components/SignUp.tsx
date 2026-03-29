import React, { useState, useCallback } from 'react';
import DateInput from './common/DateInput';
import { isValidDDMMYYYYDate } from '../utils/dateUtils';
// Local type and enum definitions for SignUp form

type FormData = {
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    gender: Gender | null;
    street: string;
    suburb: string;
    state: AustralianState | null;
    zipCode: string;
    licenseType: LicenseType | null;
    otherLicenseCountry: string;
    licenseNumber: string;
    licenseExpiry: string;
    licenseState: AustralianState | null;
    licenseFront: File | null;
    licenseBack: File | null;
    proofOfAddress: File | null;
    email: string;
    password: string;
};

enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other',
}

enum LicenseType {
    AUSTRALIA = 'Australia',
    INTERNATIONAL = 'International',
}

enum AustralianState {
    VIC = 'VIC',
    WA = 'WA',
    NSW = 'NSW',
    QLD = 'QLD',
    SA = 'SA',
    TAS = 'TAS',
    ACT = 'ACT',
    NT = 'NT',
}

// Helper Icon components
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);


// Reusable Form Control Components
interface InputFieldProps {
  label: string;
  id: keyof FormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  Icon?: React.ElementType;
  EndIcon?: React.ElementType;
  onEndIconClick?: () => void;
  isDateField?: boolean;
}



// Phone Number Input Component
const PhoneInput: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}> = ({ label, id, value, onChange, placeholder, required = false }) => {
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, '');
    
    // Format as 0400 000 000
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted += digitsOnly.substring(0, 4);
      if (digitsOnly.length > 4) {
        formatted += ' ' + digitsOnly.substring(4, 7);
        if (digitsOnly.length > 7) {
          formatted += ' ' + digitsOnly.substring(7, 10);
        }
      }
    }
    
    // Create event with formatted value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted,
        name: id
      }
    };
    
    onChange(newEvent);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-lg shadow-sm">
        <input
          type="text"
          name={id}
          id={id}
          value={value}
          onChange={handlePhoneInput}
          placeholder={placeholder}
          required={required}
          className="block w-full rounded-lg border-gray-300 py-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-base px-4"
          maxLength={12}
          inputMode="numeric"
        />
      </div>
    </div>
  );
};

// Postcode Input Component
const PostcodeInput: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}> = ({ label, id, value, onChange, placeholder, required = false }) => {
  const handlePostcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-digits and limit to 4 digits
    const digitsOnly = input.replace(/\D/g, '').substring(0, 4);
    
    // Create event with formatted value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: digitsOnly,
        name: id
      }
    };
    
    onChange(newEvent);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-lg shadow-sm">
        <input
          type="text"
          name={id}
          id={id}
          value={value}
          onChange={handlePostcodeInput}
          placeholder={placeholder}
          required={required}
          className="block w-full rounded-lg border-gray-300 py-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-base px-4"
          maxLength={4}
          inputMode="numeric"
        />
      </div>
    </div>
  );
};

// Text Input Component (Names, addresses, etc.)
const TextInput: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  Icon?: React.ElementType;
  EndIcon?: React.ElementType;
  onEndIconClick?: () => void;
}> = ({ label, id, value, onChange, placeholder, required = false, type = "text", Icon, EndIcon, onEndIconClick }) => {
  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // For names, only allow letters, spaces, hyphens, and apostrophes
    if (id.includes('Name') || id === 'firstName' || id === 'middleName' || id === 'lastName') {
      inputValue = inputValue.replace(/[^a-zA-Z\s\-']/g, '');
    }
    
    // Create event with cleaned value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: inputValue,
        name: id
      }
    };
    
    onChange(newEvent);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            {React.createElement(Icon, { className: "h-5 w-5 text-gray-400" })}
          </div>
        )}
        
        <input
          type={type}
          name={id}
          id={id}
          value={value}
          onChange={handleTextInput}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border-gray-300 py-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-base ${Icon ? 'pl-10' : 'px-4'} ${EndIcon ? 'pr-12' : 'pr-4'}`}
        />
        
        {EndIcon && (
          <button
              type="button"
              onClick={onEndIconClick}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label={type === 'password' ? 'Show password' : 'Hide password'}
          >
            {React.createElement(EndIcon, { className: "h-5 w-5" })}
          </button>
        )}
      </div>
    </div>
  );
};

const InputField: React.FC<InputFieldProps> = ({ label, id, value, onChange, placeholder, type = "text", required = false, Icon, EndIcon, onEndIconClick, isDateField = false }) => {
  // Use specialized components based on field type
  if (isDateField) {
    return (
      <DateInput
        label={label}
        name={id as string}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        isExpiryDate={id === 'licenseExpiry'}
      />
    );
  }

  // Phone number field
  if (id === 'phoneNumber') {
    return (
      <PhoneInput
        label={label}
        id={id as string}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    );
  }

  // Postcode field
  if (id === 'zipCode') {
    return (
      <PostcodeInput
        label={label}
        id={id as string}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    );
  }

  // All other text fields (names, addresses, email, password, license numbers)
  return (
    <TextInput
      label={label}
      id={id as string}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      type={type}
      Icon={Icon}
      EndIcon={EndIcon}
      onEndIconClick={onEndIconClick}
    />
  );

};

interface SelectFieldProps<T extends string> {
  label: string;
  id: keyof FormData;
  value: T | '';
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: object;
  required?: boolean;
}

const SelectField = <T extends string,>({ label, id, value, onChange, options, required = false }: SelectFieldProps<T>) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full rounded-lg border-gray-300 py-3 pl-4 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
    >
      <option value="" disabled>Select {label}</option>
      {Object.values(options).map((optionValue) => (
        <option key={optionValue} value={optionValue}>{optionValue}</option>
      ))}
    </select>
  </div>
);


interface FileUploadFieldProps {
    label: string;
    id: keyof FormData;
    fileName: string | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({ label, id, fileName, onChange, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">
            <label
                htmlFor={id}
                className="relative flex justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-400 transition-colors duration-200"
            >
                <div className="space-y-2 text-center">
                    {fileName ? (
                        <>
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm">
                                <p className="font-semibold text-green-600">{fileName}</p>
                                <p className="text-gray-500">Click to change file</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="text-sm">
                                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Click to upload
                                </span>
                                <p className="text-gray-500">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        </>
                    )}
                </div>
                <input id={id} name={id} type="file" className="sr-only" onChange={onChange} required={required} accept=".png,.jpg,.jpeg,.pdf" />
            </label>
        </div>
    </div>
);

interface SignUpFormProps {
    onSuccess: () => void;
    onSignup?: (formData: FormData) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSignup }) => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        phoneNumber: '',
        gender: null,
        street: '',
        suburb: '',
        state: null,
        zipCode: '',
        licenseType: null,
        otherLicenseCountry: '',
        licenseNumber: '',
        licenseExpiry: '',
        licenseState: null,
        licenseFront: null,
        licenseBack: null,
        proofOfAddress: null,
        email: '',
        password: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'zipCode') {
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length <= 4) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
            }
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Removed duplicate validateDate function - using isValidDDMMYYYYDate from utils

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate dates
        if (!isValidDDMMYYYYDate(formData.dateOfBirth)) {
            alert('Please enter a valid date of birth in DD-MM-YYYY format.');
            return;
        }
        
        if (formData.licenseExpiry && !isValidDDMMYYYYDate(formData.licenseExpiry)) {
            alert('Please enter a valid license expiry date in DD-MM-YYYY format.');
            return;
        }
        
                // Call onSignup if provided (for auto-login after registration)
        if (onSignup) {
            onSignup(formData);
        } else {
            alert('Registration successful! You will now be redirected to the login screen.');
            onSuccess();
        }
    };

    return (
        <div className="bg-white rounded-2xl w-full">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Driver Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- Personal Information Section --- */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="First Name" id="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
                        <InputField label="Middle Name" id="middleName" value={formData.middleName} onChange={handleChange} placeholder="Michael" />
                        <InputField label="Last Name" id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <InputField label="Date of Birth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder="DD-MM-YYYY" type="text" required isDateField />
                        <InputField label="Phone Number" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="0400 000 000" type="tel" required />
                        <SelectField label="Gender" id="gender" value={formData.gender ?? ''} onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value === '' ? null : e.target.value as Gender }))} options={Gender} />
                    </div>
                </div>

                {/* --- Address Information Section --- */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Address Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <InputField label="Street Address" id="street" value={formData.street} onChange={handleChange} placeholder="123 Main Street" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="md:col-span-1">
                            <InputField label="Suburb" id="suburb" value={formData.suburb} onChange={handleChange} placeholder="Melbourne" />
                        </div>
                        <SelectField label="State" id="state" value={formData.state ?? ''} onChange={e => setFormData(prev => ({ ...prev, state: e.target.value === '' ? null : e.target.value as AustralianState }))} options={AustralianState} />
                        <div className="md:col-span-1">
                            <InputField label="Postcode" id="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="3000" type="tel" />
                        </div>
                    </div>
                </div>
                 
                {/* --- Account Credentials Section --- */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <LockIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        Account Credentials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Email Address" id="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" type="email" required Icon={MailIcon} />
                        <InputField 
                            label="Password" 
                            id="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="Create a strong password" 
                            type={showPassword ? 'text' : 'password'}
                            required 
                            Icon={LockIcon}
                            EndIcon={showPassword ? EyeOffIcon : EyeIcon}
                            onEndIconClick={() => setShowPassword(prev => !prev)}
                        />
                    </div>
                </div>
                 
                {/* --- License Information Section --- */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        Driver's License Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                License Type<span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="radio"
                                        name="licenseType"
                                        value={LicenseType.AUSTRALIA}
                                        checked={formData.licenseType === LicenseType.AUSTRALIA}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        required
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700">Australian License</span>
                                </label>
                                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="radio"
                                        name="licenseType"
                                        value={LicenseType.INTERNATIONAL}
                                        checked={formData.licenseType === LicenseType.INTERNATIONAL}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700">International License</span>
                                </label>
                            </div>
                        </div>
                        
                        {formData.licenseType === LicenseType.AUSTRALIA && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                                <InputField label="License Number" id="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="123456789" required />
                                <InputField label="Expiry Date" id="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} type="text" placeholder="DD-MM-YYYY" required isDateField />
                                <SelectField label="Issuing State" id="licenseState" value={formData.licenseState ?? ''} onChange={e => setFormData(prev => ({ ...prev, licenseState: e.target.value === '' ? null : e.target.value as AustralianState }))} options={AustralianState} required />
                            </div>
                        )}

                        {formData.licenseType === LicenseType.INTERNATIONAL && (
                            <div className="space-y-4 animate-fade-in">
                                <InputField label="Country of Issue" id="otherLicenseCountry" value={formData.otherLicenseCountry} onChange={handleChange} placeholder="United States" required />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="License Number" id="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="ABC123456" required />
                                    <InputField label="Expiry Date" id="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} type="text" placeholder="DD-MM-YYYY" required isDateField />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Document Uploads Section --- */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Required Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FileUploadField label="License Front" id="licenseFront" fileName={formData.licenseFront?.name || null} onChange={handleFileChange} required />
                        <FileUploadField label="License Back" id="licenseBack" fileName={formData.licenseBack?.name || null} onChange={handleFileChange} required />
                        <FileUploadField label="Proof of Address" id="proofOfAddress" fileName={formData.proofOfAddress?.name || null} onChange={handleFileChange} required />
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        * Accepted formats: PNG, JPG, PDF (max 10MB each)
                    </p>
                </div>

                {/* --- Submit Button --- */}
                <div className="pt-6">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        Complete Registration
                    </button>
                </div>
            </form>
            <style>
                {`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
};

export default SignUpForm;
