import React, { useState } from 'react';
import { NAV_ITEMS, MOCK_VEHICLES, MOCK_STATS, ICONS, MOCK_DRIVERS, MOCK_PAYMENTS, MOCK_EXPENSES, MOCK_FINES, MOCK_BOOKINGS } from './constants';
import { Vehicle, View, Driver, Payment, Expense, Fine, Booking, VehicleStatus, PaymentStatus, DriverStatus, SignupFormData, RentalApplication as RentalApplicationType } from './types';
import { getTodayDDMMYYYY } from './utils/dateUtils';
import Dashboard from './components/Dashboard';
import FleetManagement from './components/FleetManagement';
import DriverManagement from './components/DriverManagement';
import PaymentManagement from './components/PaymentManagement';
import Reports from './components/Reports';
import LoginScreen from './components/LoginScreen';
import DriverView from './components/DriverView';
import FineManagement from './components/FineManagement';
import ContractManagement from './components/ContractManagement';
import RentalApplication from './components/RentalApplication';
import Notifications from './components/Notifications';
import Support from './components/Support';
import Documents from './components/Documents';
import Settings from './components/Settings';



interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    onLogout: () => void;
    vehicles: Vehicle[];
    drivers: Driver[];
    payments: Payment[];
    fines: Fine[];
    applications: RentalApplicationType[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout, vehicles, drivers, payments, fines, applications }) => {
    // Calculate notification badges
    const getNotificationCount = (viewId: View) => {
        switch (viewId) {
            case 'notifications':
                const pendingDrivers = drivers.filter(d => d.status === DriverStatus.Pending).length;
                const overduePayments = payments.filter(p => p.status === PaymentStatus.Overdue).length;
                const unpaidFines = fines.filter(f => f.status === 'Unpaid').length;
                const maintenanceVehicles = vehicles.filter(v => v.status === VehicleStatus.Maintenance).length;
                return pendingDrivers + overduePayments + unpaidFines + maintenanceVehicles;
            case 'contracts':
                return applications.filter(a => a.status === 'pending').length;
            case 'payments':
                return payments.filter(p => p.status === PaymentStatus.Overdue).length;
            case 'drivers':
                return drivers.filter(d => d.status === DriverStatus.Pending).length;
            case 'fines':
                return fines.filter(f => f.status === 'Unpaid').length;
            case 'fleet':
                return vehicles.filter(v => v.status === VehicleStatus.Maintenance).length;
            default:
                return 0;
        }
    };

    return (
        <nav className="w-64 bg-brand-blue-900 text-white flex flex-col h-full">
            <div className="p-4 mb-4 flex items-center gap-3 border-b border-brand-blue-800">
                {ICONS.logo}
                <h1 className="text-2xl font-bold">Outly</h1>
            </div>
            <ul className="flex-1">
                {NAV_ITEMS.map((item) => {
                    const notificationCount = getNotificationCount(item.id);
                    return (
                        <li key={item.id} className="px-2">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentView(item.id);
                                }}
                                className={`flex items-center justify-between gap-3 p-3 rounded-md transition-colors ${
                                    currentView === item.id
                                        ? 'bg-brand-blue-700 font-semibold'
                                        : 'hover:bg-brand-blue-800'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                {notificationCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                                        {notificationCount > 99 ? '99+' : notificationCount}
                                    </span>
                                )}
                            </a>
                        </li>
                    );
                })}
            </ul>
            <div className="p-4 border-t border-brand-blue-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="https://picsum.photos/seed/admin/40/40" alt="Admin" className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-semibold">Admin User</p>
                            <p className="text-sm text-brand-blue-300">admin@outly.com</p>
                        </div>
                    </div>
                    <button onClick={onLogout} title="Logout" className="text-brand-blue-300 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};

const App: React.FC = () => {
    const [userRole, setUserRole] = useState<'admin' | 'driver' | null>(null);
    const [loggedInDriverId, setLoggedInDriverId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
    const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
    const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [fines, setFines] = useState<Fine[]>(MOCK_FINES);
    const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
    const [rentalApplications, setRentalApplications] = useState<RentalApplicationType[]>([]);


    const handleLogin = (role: 'admin' | 'driver', driverId?: string) => {
        setUserRole(role);
        if (role === 'driver' && driverId) {
            setLoggedInDriverId(driverId);
        }
    };

    const handleDriverSignup = (newDriverData: SignupFormData) => {
        // Generate new driver with proper structure
        const newDriver: Driver = {
            id: `d${Date.now()}`, // Generate unique ID
            profileImageUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
            status: DriverStatus.Pending, // New drivers start as Pending until admin approves contract
            documents: [], // Empty documents array for now
            joinDate: getTodayDDMMYYYY(), // Today's date in DD-MM-YYYY format
            contractEndDate: undefined,
            // Convert signup form data to Driver format
            name: `${newDriverData.firstName} ${newDriverData.middleName ? newDriverData.middleName + ' ' : ''}${newDriverData.lastName}`.trim(),
            phone: newDriverData.phoneNumber,
            address: `${newDriverData.street}, ${newDriverData.suburb}, ${newDriverData.state} ${newDriverData.zipCode}`.replace(/^, |, $|, , /g, ', ').trim(),
            licenseNumber: newDriverData.licenseNumber,
            licenseExpiry: newDriverData.licenseExpiry,
            dateOfBirth: newDriverData.dateOfBirth,
            email: newDriverData.email,
            password: newDriverData.password,
        };

        // Add the new driver to the drivers list
        setDrivers(prev => [...prev, newDriver]);
        
        // Automatically log in the new driver
        handleLogin('driver', newDriver.id);
    };

    const handleRentalApplication = (application: RentalApplicationType) => {
        setRentalApplications(prev => [...prev, application]);
        alert('Rental application submitted successfully! Please wait for admin approval.');
    };

    const handleLogout = () => {
        setUserRole(null);
        setLoggedInDriverId(null);
    };



    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'add-vehicle':
                setCurrentView('fleet');
                break;
            case 'review-applications':
                setCurrentView('contracts');
                break;
            case 'process-payments':
                setCurrentView('payments');
                break;
            case 'generate-report':
                setCurrentView('reports');
                break;
            default:
                break;
        }
    };

    const renderAdminView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard 
                    stats={MOCK_STATS} 
                    vehicles={vehicles}
                    drivers={drivers}
                    payments={payments}
                    fines={fines}
                    applications={rentalApplications}
                    onQuickAction={handleQuickAction}
                />;
            case 'fleet':
                return <FleetManagement vehicles={vehicles} setVehicles={setVehicles} drivers={drivers} />;
            case 'drivers':
                return <DriverManagement drivers={drivers} setDrivers={setDrivers} vehicles={vehicles} setVehicles={setVehicles} />;
            case 'payments':
                return <PaymentManagement payments={payments} setPayments={setPayments} drivers={drivers} vehicles={vehicles} />;
            case 'reports':
                return <Reports payments={payments} expenses={expenses} vehicles={vehicles} drivers={drivers} />;
            case 'contracts':
                return <ContractManagement applications={rentalApplications} setApplications={setRentalApplications} drivers={drivers} vehicles={vehicles} setVehicles={setVehicles} setDrivers={setDrivers} />;
            case 'fines':
                return <FineManagement fines={fines} setFines={setFines} vehicles={vehicles} drivers={drivers} bookings={bookings} />;
            case 'notifications':
                return <Notifications vehicles={vehicles} drivers={drivers} payments={payments} fines={fines} applications={rentalApplications} />;
            case 'support':
                return <Support drivers={drivers} vehicles={vehicles} />;
            case 'documents':
                return <Documents drivers={drivers} vehicles={vehicles} />;
            case 'settings':
                return <Settings drivers={drivers} />;

            default:
                return <Dashboard 
                    stats={MOCK_STATS} 
                    vehicles={vehicles}
                    drivers={drivers}
                    payments={payments}
                    fines={fines}
                    applications={rentalApplications}
                    onQuickAction={handleQuickAction}
                />;
        }
    };

    // Error fallback
    if (error) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading App</h1>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    if (!userRole) {
        return (
            <LoginScreen 
                onLogin={handleLogin} 
                drivers={drivers} 
                onSignup={handleDriverSignup}
            />
        );
    }

    if (userRole === 'admin') {
        return (
            <div className="flex h-screen font-sans bg-slate-100">
                <Sidebar 
                    currentView={currentView} 
                    setCurrentView={setCurrentView} 
                    onLogout={handleLogout}
                    vehicles={vehicles}
                    drivers={drivers}
                    payments={payments}
                    fines={fines}
                    applications={rentalApplications}
                />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white border-b border-slate-200 p-4 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-800 capitalize">{currentView}</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto p-6">
                        {renderAdminView()}
                    </div>
                </main>
            </div>
        );
    }

    if (userRole === 'driver' && loggedInDriverId) {
        const currentDriver = drivers.find(d => d.id === loggedInDriverId);
        const driverVehicle = vehicles.find(v => v.driverId === loggedInDriverId);
        
        if (!currentDriver) {
            return <div>Driver not found</div>;
        }

        return (
            <DriverView 
                driver={currentDriver} 
                vehicle={driverVehicle}
                payments={payments}
                fines={fines}
                onLogout={handleLogout}
                bookings={bookings}
                allVehicles={vehicles}
                onSubmitApplication={handleRentalApplication}
            />
        );
    }

    // Fallback - should not be reached
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
                <p className="text-gray-600">Please wait while the application loads.</p>
            </div>
        </div>
    );
};

export default App;
