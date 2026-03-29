const bcrypt = require('bcryptjs');
const { User, Driver, Vehicle, Contract, Payment, Fine, Notification, SupportTicket, Document, Settings, sync } = require('../models');

async function seed() {
  await sync();

  // Admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@northern.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    status: 'active'
  });

  // Demo drivers
  const drivers = await Promise.all([
    User.create({
      name: 'John Smith', email: 'john@example.com', password: bcrypt.hashSync('password123', 10), role: 'driver', status: 'active'
    }),
    User.create({
      name: 'Sarah Connor', email: 'sarah@example.com', password: bcrypt.hashSync('password123', 10), role: 'driver', status: 'pending'
    }),
    User.create({
      name: 'Michael Johnson', email: 'mike@example.com', password: bcrypt.hashSync('password123', 10), role: 'driver', status: 'active'
    }),
    User.create({
      name: 'Emma Wilson', email: 'emma@example.com', password: bcrypt.hashSync('password123', 10), role: 'driver', status: 'inactive'
    })
  ]);

  // Driver profiles
  await Promise.all([
    Driver.create({ userId: drivers[0].id, phone: '0412345678', address: '123 Collins St, Melbourne VIC 3000', licenseNumber: 'VIC123456', licenseExpiry: '31-12-2025', profileImageUrl: '', joinDate: '15-01-2024', contractEndDate: '', dateOfBirth: '15-05-1990', status: 'active' }),
    Driver.create({ userId: drivers[1].id, phone: '0423456789', address: '456 Swanston St, Melbourne VIC 3000', licenseNumber: 'VIC234567', licenseExpiry: '20-08-2026', profileImageUrl: '', joinDate: '01-02-2024', contractEndDate: '', dateOfBirth: '22-09-1988', status: 'pending' }),
    Driver.create({ userId: drivers[2].id, phone: '0434567890', address: '789 Bourke St, Melbourne VIC 3000', licenseNumber: 'VIC345678', licenseExpiry: '15-03-2025', profileImageUrl: '', joinDate: '20-01-2024', contractEndDate: '', dateOfBirth: '10-12-1985', status: 'active' }),
    Driver.create({ userId: drivers[3].id, phone: '0445678901', address: '321 Flinders St, Melbourne VIC 3000', licenseNumber: 'VIC456789', licenseExpiry: '30-06-2027', profileImageUrl: '', joinDate: '05-11-2023', contractEndDate: '', dateOfBirth: '18-03-1992', status: 'inactive' })
  ]);

  // Vehicles
  const vehicles = await Promise.all([
    Vehicle.create({ make: 'Toyota', model: 'Corolla', year: 2020, rego: 'VIC001', status: 'Available', weeklyRent: 350, bond: 1000, imageUrl: '', insuranceExpiry: '15-06-2025', serviceDue: '01-12-2024', driverId: null, odometer: 42000, purchasePrice: 22000, description: 'Reliable sedan, perfect for rideshare and personal use.' }),
    Vehicle.create({ make: 'Hyundai', model: 'i30', year: 2019, rego: 'VIC002', status: 'Hired', weeklyRent: 320, bond: 900, imageUrl: '', insuranceExpiry: '20-04-2025', serviceDue: '15-11-2024', driverId: drivers[0].id, odometer: 51000, purchasePrice: 18000, description: 'Compact hatchback, excellent fuel efficiency.' }),
    Vehicle.create({ make: 'Mazda', model: '3', year: 2021, rego: 'VIC003', status: 'Maintenance', weeklyRent: 370, bond: 1100, imageUrl: '', insuranceExpiry: '30-08-2025', serviceDue: '10-10-2024', driverId: null, odometer: 33000, purchasePrice: 24000, description: 'Sporty sedan with premium interior and advanced safety features.' }),
    Vehicle.create({ make: 'Honda', model: 'Civic', year: 2022, rego: 'VIC004', status: 'Hired', weeklyRent: 400, bond: 1200, imageUrl: '', insuranceExpiry: '31-12-2025', serviceDue: '01-08-2024', driverId: drivers[2].id, odometer: 21000, purchasePrice: 26000, description: 'Latest model with modern technology and low mileage.' }),
    Vehicle.create({ make: 'Kia', model: 'Cerato', year: 2018, rego: 'VIC005', status: 'Available', weeklyRent: 300, bond: 950, imageUrl: '', insuranceExpiry: '28-02-2025', serviceDue: '01-09-2024', driverId: null, odometer: 67000, purchasePrice: 15000, description: 'Affordable and spacious sedan, well-maintained fleet vehicle.' }),
    Vehicle.create({ make: 'Nissan', model: 'Micra', year: 2020, rego: 'VIC006', status: 'Available', weeklyRent: 280, bond: 800, imageUrl: '', insuranceExpiry: '15-05-2025', serviceDue: '01-07-2024', driverId: null, odometer: 35000, purchasePrice: 16000, description: 'Compact and economical, ideal for city driving.' })
  ]);

  // Contracts
  await Contract.create({ driverId: drivers[0].id, vehicleId: vehicles[1].id, startDate: '01-11-2024', endDate: '30-04-2025', weeklyRate: 320, status: 'Active', submittedDate: '01-11-2024', approvedDate: '02-11-2024', adminNotes: 'Demo contract' });

  // Payments
  await Payment.bulkCreate([
    { driverId: drivers[0].id, vehicleId: vehicles[1].id, amount: 320, dueDate: '02-12-2024', status: 'Due' },
    { driverId: drivers[0].id, vehicleId: vehicles[1].id, amount: 320, dueDate: '25-11-2024', status: 'Paid', paymentDate: '24-11-2024' },
    { driverId: drivers[2].id, vehicleId: vehicles[3].id, amount: 400, dueDate: '09-12-2024', status: 'Due' },
    { driverId: drivers[2].id, vehicleId: vehicles[3].id, amount: 400, dueDate: '02-12-2024', status: 'Overdue' }
  ]);

  // Fines
  await Fine.bulkCreate([
    { driverId: drivers[0].id, vehicleId: vehicles[1].id, amount: 185, issueDate: '15-11-2024', dueDate: '15-12-2024', serviceName: 'VicRoads', status: 'Unpaid', description: 'Speeding - 68 km/h in 60 km/h zone', infringementNumber: 'VIC123456' },
    { driverId: drivers[2].id, vehicleId: vehicles[3].id, amount: 99, issueDate: '10-11-2024', dueDate: '10-12-2024', paymentDate: '18-11-2024', serviceName: 'Melbourne City Council', status: 'Paid', description: 'Parking fine - Expired meter', infringementNumber: 'MCC789012' }
  ]);

  // Notifications
  await Notification.bulkCreate([
    { userId: admin.id, type: 'system', title: 'Welcome', message: 'Welcome to Northern Autohub Rentals!', priority: 'medium', read: false },
    { userId: drivers[0].id, type: 'payment', title: 'Payment Due', message: 'Your weekly payment is due.', priority: 'high', read: false }
  ]);

  // Support Tickets
  await SupportTicket.bulkCreate([
    { driverId: drivers[0].id, vehicleId: vehicles[0].id, title: 'Vehicle air conditioning not working', description: 'AC stopped working after last service.', priority: 'medium', status: 'open', category: 'vehicle', submittedBy: 'John Smith', lastUpdated: '2024-01-15' },
    { driverId: drivers[1].id, title: 'Payment processing issue', description: 'Unable to process weekly payment.', priority: 'high', status: 'in-progress', category: 'payment', submittedBy: 'Sarah Connor', lastUpdated: '2024-01-14' }
  ]);

  // Documents
  await Document.bulkCreate([
    { name: 'John Smith - Driver License', type: 'license', category: 'driver', status: 'active', uploadDate: '2024-01-01', expiryDate: '2025-12-31', fileSize: '2.3 MB', fileType: 'PDF', uploadedBy: 'John Smith', relatedId: drivers[0].id, description: 'Current Victorian driver license', version: 1, isRequired: true },
    { name: 'Vehicle Insurance - Toyota Corolla VIC001', type: 'insurance', category: 'vehicle', status: 'active', uploadDate: '2024-01-15', expiryDate: '2024-06-15', fileSize: '1.8 MB', fileType: 'PDF', uploadedBy: 'Admin', relatedId: vehicles[0].id, description: 'Comprehensive insurance policy', version: 2, isRequired: true }
  ]);

  // Settings
  await Settings.create({
    companyName: 'Northern Autohub Rentals',
    email: 'info@northern.com',
    phone: '+61 3 9000 0000',
    address: '123 Collins Street, Melbourne VIC 3000',
    website: 'www.northern.com',
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

  console.log('Demo data seeded!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); }); 