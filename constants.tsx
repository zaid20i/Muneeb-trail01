import React from 'react';
import { Vehicle, VehicleStatus, DashboardStats, NavItem, View, Driver, DriverStatus, Payment, PaymentStatus, Expense, ExpenseType, Fine, Booking } from './types';

export const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    fleet: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.87a3 3 0 01-.879-2.122v-1.007M15 5.25a3 3 0 00-6 0v6a3 3 0 006 0v-6z" /></svg>,
    drivers: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.003c0 1.113.285 2.16.786 3.07M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    payments: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4.5a1.5 1.5 0 010 3H12m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 18c-1.11 0-2.08-.402-2.599-1m2.599 1v-1m0 1h4.5a1.5 1.5 0 000-3H12m0 0v-1m0 1c1.11 0 2.08.402 2.599 1m-2.599-1c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2-1.343 2-3 2z" /></svg>,
    reports: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    logo: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l-4 4-4-4-4 4"></path></svg>,
    fines: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" /></svg>,
    contracts: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    notifications: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    support: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" /></svg>,
    documents: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7V3a1 1 0 011-1h8a1 1 0 011 1v4M7 7h10M7 7v10a1 1 0 001 1h8a1 1 0 001-1V7M7 17h10" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 4V4m0 8v4m0-4v4m8-4h-4m4 0h-4m-8 0H4m4 0H4" /></svg>,
};

export const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { id: 'notifications', label: 'Notifications', icon: ICONS.notifications },
    { id: 'fleet', label: 'Fleet', icon: ICONS.fleet },
    { id: 'drivers', label: 'Drivers', icon: ICONS.drivers },
    { id: 'contracts', label: 'Contracts', icon: ICONS.contracts },
    { id: 'payments', label: 'Payments', icon: ICONS.payments },
    { id: 'fines', label: 'Fines', icon: ICONS.fines },
    { id: 'support', label: 'Support', icon: ICONS.support },
    { id: 'reports', label: 'Reports', icon: ICONS.reports },
    { id: 'documents', label: 'Documents', icon: ICONS.documents },
    { id: 'settings', label: 'Settings', icon: ICONS.settings },
];

export const MOCK_STATS: DashboardStats = {
    totalCars: 6,
    activeDrivers: 2,
    weeklyEarnings: 1440,
    outstandingDues: 685,
};

// Essential demo drivers with different statuses for testing
export const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', name: 'John Smith', email: 'john@example.com', password: 'password123', phone: '0412345678', address: '123 Collins St, Melbourne VIC 3000', licenseNumber: 'VIC123456', licenseExpiry: '31-12-2025', status: DriverStatus.Active, profileImageUrl: '', documents: [], joinDate: '15-01-2024', contractEndDate: '', dateOfBirth: '15-05-1990' },
  { id: 'd2', name: 'Sarah Connor', email: 'sarah@example.com', password: 'password123', phone: '0423456789', address: '456 Swanston St, Melbourne VIC 3000', licenseNumber: 'VIC234567', licenseExpiry: '20-08-2026', status: DriverStatus.Pending, profileImageUrl: '', documents: [], joinDate: '01-02-2024', contractEndDate: '', dateOfBirth: '22-09-1988' },
  { id: 'd3', name: 'Michael Johnson', email: 'mike@example.com', password: 'password123', phone: '0434567890', address: '789 Bourke St, Melbourne VIC 3000', licenseNumber: 'VIC345678', licenseExpiry: '15-03-2025', status: DriverStatus.Active, profileImageUrl: '', documents: [], joinDate: '20-01-2024', contractEndDate: '', dateOfBirth: '10-12-1985' },
  { id: 'd4', name: 'Emma Wilson', email: 'emma@example.com', password: 'password123', phone: '0445678901', address: '321 Flinders St, Melbourne VIC 3000', licenseNumber: 'VIC456789', licenseExpiry: '30-06-2027', status: DriverStatus.Inactive, profileImageUrl: '', documents: [], joinDate: '05-11-2023', contractEndDate: '', dateOfBirth: '18-03-1992' },
];

// Demo vehicles showing different statuses and price ranges
export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', make: 'Toyota', model: 'Corolla', year: 2020, rego: 'VIC001', status: VehicleStatus.Available, weeklyRent: 350, bond: 1000, imageUrl: '', insuranceExpiry: '15-06-2025', serviceDue: '01-12-2024', driverId: '', odometer: 42000, purchasePrice: 22000, description: 'Reliable sedan, perfect for rideshare and personal use.' },
  { id: 'v2', make: 'Hyundai', model: 'i30', year: 2019, rego: 'VIC002', status: VehicleStatus.Hired, weeklyRent: 320, bond: 900, imageUrl: '', insuranceExpiry: '20-04-2025', serviceDue: '15-11-2024', driverId: 'd1', odometer: 51000, purchasePrice: 18000, description: 'Compact hatchback, excellent fuel efficiency.' },
  { id: 'v3', make: 'Mazda', model: '3', year: 2021, rego: 'VIC003', status: VehicleStatus.Maintenance, weeklyRent: 370, bond: 1100, imageUrl: '', insuranceExpiry: '30-08-2025', serviceDue: '10-10-2024', driverId: '', odometer: 33000, purchasePrice: 24000, description: 'Sporty sedan with premium interior and advanced safety features.' },
  { id: 'v4', make: 'Honda', model: 'Civic', year: 2022, rego: 'VIC004', status: VehicleStatus.Hired, weeklyRent: 400, bond: 1200, imageUrl: '', insuranceExpiry: '31-12-2025', serviceDue: '01-08-2024', driverId: 'd3', odometer: 21000, purchasePrice: 26000, description: 'Latest model with modern technology and low mileage.' },
  { id: 'v5', make: 'Kia', model: 'Cerato', year: 2018, rego: 'VIC005', status: VehicleStatus.Available, weeklyRent: 300, bond: 950, imageUrl: '', insuranceExpiry: '28-02-2025', serviceDue: '01-09-2024', driverId: '', odometer: 67000, purchasePrice: 15000, description: 'Affordable and spacious sedan, well-maintained fleet vehicle.' },
  { id: 'v6', make: 'Nissan', model: 'Micra', year: 2020, rego: 'VIC006', status: VehicleStatus.Available, weeklyRent: 280, bond: 800, imageUrl: '', insuranceExpiry: '15-05-2025', serviceDue: '01-07-2024', driverId: '', odometer: 35000, purchasePrice: 16000, description: 'Compact and economical, ideal for city driving.' },
];

export const EARNINGS_DATA = [
    { name: 'Mon', earnings: 1200 },
    { name: 'Tue', earnings: 980 },
    { name: 'Wed', earnings: 1500 },
    { name: 'Thu', earnings: 1350 },
    { name: 'Fri', earnings: 1800 },
    { name: 'Sat', earnings: 2100 },
    { name: 'Sun', earnings: 1900 },
];

export const MOCK_PAYMENTS: Payment[] = [
    { id: 'p1', driverId: 'd1', vehicleId: 'v2', amount: 320, dueDate: '02-12-2024', status: PaymentStatus.Due },
    { id: 'p2', driverId: 'd1', vehicleId: 'v2', amount: 320, dueDate: '25-11-2024', status: PaymentStatus.Paid, paymentDate: '24-11-2024' },
    { id: 'p3', driverId: 'd3', vehicleId: 'v4', amount: 400, dueDate: '09-12-2024', status: PaymentStatus.Due },
    { id: 'p4', driverId: 'd3', vehicleId: 'v4', amount: 400, dueDate: '02-12-2024', status: PaymentStatus.Overdue },
];

export const MOCK_EXPENSES: Expense[] = [
    { id: 'e1', vehicleId: 'v1', type: ExpenseType.Maintenance, amount: 350, date: '15-11-2024', description: 'Scheduled service and oil change' },
    { id: 'e2', vehicleId: 'v3', type: ExpenseType.Repairs, amount: 680, date: '20-11-2024', description: 'Brake pad replacement - maintenance status' },
    { id: 'e3', vehicleId: 'v2', type: ExpenseType.Insurance, amount: 1200, date: '01-10-2024', description: 'Annual comprehensive insurance premium' },
];

export const MOCK_FINES: Fine[] = [
    { id: 'f1', driverId: 'd1', vehicleId: 'v2', amount: 185, issueDate: '15-11-2024', dueDate: '15-12-2024', serviceName: 'VicRoads', status: 'Unpaid', description: 'Speeding - 68 km/h in 60 km/h zone', infringementNumber: 'VIC123456' },
    { id: 'f2', driverId: 'd3', vehicleId: 'v4', amount: 99, issueDate: '10-11-2024', dueDate: '10-12-2024', paymentDate: '18-11-2024', serviceName: 'Melbourne City Council', status: 'Paid', description: 'Parking fine - Expired meter', infringementNumber: 'MCC789012' },
];

// Demo bookings matching hired vehicles
export const MOCK_BOOKINGS: Booking[] = [
  { driverId: 'd1', vehicleId: 'v2', vehicleRego: 'VIC002', startDate: '01-11-2024', endDate: '30-04-2025' },
  { driverId: 'd3', vehicleId: 'v4', vehicleRego: 'VIC004', startDate: '15-10-2024', endDate: '15-03-2025' },
];

export const MOCK_ADMIN_CREDENTIALS = {
    email: 'admin@outly.com',
    password: 'adminpassword',
};

export const AU_STATES = [
  { value: "VIC", label: "Victoria" },
  { value: "NSW", label: "New South Wales" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];
