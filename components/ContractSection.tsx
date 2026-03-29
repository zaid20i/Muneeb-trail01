import React from 'react';

interface ContractSectionProps {
  title: string;
  children: React.ReactNode;
}

const ContractSection: React.FC<ContractSectionProps> = ({ title, children }) => {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-800/50">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default ContractSection; 