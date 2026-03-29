
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats, Vehicle, Driver, Payment, Fine, RentalApplication, VehicleStatus, DriverStatus, PaymentStatus } from '../types';
import { EARNINGS_DATA } from '../constants';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-slate-500 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                </div>
            </div>
            {trend && (
                <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <span className="mr-1">{trend.isPositive ? '↗' : '↘'}</span>
                    {Math.abs(trend.value)}%
                </div>
            )}
        </div>
    </div>
);

const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
}> = ({ title, description, icon, onClick, color }) => (
    <button
        onClick={onClick}
        className="bg-white p-4 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-all hover:scale-[1.02] text-left w-full"
    >
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-600">{description}</p>
    </button>
);

interface ActivityItem {
    id: string;
    type: 'payment' | 'driver' | 'vehicle' | 'fine' | 'application';
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high';
}

const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.priority === 'high' ? 'bg-rose-500' :
                        activity.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div className="flex-1">
                        <p className="text-sm text-slate-800 font-medium">{activity.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface EnhancedDashboardProps {
    stats: DashboardStats;
    vehicles?: Vehicle[];
    drivers?: Driver[];
    payments?: Payment[];
    fines?: Fine[];
    applications?: RentalApplication[];
    onQuickAction?: (action: string) => void;
}

const Dashboard: React.FC<EnhancedDashboardProps> = ({ 
    stats, 
    vehicles = [], 
    drivers = [], 
    payments = [], 
    fines = [],
    applications = [],
    onQuickAction 
}) => {
    const enhancedStats = useMemo(() => {
        const pendingDrivers = drivers.filter(d => d.status === DriverStatus.Pending).length;
        const maintenanceVehicles = vehicles.filter(v => v.status === VehicleStatus.Maintenance).length;
        const overduePayments = payments.filter(p => p.status === PaymentStatus.Overdue).length;
        const unpaidFines = fines.filter(f => f.status === 'Unpaid').length;
        const pendingApplications = applications.filter(a => a.status === 'pending').length;
        const totalRevenue = payments.filter(p => p.status === PaymentStatus.Paid)
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            totalVehicles: vehicles.length,
            availableVehicles: vehicles.filter(v => v.status === VehicleStatus.Available).length,
            maintenanceVehicles,
            totalDrivers: drivers.length,
            activeDrivers: drivers.filter(d => d.status === DriverStatus.Active).length,
            pendingDrivers,
            totalRevenue,
            overduePayments: payments.filter(p => p.status === PaymentStatus.Overdue)
                .reduce((sum, p) => sum + p.amount, 0),
            unpaidFines: fines.filter(f => f.status === 'Unpaid')
                .reduce((sum, f) => sum + f.amount, 0),
            pendingApplications,
            totalTickets: pendingDrivers + maintenanceVehicles + overduePayments + unpaidFines + pendingApplications
        };
    }, [vehicles, drivers, payments, fines, applications]);

    const vehicleStatusData = useMemo(() => [
        { name: 'Available', value: enhancedStats.availableVehicles, color: '#10b981' },
        { name: 'Hired', value: vehicles.filter(v => v.status === VehicleStatus.Hired).length, color: '#3b82f6' },
        { name: 'Maintenance', value: enhancedStats.maintenanceVehicles, color: '#f59e0b' },
    ], [vehicles, enhancedStats]);

    const recentActivities: ActivityItem[] = useMemo(() => {
        const activities: ActivityItem[] = [];
        
        // Recent overdue payments
        payments.filter(p => p.status === PaymentStatus.Overdue).slice(0, 2).forEach(payment => {
            const driver = drivers.find(d => d.id === payment.driverId);
            activities.push({
                id: `payment-${payment.id}`,
                type: 'payment',
                message: `Overdue payment: ${driver?.name || 'Unknown'} - $${payment.amount}`,
                timestamp: payment.dueDate,
                priority: 'high'
            });
        });

        // Recent pending drivers
        drivers.filter(d => d.status === DriverStatus.Pending).slice(0, 2).forEach(driver => {
            activities.push({
                id: `driver-${driver.id}`,
                type: 'driver',
                message: `New driver application: ${driver.name}`,
                timestamp: driver.joinDate,
                priority: 'medium'
            });
        });

        // Recent unpaid fines
        fines.filter(f => f.status === 'Unpaid').slice(0, 2).forEach(fine => {
            const driver = drivers.find(d => d.id === fine.driverId);
            activities.push({
                id: `fine-${fine.id}`,
                type: 'fine',
                message: `Unpaid fine: ${driver?.name || 'Unknown'} - $${fine.amount}`,
                timestamp: fine.issueDate,
                priority: 'high'
            });
        });

        // Vehicles in maintenance
        vehicles.filter(v => v.status === VehicleStatus.Maintenance).slice(0, 1).forEach(vehicle => {
            activities.push({
                id: `vehicle-${vehicle.id}`,
                type: 'vehicle',
                message: `Vehicle in maintenance: ${vehicle.make} ${vehicle.model} (${vehicle.rego})`,
                timestamp: vehicle.serviceDue || 'N/A',
                priority: 'medium'
            });
        });

        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);
    }, [payments, drivers, fines, vehicles]);

    const handleQuickAction = (action: string) => {
        if (onQuickAction) {
            onQuickAction(action);
        }
    };

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Vehicles" 
                    value={enhancedStats.totalVehicles}
                    subtitle={`${enhancedStats.availableVehicles} available`}
                    color="bg-blue-100 text-blue-600"
                    trend={{ value: 5, isPositive: true }}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" /></svg>}
                />
                <StatCard 
                    title="Active Drivers" 
                    value={enhancedStats.activeDrivers}
                    subtitle={`${enhancedStats.pendingDrivers} pending approval`}
                    color="bg-indigo-100 text-indigo-600"
                    trend={{ value: 12, isPositive: true }}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0H21" /></svg>}
                />
                <StatCard 
                    title="Weekly Revenue" 
                    value={`$${stats.weeklyEarnings.toLocaleString()}`}
                    subtitle={`$${enhancedStats.totalRevenue.toLocaleString()} total paid`}
                    color="bg-emerald-100 text-emerald-600"
                    trend={{ value: 8, isPositive: true }}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1m2.599 1c1.657 0 3-.895 3-2s-1.343-2-3-2" /></svg>}
                />
                <StatCard 
                    title="Outstanding Issues" 
                    value={enhancedStats.totalTickets}
                    subtitle={`$${(enhancedStats.overduePayments + enhancedStats.unpaidFines).toLocaleString()} outstanding`}
                    color="bg-rose-100 text-rose-600"
                    trend={{ value: 15, isPositive: false }}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                    <p className="text-2xl font-bold text-amber-600">{enhancedStats.pendingApplications}</p>
                    <p className="text-sm text-slate-600">Pending Applications</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                    <p className="text-2xl font-bold text-rose-600">{payments.filter(p => p.status === PaymentStatus.Overdue).length}</p>
                    <p className="text-sm text-slate-600">Overdue Payments</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                    <p className="text-2xl font-bold text-orange-600">{enhancedStats.maintenanceVehicles}</p>
                    <p className="text-sm text-slate-600">In Maintenance</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                    <p className="text-2xl font-bold text-red-600">{fines.filter(f => f.status === 'Unpaid').length}</p>
                    <p className="text-sm text-slate-600">Unpaid Fines</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                    <p className="text-2xl font-bold text-blue-600">{vehicles.filter(v => v.status === VehicleStatus.Hired).length}</p>
                    <p className="text-sm text-slate-600">Currently Hired</p>
                </div>
            </div>

            {/* Charts and Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Earnings Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Earnings</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={EARNINGS_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="earnings" fill="#3b82f6" name="Earnings" barSize={30} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vehicle Status Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Fleet Status</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={vehicleStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({name, value}) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {vehicleStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <QuickActionCard
                            title="Add Vehicle"
                            description="Register a new vehicle to the fleet"
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                            color="bg-blue-100 text-blue-600"
                            onClick={() => handleQuickAction('add-vehicle')}
                        />
                        <QuickActionCard
                            title="Review Applications"
                            description={`${enhancedStats.pendingApplications} pending review`}
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            color="bg-amber-100 text-amber-600"
                            onClick={() => handleQuickAction('review-applications')}
                        />
                        <QuickActionCard
                            title="Process Payments"
                            description="Handle overdue and pending payments"
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                            color="bg-emerald-100 text-emerald-600"
                            onClick={() => handleQuickAction('process-payments')}
                        />
                        <QuickActionCard
                            title="Generate Report"
                            description="Create financial and operational reports"
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            color="bg-purple-100 text-purple-600"
                            onClick={() => handleQuickAction('generate-report')}
                        />
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <ActivityFeed activities={recentActivities} />
            </div>
        </div>
    );
};

export default Dashboard;
