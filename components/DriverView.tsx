import React, { useState, useMemo } from 'react';
import { Driver, Vehicle, Payment, Fine, PaymentStatus, Booking, VehicleStatus } from '../types';
import DateInput from './common/DateInput';
import { formatDateForDisplay, isValidDDMMYYYYDate } from '../utils/dateUtils';
import RentalApplication from './RentalApplication';

interface DriverViewProps {
    driver: Driver;
    vehicle?: Vehicle;
    payments: Payment[];
    fines: Fine[];
    onLogout: () => void;
    bookings: Booking[];
    allVehicles: Vehicle[];
    onSubmitApplication?: (application: any) => void;
}

type DriverTab = 'dashboard' | 'rent' | 'fines' | 'bookings' | 'profile' | 'reports' | 'documents' | 'support' | 'notifications';

const StatCard: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-brand-blue-800">{value}</p>
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; count?: number; }> = ({ label, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`relative px-4 py-2 text-md font-semibold rounded-t-lg transition-colors border-b-4 ${isActive ? 'text-brand-blue-600 border-brand-blue-600' : 'text-slate-500 hover:text-slate-800 border-transparent'}`}
    >
        {label}
        {count !== undefined && count > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {count}
            </span>
        )}
    </button>
);



const DriverView: React.FC<DriverViewProps> = ({ driver, vehicle, payments, fines, onLogout, bookings, allVehicles, onSubmitApplication }) => {
    const [activeTab, setActiveTab] = useState<DriverTab>('dashboard');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showRentalApplication, setShowRentalApplication] = useState(false);
    const [profileForm, setProfileForm] = useState({
        phone: driver.phone,
        address: driver.address,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // New state for enhanced features
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'payment', message: 'Weekly payment due on Monday', date: '2024-01-15', read: false },
        { id: 2, type: 'vehicle', message: 'Vehicle service reminder: Due in 2 weeks', date: '2024-01-10', read: true },
        { id: 3, type: 'fine', message: 'New traffic fine received', date: '2024-01-08', read: false }
    ]);

    const [supportTickets, setSupportTickets] = useState([
        { id: 1, subject: 'Vehicle maintenance request', status: 'open', priority: 'medium', date: '2024-01-12' },
        { id: 2, subject: 'Payment inquiry', status: 'resolved', priority: 'low', date: '2024-01-05' }
    ]);

    const [documents, setDocuments] = useState([
        { id: 1, name: 'Rental Agreement', type: 'contract', date: '2024-01-01', status: 'active' },
        { id: 2, name: 'Insurance Certificate', type: 'insurance', date: '2024-01-01', status: 'active' },
        { id: 3, name: 'Vehicle Inspection Report', type: 'inspection', date: '2023-12-15', status: 'expired' }
    ]);




    const { paidPayments, duePayments, totalRentPaid } = useMemo(() => {
        const paid = payments.filter(p => p.status === PaymentStatus.Paid).sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime());
        const due = payments.filter(p => p.status !== PaymentStatus.Paid).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const total = paid.reduce((acc, p) => acc + p.amount, 0);
        return { paidPayments: paid, duePayments: due, totalRentPaid: total };
    }, [payments]);

    const unpaidFines = useMemo(() => fines.filter(f => f.status === 'Unpaid'), [fines]);

    // Helper functions for new features
    const unreadNotifications = useMemo(() => notifications.filter(n => !n.read), [notifications]);
    
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'payment': return '💰';
            case 'vehicle': return '🚗';
            case 'fine': return '🚨';
            case 'maintenance': return '🔧';
            default: return '📢';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'text-blue-600 bg-blue-100';
            case 'resolved': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Filter bookings for this driver
    const driverBookings = useMemo(() => {
        return bookings.filter(b => b.driverId === driver.id).map(booking => {
            const vehicle = allVehicles.find(v => v.id === booking.vehicleId);
            return { ...booking, vehicle };
        }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [bookings, driver.id, allVehicles]);

    // Get available vehicles (not hired and not in maintenance)
    const availableVehicles = useMemo(() => {
        return allVehicles.filter(v => v.status === VehicleStatus.Available);
    }, [allVehicles]);

    // Use the vehicle prop directly
    const assignedVehicle = vehicle;



    const handleProfileSave = () => {
        const updatedDriver: Driver = {
            ...driver,
            phone: profileForm.phone,
            address: profileForm.address,
            password: profileForm.newPassword || driver.password
        };


        setIsEditingProfile(false);
        setProfileForm({
            phone: updatedDriver.phone,
            address: updatedDriver.address,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleProfileCancel = () => {
        setIsEditingProfile(false);
        setProfileForm({
            phone: driver.phone,
            address: driver.address,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <header className="bg-brand-blue-900 text-white p-4 shadow-md flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Driver Portal</h1>
                    <p className="text-brand-blue-200">Welcome, {driver.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <img src={driver.profileImageUrl} alt={driver.name} className="w-12 h-12 rounded-full border-2 border-brand-blue-400"/>
                    <button onClick={onLogout} title="Logout" className="text-brand-blue-300 hover:text-white flex items-center gap-2 bg-brand-blue-800 px-3 py-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <main className="p-6 space-y-6">
                {vehicle ? (
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-6">
                        <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full md:w-1/3 h-auto object-cover rounded-lg"/>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-800">Your Vehicle</h2>
                            <p className="text-3xl font-light text-slate-700">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <p><span className="font-semibold text-slate-600">Rego:</span> <span className="font-mono bg-slate-100 px-2 py-1 rounded">{vehicle.rego}</span></p>
                                <p><span className="font-semibold text-slate-600">Weekly Rent:</span> <span className="font-bold text-green-600">${vehicle.weeklyRent}</span></p>
                                <p><span className="font-semibold text-slate-600">Insurance Expiry:</span> {formatDateForDisplay(vehicle.insuranceExpiry)}</p>
                                <p><span className="font-semibold text-slate-600">Service Due:</span> {formatDateForDisplay(vehicle.serviceDue)}</p>
                            </div>
                        </div>
                    </div>
                                ) : (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md" role="alert">
                        <p className="font-bold">No Vehicle Assigned</p>
                        <p>You do not currently have a vehicle assigned. Please apply for a rental vehicle below.</p>
                        
                        {!showRentalApplication ? (
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowRentalApplication(true)}
                                    className="bg-brand-blue-600 text-white px-6 py-3 rounded-md hover:bg-brand-blue-700 transition-colors"
                                >
                                    Apply for Rental Vehicle
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <RentalApplication
                                    driver={driver}
                                    availableVehicles={availableVehicles}
                                    onSubmitApplication={(application) => {
                                        if (onSubmitApplication) {
                                            onSubmitApplication(application);
                                        }
                                        setShowRentalApplication(false);
                                    }}
                                    onCancel={() => setShowRentalApplication(false)}
                                />
                            </div>
                        )}
                    </div>
                )}
                
                <div className="border-b border-slate-200 overflow-x-auto">
                    <div className="flex space-x-1 min-w-max">
                        <TabButton label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <TabButton label="Rent & Payments" isActive={activeTab === 'rent'} onClick={() => setActiveTab('rent')} />
                        <TabButton label="Fines" isActive={activeTab === 'fines'} onClick={() => setActiveTab('fines')} count={unpaidFines.length} />
                        <TabButton label="Bookings" isActive={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                        <TabButton label="Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                        <TabButton label="Documents" isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
                        <TabButton label="Support" isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                        <TabButton label="Notifications" isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} count={unreadNotifications.length} />
                        <TabButton label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                    </div>
                </div>
                
                {activeTab === 'rent' && (
                    <div className="space-y-6">


                        {/* Assigned Vehicle Section */}
                        {assignedVehicle && (
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3">🚗 Your Assigned Vehicle</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold text-blue-900">{assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.year})</h4>
                                        <p className="text-blue-700">Registration: <span className="font-mono font-bold">{assignedVehicle.rego}</span></p>
                                        <p className="text-blue-600">Weekly Rate: <span className="font-bold">${assignedVehicle.weeklyRent}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
                                            Vehicle Active
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <StatCard label="Total Rent Paid" value={`$${totalRentPaid.toLocaleString()}`} />
                           <StatCard label="Upcoming Payments Due" value={duePayments.length.toString()} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 mb-3">Upcoming Dues</h3>
                                <div className="max-h-96 overflow-y-auto">
                                   {duePayments.length > 0 ? duePayments.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-slate-50">
                                            <div>
                                                <p className="font-semibold">Week of {formatDateForDisplay(p.dueDate)}</p>
                                                <p className="text-sm text-slate-500">Due on: {formatDateForDisplay(p.dueDate)}</p>
                                            </div>
                                            <p className={`font-bold text-lg ${p.status === PaymentStatus.Overdue ? 'text-red-500' : 'text-blue-500'}`}>${p.amount}</p>
                                        </div>
                                    )) : <p className="text-slate-500 text-center py-4">No upcoming payments.</p>}
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 mb-3">Payment History</h3>
                                 <div className="max-h-96 overflow-y-auto">
                                   {paidPayments.length > 0 ? paidPayments.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-slate-50">
                                            <div>
                                                <p className="font-semibold">Week of {formatDateForDisplay(p.dueDate)}</p>
                                                <p className="text-sm text-slate-500">Paid on: {p.paymentDate ? formatDateForDisplay(p.paymentDate) : 'N/A'}</p>
                                            </div>
                                            <p className="font-bold text-lg text-green-600">${p.amount}</p>
                                        </div>
                                    )) : <p className="text-slate-500 text-center py-4">No payment history.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'fines' && (
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Fines on Record</h3>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                               <thead className="border-b bg-slate-50">
                                   <tr>
                                       <th className="p-3 text-sm font-semibold text-slate-600">Fine #</th>
                                       <th className="p-3 text-sm font-semibold text-slate-600">Service Name</th>
                                       <th className="p-3 text-sm font-semibold text-slate-600">Issue Date</th>
                                       <th className="p-3 text-sm font-semibold text-slate-600">Due Date</th>
                                       <th className="p-3 text-sm font-semibold text-slate-600 text-right">Amount</th>
                                       <th className="p-3 text-sm font-semibold text-slate-600 text-center">Status</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {fines.length > 0 ? fines.map(f => (
                                       <tr key={f.id} className="border-b hover:bg-slate-50">
                                           <td className="p-3 text-slate-500 font-mono text-xs">{f.id}</td>
                                           <td className="p-3 text-slate-800 font-medium">{f.serviceName}</td>
                                           <td className="p-3 text-slate-600">{formatDateForDisplay(f.issueDate)}</td>
                                           <td className="p-3 text-slate-600">{formatDateForDisplay(f.dueDate)}</td>
                                           <td className="p-3 text-red-600 font-bold text-right">${f.amount}</td>
                                           <td className="p-3 text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${f.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{f.status}</span>
                                           </td>
                                       </tr>
                                   )) : (
                                        <tr>
                                            <td colSpan={6} className="text-center p-6 text-slate-500">You have no fines on record. Great job!</td>
                                        </tr>
                                   )}
                               </tbody>
                           </table>
                        </div>
                     </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Booking History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b bg-slate-50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-slate-600">Vehicle</th>
                                        <th className="p-3 text-sm font-semibold text-slate-600">Rego</th>
                                        <th className="p-3 text-sm font-semibold text-slate-600">Start Date</th>
                                        <th className="p-3 text-sm font-semibold text-slate-600">End Date</th>
                                        <th className="p-3 text-sm font-semibold text-slate-600">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {driverBookings.length > 0 ? driverBookings.map((booking, index) => {
                                        const startDate = new Date(booking.startDate);
                                        const endDate = new Date(booking.endDate);
                                        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                                        
                                        return (
                                            <tr key={index} className="border-b hover:bg-slate-50">
                                                <td className="p-3 text-slate-800 font-medium">
                                                    {booking.vehicle ? `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}` : 'Unknown Vehicle'}
                                                </td>
                                                <td className="p-3 text-slate-600 font-mono">{booking.vehicleRego}</td>
                                                <td className="p-3 text-slate-600">{formatDateForDisplay(booking.startDate)}</td>
                                                <td className="p-3 text-slate-600">{formatDateForDisplay(booking.endDate)}</td>
                                                <td className="p-3 text-slate-600">{duration} days</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={5} className="text-center p-6 text-slate-500">No booking history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800">Profile Information</h3>
                            {!isEditingProfile && (
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={driver.name}
                                        disabled
                                        className="w-full p-3 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={driver.email}
                                        disabled
                                        className="w-full p-3 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                        disabled={!isEditingProfile}
                                        className={`w-full p-3 border border-slate-300 rounded-md ${!isEditingProfile ? 'bg-slate-50 text-slate-500' : 'bg-white'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <textarea
                                        value={profileForm.address}
                                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                                        disabled={!isEditingProfile}
                                        rows={3}
                                        className={`w-full p-3 border border-slate-300 rounded-md ${!isEditingProfile ? 'bg-slate-50 text-slate-500' : 'bg-white'}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                                    <input
                                        type="text"
                                        value={driver.licenseNumber}
                                        disabled
                                        className="w-full p-3 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">License Expiry</label>
                                    <input
                                        type="text"
                                        value={formatDateForDisplay(driver.licenseExpiry)}
                                        disabled
                                        className="w-full p-3 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                                    <input
                                        type="text"
                                        value={formatDateForDisplay(driver.joinDate)}
                                        disabled
                                        className="w-full p-3 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <input
                                        type="text"
                                        value={driver.status}
                                        disabled
                                        className="w-full p-3 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditingProfile && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                <h4 className="text-lg font-semibold text-slate-800 mb-4">Change Password</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            value={profileForm.currentPassword}
                                            onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                                            className="w-full p-3 border border-slate-300 rounded-md"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={profileForm.newPassword}
                                            onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                                            className="w-full p-3 border border-slate-300 rounded-md"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={profileForm.confirmPassword}
                                            onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                                            className="w-full p-3 border border-slate-300 rounded-md"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={handleProfileSave}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleProfileCancel}
                                        className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Welcome Section */}
                        <div className="bg-gradient-to-r from-brand-blue-600 to-brand-blue-800 text-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Welcome back, {driver.name}! 👋</h2>
                                    <p className="text-brand-blue-100">Here's your rental overview for today</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-brand-blue-200">Today's Date</p>
                                    <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Weekly Rent" value={`$${assignedVehicle?.weeklyRent || 0}`} />
                            <StatCard label="Outstanding Fines" value={`$${unpaidFines.reduce((sum, fine) => sum + fine.amount, 0).toLocaleString()}`} />
                            <StatCard label="Total Payments" value={`$${totalRentPaid.toLocaleString()}`} />
                            <StatCard label="Days with Vehicle" value={assignedVehicle ? Math.floor((new Date().getTime() - new Date(driver.joinDate).getTime()) / (1000 * 60 * 60 * 24)).toString() : '0'} />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button 
                                    onClick={() => setActiveTab('rent')}
                                    className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
                                >
                                    <div className="text-2xl mb-2">💰</div>
                                    <p className="font-medium text-slate-800">Make Payment</p>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('support')}
                                    className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
                                >
                                    <div className="text-2xl mb-2">🔧</div>
                                    <p className="font-medium text-slate-800">Report Issue</p>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('documents')}
                                    className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
                                >
                                    <div className="text-2xl mb-2">📄</div>
                                    <p className="font-medium text-slate-800">View Documents</p>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('reports')}
                                    className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors"
                                >
                                    <div className="text-2xl mb-2">📊</div>
                                    <p className="font-medium text-slate-800">View Reports</p>
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Payments */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Payments</h3>
                                <div className="space-y-3">
                                    {paidPayments.slice(0, 3).map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">Week of {formatDateForDisplay(payment.dueDate)}</p>
                                                <p className="text-sm text-slate-500">Paid: {payment.paymentDate ? formatDateForDisplay(payment.paymentDate) : 'N/A'}</p>
                                            </div>
                                            <span className="font-bold text-green-600">${payment.amount}</span>
                                        </div>
                                    ))}
                                    {paidPayments.length === 0 && (
                                        <p className="text-slate-500 text-center py-4">No recent payments</p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Notifications */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Notifications</h3>
                                <div className="space-y-3">
                                    {notifications.slice(0, 3).map((notification) => (
                                        <div key={notification.id} className={`p-3 rounded-lg ${notification.read ? 'bg-slate-50' : 'bg-blue-50'}`}>
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {formatDateForDisplay(notification.date)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Status */}
                        {assignedVehicle && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Vehicle Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl mb-2">✅</div>
                                        <p className="font-medium text-slate-800">Status</p>
                                        <p className="text-sm text-green-600">Active</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl mb-2">🛡️</div>
                                        <p className="font-medium text-slate-800">Insurance</p>
                                        <p className="text-sm text-blue-600">Valid until {formatDateForDisplay(assignedVehicle.insuranceExpiry)}</p>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <div className="text-2xl mb-2">🔧</div>
                                        <p className="font-medium text-slate-800">Service</p>
                                        <p className="text-sm text-yellow-600">Due {formatDateForDisplay(assignedVehicle.serviceDue)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Total Payments" value={`$${totalRentPaid.toLocaleString()}`} />
                            <StatCard label="Outstanding Fines" value={`$${unpaidFines.reduce((sum, fine) => sum + fine.amount, 0).toLocaleString()}`} />
                            <StatCard label="Total Bookings" value={driverBookings.length.toString()} />
                            <StatCard label="Days with Vehicle" value={assignedVehicle ? Math.floor((new Date().getTime() - new Date(driver.joinDate).getTime()) / (1000 * 60 * 60 * 24)).toString() : '0'} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Payment History Chart */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment History (Last 6 Months)</h3>
                                <div className="space-y-3">
                                    {paidPayments.slice(0, 6).map((payment, index) => (
                                        <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">Week of {formatDateForDisplay(payment.dueDate)}</p>
                                                <p className="text-sm text-slate-500">Paid: {payment.paymentDate ? formatDateForDisplay(payment.paymentDate) : 'N/A'}</p>
                                            </div>
                                            <span className="font-bold text-green-600">${payment.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fine Summary */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Fine Summary</h3>
                                <div className="space-y-3">
                                    {fines.slice(0, 5).map((fine) => (
                                        <div key={fine.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">{fine.serviceName}</p>
                                                <p className="text-sm text-slate-500">{formatDateForDisplay(fine.issueDate)}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-red-600">${fine.amount}</span>
                                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${fine.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {fine.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Export Options */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Export Reports</h3>
                            <div className="flex flex-wrap gap-3">
                                <button className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
                                    📊 Export Payment History
                                </button>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                                    📋 Export Fine Report
                                </button>
                                <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                                    📅 Export Booking History
                                </button>
                                <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
                                    📈 Generate Tax Summary
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800">Documents & Contracts</h3>
                            <button className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
                                📄 Upload Document
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-800">{doc.name}</h4>
                                            <p className="text-sm text-slate-500">{doc.type}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${doc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">Date: {formatDateForDisplay(doc.date)}</p>
                                    <div className="flex gap-2">
                                        <button className="bg-brand-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-brand-blue-700 transition-colors">
                                            📥 Download
                                        </button>
                                        <button className="bg-slate-200 text-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-300 transition-colors">
                                            👁️ View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Document Categories */}
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold text-slate-800 mb-4">Document Categories</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl mb-2">📋</div>
                                    <p className="font-medium text-slate-800">Contracts</p>
                                    <p className="text-sm text-slate-500">{documents.filter(d => d.type === 'contract').length} files</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl mb-2">🛡️</div>
                                    <p className="font-medium text-slate-800">Insurance</p>
                                    <p className="text-sm text-slate-500">{documents.filter(d => d.type === 'insurance').length} files</p>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl mb-2">🔧</div>
                                    <p className="font-medium text-slate-800">Inspections</p>
                                    <p className="text-sm text-slate-500">{documents.filter(d => d.type === 'inspection').length} files</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl mb-2">📊</div>
                                    <p className="font-medium text-slate-800">Reports</p>
                                    <p className="text-sm text-slate-500">0 files</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Support Tab */}
                {activeTab === 'support' && (
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Support Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                                    <div className="text-2xl mb-2">🔧</div>
                                    <p className="font-medium text-slate-800">Report Maintenance</p>
                                </button>
                                <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                                    <div className="text-2xl mb-2">💰</div>
                                    <p className="font-medium text-slate-800">Payment Issue</p>
                                </button>
                                <button className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
                                    <div className="text-2xl mb-2">🚨</div>
                                    <p className="font-medium text-slate-800">Emergency Contact</p>
                                </button>
                                <button className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
                                    <div className="text-2xl mb-2">📞</div>
                                    <p className="font-medium text-slate-800">General Inquiry</p>
                                </button>
                            </div>
                        </div>

                        {/* Support Tickets */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">My Support Tickets</h3>
                                <button className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
                                    🆕 New Ticket
                                </button>
                            </div>
                            <div className="space-y-3">
                                {supportTickets.map((ticket) => (
                                    <div key={ticket.id} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-800">{ticket.subject}</h4>
                                                <p className="text-sm text-slate-500">Created: {formatDateForDisplay(ticket.date)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-2">📞 Phone Support</h4>
                                    <p className="text-slate-600">0420210227</p>
                                    <p className="text-sm text-slate-500">Available: Mon-Fri 8AM-6PM</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-2">📧 Email Support</h4>
                                    <p className="text-slate-600">northernautohub@gmail.com</p>
                                    <p className="text-sm text-slate-500">Response within 24 hours</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-2">🚨 Emergency</h4>
                                    <p className="text-slate-600">0420210227</p>
                                    <p className="text-sm text-slate-500">24/7 for vehicle emergencies</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-2">📍 Office</h4>
                                    <p className="text-slate-600">101 BROSSARD RD MICKLEHAM VIC 3064</p>
                                    <p className="text-sm text-slate-500">Mon-Fri 8AM-6PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800">Notifications</h3>
                            <button 
                                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                                className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors"
                            >
                                Mark All as Read
                            </button>
                        </div>

                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`p-4 rounded-lg border-l-4 transition-colors ${
                                        notification.read 
                                            ? 'bg-slate-50 border-slate-300' 
                                            : 'bg-blue-50 border-blue-500'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {formatDateForDisplay(notification.date)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Notification Settings */}
                        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                            <h4 className="text-lg font-semibold text-slate-800 mb-4">Notification Settings</h4>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    <span className="text-slate-700">Payment reminders</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    <span className="text-slate-700">Vehicle maintenance alerts</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    <span className="text-slate-700">Fine notifications</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-slate-700">Promotional offers</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DriverView;
