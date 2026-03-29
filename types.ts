export enum VehicleStatus {
  Available = 'Available',
  Hired = 'Hired',
  Maintenance = 'Maintenance',
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  rego: string;
  odometer: number;
  bond: number;
  purchasePrice: number;
  weeklyRent: number;
  status: VehicleStatus;
  insuranceExpiry: string; // DD-MM-YYYY format
  serviceDue: string; // DD-MM-YYYY format
  description: string;
  imageUrl: string;
  driverId?: string;
}

export enum DriverStatus {
  Pending = 'Pending',
  Active = 'Active',
  Inactive = 'Inactive',
}

export interface DriverDocument {
  name: string;
  url: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: string; // DD-MM-YYYY format
  status: DriverStatus;
  documents: DriverDocument[];
  profileImageUrl: string;
  joinDate: string; // DD-MM-YYYY format - This will be the contract start date
  contractEndDate?: string; // DD-MM-YYYY format - Optional end date for inactive drivers
  dateOfBirth: string; // DD-MM-YYYY format
}


export interface DashboardStats {
  totalCars: number;
  activeDrivers: number;
  weeklyEarnings: number;
  outstandingDues: number;
}

export type View = 'dashboard' | 'fleet' | 'drivers' | 'contracts' | 'payments' | 'reports' | 'fines' | 'notifications' | 'support' | 'documents' | 'settings';

export interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

export enum PaymentStatus {
  Paid = 'Paid',
  Due = 'Due',
  Overdue = 'Overdue',
}

export interface Payment {
  id: string;
  driverId: string;
  vehicleId: string;
  amount: number;
  dueDate: string; // DD-MM-YYYY format
  paymentDate?: string; // DD-MM-YYYY format
  status: PaymentStatus;
}

export enum ExpenseType {
  Fuel = 'Fuel',
  Maintenance = 'Maintenance',
  Insurance = 'Insurance',
  Repairs = 'Repairs',
}

export interface Expense {
  id: string;
  vehicleId: string;
  type: ExpenseType;
  amount: number;
  date: string; // DD-MM-YYYY format
  description: string;
}

export type FineStatus = 'Unpaid' | 'Paid' | 'Nominated' | 'Due' | 'Pending';

export interface Fine {
    id: string;
    driverId: string;
    vehicleId: string;
    amount: number;
    issueDate: string; // DD-MM-YYYY format
    dueDate: string; // DD-MM-YYYY format
    paymentDate?: string; // DD-MM-YYYY format
    serviceName: string;
    status: FineStatus;
    description?: string;
    infringementNumber: string;
}

export interface Booking {
    driverId: string;
    vehicleId: string;
    vehicleRego: string;
    startDate: string; // DD-MM-YYYY format
    endDate: string;   // DD-MM-YYYY format
}



export interface SignupFormData {
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string; // DD-MM-YYYY format
    phoneNumber: string;
    gender: string | null;
    street: string;
    suburb: string;
    state: string | null;
    zipCode: string;
    licenseType: string | null;
    otherLicenseCountry: string;
    licenseNumber: string;
    licenseExpiry: string; // DD-MM-YYYY format
    licenseState: string | null;
    licenseFront: File | null;
    licenseBack: File | null;
    proofOfAddress: File | null;
    email: string;
    password: string;
}

export interface LesseeDetails {
    fullName: string;
    address: string;
    contactNumber: string;
    contactEmail: string;
    driversLicense: string;
    dateOfBirth: string;
    licenseType: 'australian' | 'international';
}

export type AcknowledgementKey = 
    | 'noUnauthorizedDrivers'
    | 'licenseRequirements'
    | 'noInfluence'
    | 'noRacing'
    | 'noUnsealedRoads'
    | 'geographicLimits'
    | 'noTowingOrOverloading'
    | 'prohibitedCargo'
    | 'noDrivingWhenUnsafe'
    | 'noModifyOrAbandon'
    | 'noSmoking'
    | 'excessAcknowledgement'
    | 'nonListedDriverExcessAck'
    | 'vehicleChangeFeeAck'
    | 'fineTransferFeeAck'
    | 'cleaningFeeAck'
    | 'hasAgreedToAllTerms';

export interface Acknowledgements {
    noUnauthorizedDrivers: boolean;
    licenseRequirements: boolean;
    noInfluence: boolean;
    noRacing: boolean;
    noUnsealedRoads: boolean;
    geographicLimits: boolean;
    noTowingOrOverloading: boolean;
    prohibitedCargo: boolean;
    noDrivingWhenUnsafe: boolean;
    noModifyOrAbandon: boolean;
    noSmoking: boolean;
    excessAcknowledgement: boolean;
    nonListedDriverExcessAck: boolean;
    vehicleChangeFeeAck: boolean;
    fineTransferFeeAck: boolean;
    cleaningFeeAck: boolean;
    hasAgreedToAllTerms: boolean;
}

export interface RentalApplication {
    id: string;
    driverId: string;
    vehicleId: string;
    status: 'pending' | 'approved' | 'rejected';
    applicationDate: string;
    startDate: string; // DD-MM-YYYY format
    endDate: string; // DD-MM-YYYY format
    weeklyRate: number;
    totalAmount: number;
    bondAmount: number;
    insuranceAmount: number;
    driverAge: number;
    hasInternationalLicense: boolean;
    agreesToInsurance: boolean;
    agreesToSmokingCharges: boolean;
    agreesToCleaningCharges: boolean;
    contractTerms: string;
    lesseeDetails: LesseeDetails;
    acknowledgements: Acknowledgements;
    signatureData?: string;
    insuranceExcess: number;
    agreementDate: string;
}