import React, { useMemo, useState } from 'react';
import { Payment, PaymentStatus, Expense, ExpenseType, Vehicle, Driver, DriverStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatDateForDisplay } from '../utils/dateUtils';

type ReportView = 'profitability' | 'weekly' | 'driver';

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};



const EXPENSE_COLORS: Record<ExpenseType, string> = {
    [ExpenseType.Fuel]: '#3b82f6',
    [ExpenseType.Maintenance]: '#ef4444',
    [ExpenseType.Insurance]: '#f97316',
    [ExpenseType.Repairs]: '#8b5cf6',
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-brand-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
    >
        {label}
    </button>
);

const ProfitabilityReport: React.FC<{ payments: Payment[], expenses: Expense[], vehicles: Vehicle[] }> = ({ payments, expenses, vehicles }) => {
    const profitabilityData = useMemo(() => {
        return vehicles.map(vehicle => {
            const totalEarnings = payments
                .filter(p => p.vehicleId === vehicle.id && p.status === PaymentStatus.Paid)
                .reduce((acc, p) => acc + p.amount, 0);
            const totalExpenses = expenses
                .filter(e => e.vehicleId === vehicle.id)
                .reduce((acc, e) => acc + e.amount, 0);
            const netProfit = totalEarnings - totalExpenses;
            return { ...vehicle, totalEarnings, totalExpenses, netProfit };
        });
    }, [payments, expenses, vehicles]);

    const expenseBreakdownData = useMemo(() => {
        const breakdown: { [key in ExpenseType]?: number } = {};
        expenses.forEach(expense => {
            breakdown[expense.type] = (breakdown[expense.type] || 0) + expense.amount;
        });
        return Object.entries(breakdown).map(([name, value]) => ({ name: name as ExpenseType, value }));
    }, [expenses]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Vehicle Profitability Report</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-slate-600">Vehicle</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 text-right">Total Earnings</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 text-right">Total Expenses</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 text-right">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profitabilityData.map(data => (
                                <tr key={data.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3">
                                        <p className="font-bold text-slate-800">{data.make} {data.model}</p>
                                        <p className="text-sm text-slate-500 font-mono">{data.rego}</p>
                                    </td>
                                    <td className="p-3 text-green-600 text-right font-medium">{formatCurrency(data.totalEarnings)}</td>
                                    <td className="p-3 text-red-600 text-right font-medium">{formatCurrency(data.totalExpenses)}</td>
                                    <td className={`p-3 text-right font-bold ${data.netProfit >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                                        {formatCurrency(data.netProfit)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Expense Breakdown</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={expenseBreakdownData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name"
                                label={({ cx, cy, midAngle = 0, innerRadius, outerRadius, percent = 0 }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}>
                                {expenseBreakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const WeeklySummaryReport: React.FC<{ payments: Payment[], drivers: Driver[] }> = ({ payments, drivers }) => {
    const { earningsThisWeek, upcomingRentNextWeek, paymentsThisWeek } = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfNextWeek = new Date(startOfWeek);
        startOfNextWeek.setDate(startOfWeek.getDate() + 7);
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

        const paymentsThisWeek = payments.filter(p => p.paymentDate && new Date(p.paymentDate) >= startOfWeek && p.status === PaymentStatus.Paid);
        const earningsThisWeek = paymentsThisWeek.reduce((acc, p) => acc + p.amount, 0);
        const upcomingRentNextWeek = payments.filter(p => new Date(p.dueDate) >= startOfNextWeek && new Date(p.dueDate) <= endOfNextWeek).reduce((acc, p) => acc + p.amount, 0);
        
        return { earningsThisWeek, upcomingRentNextWeek, paymentsThisWeek };
    }, [payments]);

    const getDriverName = (driverId: string) => drivers.find(d => d.id === driverId)?.name || 'Unknown Driver';

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-slate-500 text-sm font-medium">Total Earnings This Week</p>
                    <p className="text-3xl font-bold text-emerald-600">{formatCurrency(earningsThisWeek)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-slate-500 text-sm font-medium">Upcoming Rent For Next Week</p>
                    <p className="text-3xl font-bold text-sky-600">{formatCurrency(upcomingRentNextWeek)}</p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Payments Received This Week</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-slate-600">Driver</th>
                                <th className="p-3 text-sm font-semibold text-slate-600">Payment Date</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 text-right">Amount Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentsThisWeek.length > 0 ? paymentsThisWeek.map(p => (
                                <tr key={p.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-800">{getDriverName(p.driverId)}</td>
                                    <td className="p-3 text-slate-600">{formatDateForDisplay(p.paymentDate)}</td>
                                    <td className="p-3 text-green-600 text-right font-medium">{formatCurrency(p.amount)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-6 text-slate-500">No payments received this week.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const DriverSummaryReport: React.FC<{ drivers: Driver[], payments: Payment[], vehicles: Vehicle[] }> = ({ drivers, payments, vehicles }) => {
    const driverSummaryData = useMemo(() => {
        return drivers.map(driver => {
            const totalRentPaid = payments
                .filter(p => p.driverId === driver.id && p.status === PaymentStatus.Paid)
                .reduce((acc, p) => acc + p.amount, 0);
            
            const assignedVehicle = vehicles.find(v => v.driverId === driver.id);
            const bondPaid = assignedVehicle?.bond || 0;

            return { ...driver, totalRentPaid, bondPaid };
        });
    }, [drivers, payments, vehicles]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Driver Summary</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b bg-slate-50">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-slate-600">Driver</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="p-3 text-sm font-semibold text-slate-600 text-right">Total Rent Paid</th>
                            <th className="p-3 text-sm font-semibold text-slate-600 text-right">Bond on Record</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Contract Period</th>
                        </tr>
                    </thead>
                    <tbody>
                        {driverSummaryData.map(d => (
                            <tr key={d.id} className="border-b hover:bg-slate-50">
                                <td className="p-3">
                                    <p className="font-bold text-slate-800">{d.name}</p>
                                    <p className="text-sm text-slate-500">{d.email}</p>
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${d.status === DriverStatus.Active ? 'bg-green-100 text-green-800' : d.status === DriverStatus.Pending ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>{d.status}</span>
                                </td>
                                <td className="p-3 text-slate-800 text-right font-medium">{formatCurrency(d.totalRentPaid)}</td>
                                <td className="p-3 text-slate-800 text-right font-medium">{d.bondPaid > 0 ? formatCurrency(d.bondPaid) : <span className="text-slate-400">N/A</span>}</td>
                                <td className="p-3 text-sm text-slate-600">
                                    {d.status === DriverStatus.Inactive && d.contractEndDate
                                        ? `${formatDateForDisplay(d.joinDate)} - ${formatDateForDisplay(d.contractEndDate)}`
                                        : `Ongoing since ${formatDateForDisplay(d.joinDate)}`
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


interface ReportsProps {
    payments: Payment[];
    expenses: Expense[];
    vehicles: Vehicle[];
    drivers: Driver[];
}

const Reports: React.FC<ReportsProps> = (props) => {
    const [view, setView] = useState<ReportView>('profitability');
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-lg shadow-sm flex items-center gap-2">
                <TabButton label="Profitability" isActive={view === 'profitability'} onClick={() => setView('profitability')} />
                <TabButton label="Weekly Summary" isActive={view === 'weekly'} onClick={() => setView('weekly')} />
                <TabButton label="Driver Summary" isActive={view === 'driver'} onClick={() => setView('driver')} />
            </div>

            <div>
                {view === 'profitability' && <ProfitabilityReport {...props} />}
                {view === 'weekly' && <WeeklySummaryReport payments={props.payments} drivers={props.drivers} />}
                {view === 'driver' && <DriverSummaryReport {...props} />}
            </div>
        </div>
    );
};

export default Reports;
