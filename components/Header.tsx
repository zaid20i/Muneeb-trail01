import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
        Vehicle Lease Agreement
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        Northern Autohub Rentals Pty Ltd
      </p>
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Important:</strong> Please read all terms and conditions carefully before signing. 
          This agreement is legally binding and outlines your responsibilities as a vehicle lessee.
        </p>
      </div>
    </div>
  );
};

export default Header; 