import React, { useState, useMemo, useCallback } from 'react';
import { Payment, PaymentStatus, Driver, Vehicle } from '../types';
import { formatDateForDisplay, getTodayDDMMYYYY } from '../utils/dateUtils';

const statusColors: Record<PaymentStatus, string> = {
    [PaymentStatus.Paid]: 'bg-green-100 text-green-800',
    [PaymentStatus.Due]: 'bg-blue-100 text-blue-800',
    [PaymentStatus.Overdue]: 'bg-yellow-100 text-yellow-800',
};

const FilterButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
            isActive 
                ? 'bg-brand-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
    >
        {label}
    </button>
);

interface PaymentManagementProps {
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    drivers: Driver[];
    vehicles: Vehicle[];
}



const PaymentManagement: React.FC<PaymentManagementProps> = ({ payments, setPayments, drivers, vehicles }) => {
    const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const getDriverName = useCallback((driverId: string) => {
        return drivers.find(d => d.id === driverId)?.name || 'Unknown Driver';
    }, [drivers]);

    const getVehicleRego = useCallback((vehicleId: string) => {
        return vehicles.find(v => v.id === vehicleId)?.rego || 'N/A';
    }, [vehicles]);
    
    const handleMarkAsPaid = (paymentId: string) => {
        setPayments(prevPayments => prevPayments.map(p => 
            p.id === paymentId 
                ? { ...p, status: PaymentStatus.Paid, paymentDate: getTodayDDMMYYYY() } 
                : p
        ));
    };

    const filteredPayments = useMemo(() => {
        let tempPayments = [...payments];
        const lowercasedTerm = searchTerm.toLowerCase();

        // Filter by status first
        if (filter !== 'all') {
            tempPayments = tempPayments.filter(p => p.status === filter);
        }

        // Then filter by search term
        if (lowercasedTerm) {
            tempPayments = tempPayments.filter(p => {
                const driver = drivers.find(d => d.id === p.driverId);
                const vehicle = vehicles.find(v => v.id === p.vehicleId);

                const driverMatch = driver ? driver.name.toLowerCase().includes(lowercasedTerm) : false;
                const regoMatch = vehicle ? vehicle.rego.toLowerCase().includes(lowercasedTerm) : false;
                
                return driverMatch || regoMatch;
            });
        }
        
        return tempPayments;
    }, [payments, filter, searchTerm, drivers, vehicles]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h3 className="text-xl font-semibold text-slate-800">Payment Tracking</h3>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full">
                        <FilterButton label="All" isActive={filter === 'all'} onClick={() => setFilter('all')} />
                        <FilterButton label="Due" isActive={filter === PaymentStatus.Due} onClick={() => setFilter(PaymentStatus.Due)} />
                        <FilterButton label="Overdue" isActive={filter === PaymentStatus.Overdue} onClick={() => setFilter(PaymentStatus.Overdue)} />
                        <FilterButton label="Paid" isActive={filter === PaymentStatus.Paid} onClick={() => setFilter(PaymentStatus.Paid)} />
                    </div>
                     <div className="relative">
                        <input
                            type="text"
                            placeholder="Search driver or rego..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="p-2 border rounded-md w-64 pl-9"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b bg-slate-50">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-slate-600">Driver</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Vehicle Rego</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Amount</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Due Date</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Payment Date</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map(payment => (
                            <tr key={payment.id} className="border-b hover:bg-slate-50">
                                <td className="p-3 text-slate-800 font-medium">{getDriverName(payment.driverId)}</td>
                                <td className="p-3 text-slate-700 font-mono">{getVehicleRego(payment.vehicleId)}</td>
                                <td className="p-3 text-slate-700">${payment.amount.toLocaleString()}</td>
                                <td className="p-3 text-slate-700">{formatDateForDisplay(payment.dueDate)}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[payment.status]}`}>{payment.status}</span>
                                </td>
                                <td className="p-3 text-slate-700">
                                    {payment.paymentDate ? formatDateForDisplay(payment.paymentDate) : <span className="text-slate-400">N/A</span>}
                                </td>
                                <td className="p-3">
                                    {payment.status !== PaymentStatus.Paid && (
                                        <button 
                                            onClick={() => handleMarkAsPaid(payment.id)}
                                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                        >
                                            Mark as Paid
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentManagement;
