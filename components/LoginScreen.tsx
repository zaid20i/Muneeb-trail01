import React, { useState } from 'react';
import { Driver, SignupFormData, DriverStatus } from '../types';
import { ICONS, MOCK_ADMIN_CREDENTIALS } from '../constants';
import SignUp from "./SignUp";



interface LoginScreenProps {
    onLogin: (role: 'admin' | 'driver', driverId?: string) => void;
    drivers: Driver[];
    onSignup?: (driver: SignupFormData) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, drivers, onSignup }) => {
    // Driver state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Admin state
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [admin2fa, setAdmin2fa] = useState('');
    const [adminRobotChecked, setAdminRobotChecked] = useState(false);
    const [adminError, setAdminError] = useState<string | null>(null);

    const [showSignup, setShowSignup] = useState(false);

    const [showDriverPassword, setShowDriverPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);


    const handleDriverLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const driver = drivers.find(d => d.email.toLowerCase() === email.toLowerCase());

        if (driver && driver.password === password) {
            onLogin('driver', driver.id);
        } else {
            setError('Invalid email or password.');
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError(null);

        // Basic 2FA validation (must be a 6-digit number for demo)
        const is2faValid = /^\d{6}$/.test(admin2fa);

        if (
            adminEmail.toLowerCase() === MOCK_ADMIN_CREDENTIALS.email &&
            adminPassword === MOCK_ADMIN_CREDENTIALS.password &&
            is2faValid &&
            adminRobotChecked
        ) {
            onLogin('admin');
        } else {
            setAdminError('Invalid credentials or 2FA code.');
        }
    };



    return (
        <div className="flex min-h-screen bg-slate-100 font-sans">
            {/* Admin Panel (Left) */}
            <div className="w-full md:w-1/2 bg-brand-blue-900 flex flex-col justify-between p-8 md:p-12 text-white">
                <div>
                    <div className="flex items-center gap-3">
                        {React.cloneElement(ICONS.logo, { className: "h-10 w-10 text-white"})}
                        <h1 className="text-4xl font-bold">Outly</h1>
                    </div>
                    <p className="mt-4 text-lg text-brand-blue-200 max-w-sm">
                        The complete car rental fleet management system.
                    </p>
                </div>

                <div className="w-full max-w-sm mt-8 md:mt-0">
                    <h3 className="text-2xl font-semibold mb-6">Admin Login</h3>
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div>
                            <label htmlFor="admin-email" className="block text-sm font-medium text-brand-blue-200 mb-1">Email Address</label>
                            <input
                                id="admin-email"
                                type="email"
                                required
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                className="w-full p-3 bg-brand-blue-800 border border-brand-blue-700 rounded-md shadow-sm placeholder-brand-blue-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                placeholder="admin@outly.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="admin-password" className="block text-sm font-medium text-brand-blue-200 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    id="admin-password"
                                    type={showAdminPassword ? "text" : "password"}
                                    required
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    className="w-full p-3 bg-brand-blue-800 border border-brand-blue-700 rounded-md shadow-sm placeholder-brand-blue-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowAdminPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-blue-200 hover:text-white focus:outline-none"
                                    aria-label={showAdminPassword ? "Hide password" : "Show password"}
                                >
                                    {showAdminPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125M3 3l18 18" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.25-2.25a9.956 9.956 0 00-14.5 0M21 21l-4.35-4.35" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                             <label htmlFor="admin-2fa" className="block text-sm font-medium text-brand-blue-200 mb-1">2FA Code (Google/Microsoft)</label>
                             <input
                                 id="admin-2fa"
                                 type="text"
                                 inputMode="numeric"
                                 pattern="\d{6}"
                                 required
                                 value={admin2fa}
                                 onChange={(e) => setAdmin2fa(e.target.value)}
                                 className="w-full p-3 bg-brand-blue-800 border border-brand-blue-700 rounded-md shadow-sm placeholder-brand-blue-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                 placeholder="Enter 6-digit code"
                                 maxLength={6}
                             />
                        </div>
                        <div className="flex items-center pt-2">
                            <input
                                id="admin-robot-checkbox"
                                name="admin-robot-checkbox"
                                type="checkbox"
                                required
                                checked={adminRobotChecked}
                                onChange={(e) => setAdminRobotChecked(e.target.checked)}
                                className="h-4 w-4 text-sky-400 bg-brand-blue-800 border-brand-blue-600 rounded focus:ring-sky-500 focus:ring-offset-brand-blue-900"
                            />
                            <label htmlFor="admin-robot-checkbox" className="ml-2 block text-sm text-brand-blue-200">
                                I'm not a robot
                            </label>
                        </div>
                        {adminError && (
                            <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{adminError}</p>
                        )}
                        <div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-3 px-6 py-3 mt-2 text-white bg-brand-blue-700 rounded-lg hover:bg-brand-blue-600 transition-colors font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-blue-900 focus:ring-sky-500"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Driver Panel (Right) */}
            <div className="w-full md:w-1/2 bg-white py-8 px-8 md:px-16 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Driver Portal</h2>
                    <p className="text-slate-500 mb-8">Login to access your vehicle details and payments.</p>

                    <form onSubmit={handleDriverLogin} className="space-y-6">
                        <div>
                            <label htmlFor="driver-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                id="driver-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="driver-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    id="driver-password"
                                    type={showDriverPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowDriverPassword(!showDriverPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    {showDriverPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="robot-checkbox"
                                name="robot-checkbox"
                                type="checkbox"
                                className="h-4 w-4 text-brand-blue-600 border-slate-300 rounded focus:ring-brand-blue-500"
                                required
                            />
                            <label htmlFor="robot-checkbox" className="ml-2 block text-sm text-slate-900">
                                I'm not a robot
                            </label>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-slate-500">or</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => setShowSignup(true)}
                                className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-md bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sign Up Modal Popup */}
            {showSignup && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                            onClick={() => setShowSignup(false)}
                        />

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
                                <div className="absolute top-0 right-0 pt-4 pr-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSignup(false)}
                                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <SignUp onSuccess={() => setShowSignup(false)} onSignup={onSignup} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginScreen;
