import React, { useState, useMemo } from 'react';
import { Driver, Vehicle, Payment, Fine, VehicleStatus, DriverStatus, PaymentStatus } from '../types';

interface NotificationItem {
    id: string;
    type: 'payment' | 'driver' | 'vehicle' | 'fine' | 'application' | 'system';
    title: string;
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    read: boolean;
    actionRequired: boolean;
    relatedId?: string;
}

interface NotificationsProps {
    vehicles: Vehicle[];
    drivers: Driver[];
    payments: Payment[];
    fines: Fine[];
    applications: any[];
}

const Notifications: React.FC<NotificationsProps> = ({ vehicles, drivers, payments, fines, applications }) => {
    const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'critical'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
    const [showSettings, setShowSettings] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        paymentAlerts: true,
        vehicleAlerts: true,
        driverAlerts: true,
        fineAlerts: true,
        maintenanceAlerts: true
    });

    // Generate notifications from system data
    const systemNotifications = useMemo(() => {
        const notifications: NotificationItem[] = [];

        // Payment notifications
        payments.filter(p => p.status === PaymentStatus.Overdue).forEach(payment => {
            const driver = drivers.find(d => d.id === payment.driverId);
            const vehicle = vehicles.find(v => v.id === payment.vehicleId);
            notifications.push({
                id: `payment-${payment.id}`,
                type: 'payment',
                title: 'Overdue Payment Alert',
                message: `${driver?.name || 'Unknown Driver'} has an overdue payment of $${payment.amount} for ${vehicle?.make} ${vehicle?.model} (${vehicle?.rego})`,
                timestamp: payment.dueDate,
                priority: 'high',
                read: false,
                actionRequired: true,
                relatedId: payment.id
            });
        });

        // Driver notifications
        drivers.filter(d => d.status === DriverStatus.Pending).forEach(driver => {
            notifications.push({
                id: `driver-${driver.id}`,
                type: 'driver',
                title: 'New Driver Application',
                message: `${driver.name} has submitted a new driver application requiring approval`,
                timestamp: driver.joinDate,
                priority: 'medium',
                read: false,
                actionRequired: true,
                relatedId: driver.id
            });
        });

        // Vehicle maintenance notifications
        vehicles.filter(v => v.status === VehicleStatus.Maintenance).forEach(vehicle => {
            notifications.push({
                id: `vehicle-${vehicle.id}`,
                type: 'vehicle',
                title: 'Vehicle in Maintenance',
                message: `${vehicle.make} ${vehicle.model} (${vehicle.rego}) is currently under maintenance and unavailable for rental`,
                timestamp: vehicle.serviceDue || new Date().toISOString().split('T')[0],
                priority: 'medium',
                read: false,
                actionRequired: false,
                relatedId: vehicle.id
            });
        });

        // Service due notifications
        vehicles.filter(v => {
            const serviceDue = new Date(v.serviceDue || '');
            const today = new Date();
            const daysUntilService = Math.ceil((serviceDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilService <= 14 && daysUntilService > 0;
        }).forEach(vehicle => {
            const serviceDue = new Date(vehicle.serviceDue || '');
            const today = new Date();
            const daysUntilService = Math.ceil((serviceDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            notifications.push({
                id: `service-${vehicle.id}`,
                type: 'vehicle',
                title: 'Service Due Soon',
                message: `${vehicle.make} ${vehicle.model} (${vehicle.rego}) is due for service in ${daysUntilService} days`,
                timestamp: new Date().toISOString().split('T')[0],
                priority: daysUntilService <= 7 ? 'high' : 'medium',
                read: false,
                actionRequired: true,
                relatedId: vehicle.id
            });
        });

        // Fine notifications
        fines.filter(f => f.status === 'Unpaid').forEach(fine => {
            const driver = drivers.find(d => d.id === fine.driverId);
            const vehicle = vehicles.find(v => v.id === fine.vehicleId);
            notifications.push({
                id: `fine-${fine.id}`,
                type: 'fine',
                title: 'Unpaid Traffic Fine',
                message: `${driver?.name || 'Unknown Driver'} has an unpaid fine of $${fine.amount} for ${vehicle?.make} ${vehicle?.model} (${vehicle?.rego})`,
                timestamp: fine.issueDate,
                priority: 'high',
                read: false,
                actionRequired: true,
                relatedId: fine.id
            });
        });

        // Pending applications
        applications.filter(a => a.status === 'pending').forEach(application => {
            notifications.push({
                id: `application-${application.id || Date.now()}`,
                type: 'application',
                title: 'New Rental Application',
                message: `New rental application received requiring review and approval`,
                timestamp: new Date().toISOString().split('T')[0],
                priority: 'medium',
                read: false,
                actionRequired: true,
                relatedId: application.id
            });
        });

        return notifications;
    }, [vehicles, drivers, payments, fines, applications]);

    const [notifications, setNotifications] = useState<NotificationItem[]>(systemNotifications);

    const filteredNotifications = useMemo(() => {
        let filtered = [...notifications];

        // Apply filters
        switch (filter) {
            case 'unread':
                filtered = filtered.filter(n => !n.read);
                break;
            case 'high':
                filtered = filtered.filter(n => n.priority === 'high');
                break;
            case 'critical':
                filtered = filtered.filter(n => n.priority === 'critical');
                break;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                case 'oldest':
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                case 'priority':
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                default:
                    return 0;
            }
        });

        return filtered;
    }, [notifications, filter, sortBy]);

    const unreadCount = notifications.filter(n => !n.read).length;
    const criticalCount = notifications.filter(n => n.priority === 'critical').length;
    const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'payment':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
            case 'driver':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
            case 'vehicle':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" /></svg>;
            case 'fine':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
            case 'application':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            default:
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
        }
    };

    if (showSettings) {
        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Notification Settings</h2>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="text-slate-500 hover:text-slate-700"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Delivery Methods</h3>
                            <div className="space-y-3">
                                {Object.entries({
                                    emailNotifications: 'Email Notifications',
                                    pushNotifications: 'Push Notifications',
                                    smsNotifications: 'SMS Notifications'
                                }).map(([key, label]) => (
                                    <label key={key} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings[key as keyof typeof notificationSettings]}
                                            onChange={(e) => setNotificationSettings(prev => ({
                                                ...prev,
                                                [key]: e.target.checked
                                            }))}
                                            className="mr-3 h-4 w-4 text-blue-600"
                                        />
                                        <span className="text-slate-700">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Alert Types</h3>
                            <div className="space-y-3">
                                {Object.entries({
                                    paymentAlerts: 'Payment Alerts',
                                    vehicleAlerts: 'Vehicle Alerts',
                                    driverAlerts: 'Driver Alerts',
                                    fineAlerts: 'Fine Alerts',
                                    maintenanceAlerts: 'Maintenance Alerts'
                                }).map(([key, label]) => (
                                    <label key={key} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings[key as keyof typeof notificationSettings]}
                                            onChange={(e) => setNotificationSettings(prev => ({
                                                ...prev,
                                                [key]: e.target.checked
                                            }))}
                                            className="mr-3 h-4 w-4 text-blue-600"
                                        />
                                        <span className="text-slate-700">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="text-slate-500 hover:text-slate-700"
                        title="Notification Settings"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-800">{notifications.length}</p>
                        <p className="text-sm text-slate-600">Total</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                        <p className="text-sm text-slate-600">Unread</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                        <p className="text-sm text-slate-600">Critical</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">{actionRequiredCount}</p>
                        <p className="text-sm text-slate-600">Action Required</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Filter:</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                        >
                            <option value="all">All</option>
                            <option value="unread">Unread</option>
                            <option value="high">High Priority</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Sort:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="priority">By Priority</option>
                        </select>
                    </div>

                    <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200 text-center">
                        <div className="text-slate-400 mb-2">
                            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-slate-600">No notifications found</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white p-4 rounded-lg shadow-md border border-slate-200 transition-all hover:shadow-lg ${
                                !notification.read ? 'border-l-4 border-l-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)} text-white`}>
                                    {getTypeIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-slate-800">{notification.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                notification.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {notification.priority.toUpperCase()}
                                            </span>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-600 mb-2">{notification.message}</p>
                                    
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span>{notification.timestamp}</span>
                                        {notification.actionRequired && (
                                            <span className="text-amber-600 font-medium">Action Required</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications; 