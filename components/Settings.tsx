import React, { useState } from 'react';
import { Driver } from '../types';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'super-admin' | 'admin' | 'manager' | 'support';
    status: 'active' | 'inactive' | 'suspended';
    lastLogin: string;
    permissions: string[];
    createdDate: string;
}

interface SystemSettings {
    companyName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    weeklyPaymentDay: string;
    autoApprovalLimit: number;
    maintenanceInterval: number;
    insuranceReminder: number;
    licenseRenewalReminder: number;
    enableSmsNotifications: boolean;
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    defaultLatePaymentFee: number;
    gracePeriodDays: number;
}

interface SettingsProps {
    drivers: Driver[];
}

const Settings: React.FC<SettingsProps> = ({ drivers }) => {
    const [activeTab, setActiveTab] = useState<'company' | 'users' | 'system' | 'notifications' | 'billing'>('company');
    const [showAddUser, setShowAddUser] = useState(false);

    // Mock admin users
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
        {
            id: 'admin1',
            name: 'Super Admin',
            email: 'admin@outly.com',
            role: 'super-admin',
            status: 'active',
            lastLogin: '2024-01-15 10:30',
            permissions: ['all'],
            createdDate: '2024-01-01'
        },
        {
            id: 'admin2',
            name: 'John Manager',
            email: 'manager@outly.com',
            role: 'manager',
            status: 'active',
            lastLogin: '2024-01-14 16:45',
            permissions: ['fleet', 'drivers', 'payments', 'reports'],
            createdDate: '2024-01-05'
        },
        {
            id: 'admin3',
            name: 'Support Agent',
            email: 'support@outly.com',
            role: 'support',
            status: 'active',
            lastLogin: '2024-01-15 09:15',
            permissions: ['support', 'notifications'],
            createdDate: '2024-01-10'
        }
    ]);

    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        companyName: 'Northern Autohub Rentals',
        email: 'info@outly.com',
        phone: '+61 3 9000 0000',
        address: '123 Collins Street, Melbourne VIC 3000',
        website: 'www.outly.com',
        timezone: 'Australia/Melbourne',
        currency: 'AUD',
        dateFormat: 'DD-MM-YYYY',
        weeklyPaymentDay: 'Monday',
        autoApprovalLimit: 1000,
        maintenanceInterval: 10000,
        insuranceReminder: 30,
        licenseRenewalReminder: 60,
        enableSmsNotifications: true,
        enableEmailNotifications: true,
        enablePushNotifications: true,
        defaultLatePaymentFee: 50,
        gracePeriodDays: 3
    });

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super-admin': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'manager': return 'bg-green-100 text-green-800';
            case 'support': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
            {label}
        </button>
    );

    const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Settings</h2>
                
                {/* Tabs */}
                <div className="flex gap-2">
                    <TabButton
                        label="Company Info"
                        isActive={activeTab === 'company'}
                        onClick={() => setActiveTab('company')}
                    />
                    <TabButton
                        label="User Management"
                        isActive={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <TabButton
                        label="System Settings"
                        isActive={activeTab === 'system'}
                        onClick={() => setActiveTab('system')}
                    />
                    <TabButton
                        label="Notifications"
                        isActive={activeTab === 'notifications'}
                        onClick={() => setActiveTab('notifications')}
                    />
                    <TabButton
                        label="Billing & Payments"
                        isActive={activeTab === 'billing'}
                        onClick={() => setActiveTab('billing')}
                    />
                </div>
            </div>

            {/* Content */}
            {activeTab === 'company' && (
                <div className="space-y-6">
                    <FormSection title="Company Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={systemSettings.companyName}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={systemSettings.email}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={systemSettings.phone}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                                <input
                                    type="url"
                                    value={systemSettings.website}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, website: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                            <textarea
                                value={systemSettings.address}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, address: e.target.value }))}
                                rows={3}
                                className="w-full border border-slate-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div className="mt-6">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                Save Company Info
                            </button>
                        </div>
                    </FormSection>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Admin Users</h3>
                            <button
                                onClick={() => setShowAddUser(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Add User
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-medium text-slate-700">User</th>
                                        <th className="p-4 text-left text-sm font-medium text-slate-700">Role</th>
                                        <th className="p-4 text-left text-sm font-medium text-slate-700">Status</th>
                                        <th className="p-4 text-left text-sm font-medium text-slate-700">Last Login</th>
                                        <th className="p-4 text-left text-sm font-medium text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {adminUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-slate-800">{user.name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                    {user.role.replace('-', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                    {user.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">{user.lastLogin}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                                    <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'system' && (
                <div className="space-y-6">
                    <FormSection title="Regional Settings">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                                <select
                                    value={systemSettings.timezone}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                >
                                    <option value="Australia/Melbourne">Australia/Melbourne</option>
                                    <option value="Australia/Sydney">Australia/Sydney</option>
                                    <option value="Australia/Brisbane">Australia/Brisbane</option>
                                    <option value="Australia/Perth">Australia/Perth</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                                <select
                                    value={systemSettings.currency}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, currency: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                >
                                    <option value="AUD">AUD - Australian Dollar</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                                <select
                                    value={systemSettings.dateFormat}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                >
                                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                                    <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Weekly Payment Day</label>
                                <select
                                    value={systemSettings.weeklyPaymentDay}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, weeklyPaymentDay: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                >
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                </select>
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="Business Rules">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Auto Approval Limit ($)</label>
                                <input
                                    type="number"
                                    value={systemSettings.autoApprovalLimit}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, autoApprovalLimit: Number(e.target.value) }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Maintenance Interval (km)</label>
                                <input
                                    type="number"
                                    value={systemSettings.maintenanceInterval}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceInterval: Number(e.target.value) }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Insurance Reminder (days)</label>
                                <input
                                    type="number"
                                    value={systemSettings.insuranceReminder}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, insuranceReminder: Number(e.target.value) }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">License Renewal Reminder (days)</label>
                                <input
                                    type="number"
                                    value={systemSettings.licenseRenewalReminder}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, licenseRenewalReminder: Number(e.target.value) }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="space-y-6">
                    <FormSection title="Notification Preferences">
                        <div className="space-y-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={systemSettings.enableEmailNotifications}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, enableEmailNotifications: e.target.checked }))}
                                    className="mr-3 h-4 w-4 text-blue-600"
                                />
                                <span className="text-slate-700">Enable Email Notifications</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={systemSettings.enableSmsNotifications}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, enableSmsNotifications: e.target.checked }))}
                                    className="mr-3 h-4 w-4 text-blue-600"
                                />
                                <span className="text-slate-700">Enable SMS Notifications</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={systemSettings.enablePushNotifications}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, enablePushNotifications: e.target.checked }))}
                                    className="mr-3 h-4 w-4 text-blue-600"
                                />
                                <span className="text-slate-700">Enable Push Notifications</span>
                            </label>
                        </div>
                    </FormSection>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="space-y-6">
                    <FormSection title="Payment Settings">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Default Late Payment Fee ($)</label>
                                <input
                                    type="number"
                                    value={systemSettings.defaultLatePaymentFee}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultLatePaymentFee: Number(e.target.value) }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Grace Period (days)</label>
                                <input
                                    type="number"
                                    value={systemSettings.gracePeriodDays}
                                    onChange={(e) => setSystemSettings(prev => ({ ...prev, gracePeriodDays: Number(e.target.value) }))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                                />
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            {/* Save Button */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Changes are automatically saved</p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings; 