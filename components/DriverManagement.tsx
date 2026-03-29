import React, { useState, useCallback, useMemo } from 'react';
import { Driver, DriverStatus, Vehicle, VehicleStatus, DriverDocument } from '../types';
import DateInput from './common/DateInput';
import { formatDateForDisplay, getTodayDDMMYYYY, calculateAge } from '../utils/dateUtils';

const statusColors: Record<DriverStatus, string> = {
    [DriverStatus.Active]: 'bg-green-100 text-green-800',
    [DriverStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [DriverStatus.Inactive]: 'bg-slate-100 text-slate-800',
};

type FormData = Omit<Driver, 'id' | 'profileImageUrl' | 'joinDate' | 'documents'> & { documents: File[], contractEndDate?: string, dateOfBirth: string };

interface DriverFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (driver: Driver, assignedVehicleId: string | undefined) => void;
    driverToEdit: Driver | null;
    vehicles: Vehicle[];
}

const DriverFormModal: React.FC<DriverFormModalProps> = ({ isOpen, onClose, onSave, driverToEdit, vehicles }) => {
    const initialFormData = useMemo(() => ({
        name: '', email: '', password: '', phone: '', address: '', licenseNumber: '',
        licenseExpiry: '', status: DriverStatus.Pending,
        documents: [] as File[], contractEndDate: undefined,
        dateOfBirth: ''
    }), []);

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [assignedVehicleId, setAssignedVehicleId] = useState<string | undefined>(undefined);
    const [showPassword, setShowPassword] = useState(false);

    const availableVehicles = useMemo(() => {
        const currentVehicleOfDriver = vehicles.find(v => v.driverId === driverToEdit?.id);
        const unassignedVehicles = vehicles.filter(v => v.status === VehicleStatus.Available);
        if (currentVehicleOfDriver) {
            return [currentVehicleOfDriver, ...unassignedVehicles];
        }
        return unassignedVehicles;
    }, [vehicles, driverToEdit]);

    React.useEffect(() => {
        if (driverToEdit) {
            const { documents, ...rest } = driverToEdit;
            setFormData({ 
                ...rest, 
                password: '', 
                documents: [],
                dateOfBirth: driverToEdit.dateOfBirth,
                licenseExpiry: driverToEdit.licenseExpiry,
                contractEndDate: driverToEdit.contractEndDate || undefined
            }); // Don't try to edit existing files, just allow adding new ones. Clear password for edit.
            const vehicle = vehicles.find(v => v.driverId === driverToEdit.id);
            setAssignedVehicleId(vehicle?.id);
        } else {
            setFormData(initialFormData);
            setAssignedVehicleId(undefined);
        }
    }, [driverToEdit, isOpen, vehicles, initialFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setFormData(prev => ({ ...prev, documents: Array.from(files as FileList) }));
        } else {
            setFormData(prev => ({ ...prev, documents: [] }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalPassword = driverToEdit && !formData.password 
            ? driverToEdit.password 
            : formData.password;

        const finalDriverData: Driver = {
            ...formData,
            password: finalPassword,
            id: driverToEdit?.id || new Date().toISOString(),
            profileImageUrl: driverToEdit?.profileImageUrl || `https://picsum.photos/seed/${new Date().getTime()}/100/100`,
            joinDate: driverToEdit?.joinDate || getTodayDDMMYYYY(),
            // In a real app, you would upload files and get URLs
            documents: formData.documents.map(file => ({ name: file.name, url: '#' })),
            contractEndDate: formData.status === DriverStatus.Inactive && formData.contractEndDate 
                ? formData.contractEndDate 
                : undefined,
            dateOfBirth: formData.dateOfBirth,
            licenseExpiry: formData.licenseExpiry,
        };
        onSave(finalDriverData, assignedVehicleId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{driverToEdit ? 'Edit Driver' : 'Add New Driver'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., John Doe" className="p-2 border rounded-md w-full" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g., john.doe@example.com" className="p-2 border rounded-md w-full" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={driverToEdit ? "Leave blank to keep unchanged" : "••••••••"}
                                    className="p-2 border rounded-md w-full pr-10"
                                    required={!driverToEdit}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125M3 3l18 18" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.25-2.25a9.956 9.956 0 00-14.5 0M21 21l-4.35-4.35" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g., 0412 345 678" className="p-2 border rounded-md w-full" required />
                        </div>
                        <div>
                            <DateInput
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                label="Date of Birth"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="e.g., 123 Fake St, Sydney" className="p-2 border rounded-md w-full" />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                            <input id="licenseNumber" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="e.g., 12345678" className="p-2 border rounded-md w-full" required />
                        </div>
                        <div>
                            <DateInput
                                name="licenseExpiry"
                                value={formData.licenseExpiry}
                                onChange={handleChange}
                                label="License Expiry"
                                required
                                isExpiryDate={true}
                            />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Driver Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded-md w-full bg-white">
                                {Object.values(DriverStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {formData.status === DriverStatus.Inactive && (
                            <div>
                                <DateInput
                                    name="contractEndDate"
                                    value={formData.contractEndDate || ''}
                                    onChange={handleChange}
                                    label="Contract End Date"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="assignedVehicleId" className="block text-sm font-medium text-slate-700 mb-1">Assign Vehicle (Optional)</label>
                            <select id="assignedVehicleId" name="assignedVehicleId" value={assignedVehicleId} onChange={(e) => setAssignedVehicleId(e.target.value)} className="p-2 border rounded-md w-full bg-white">
                                <option value="">No Vehicle Assigned</option>
                                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.rego})</option>)}
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="documents" className="block text-sm font-medium text-slate-700 mb-1">Upload Documents</label>
                            <input id="documents" name="documents" type="file" onChange={handleFileChange} multiple className="p-1.5 border rounded-md w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700">Save Driver</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface DriverManagementProps {
    drivers: Driver[];
    setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    vehicles: Vehicle[];
    setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

const DriverManagement: React.FC<DriverManagementProps> = ({ drivers, setDrivers, vehicles, setVehicles }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<string>('all');
    const [viewDriver, setViewDriver] = useState<Driver | null>(null); // For view modal

    const DRIVER_TABS = [
      { label: 'All Drivers', value: 'all' },
      { label: 'Active', value: DriverStatus.Active },
      { label: 'Pending', value: DriverStatus.Pending },
      { label: 'Inactive', value: DriverStatus.Inactive },
    ];

    const filteredDrivers = useMemo(() => {
      let driversToShow = drivers;
      if (activeTab !== 'all') {
        driversToShow = driversToShow.filter(driver => driver.status === activeTab);
      }
      const lowercasedTerm = searchTerm.toLowerCase();
      if (!lowercasedTerm) return driversToShow;
      return driversToShow.filter(driver => {
        if (
          driver.name.toLowerCase().includes(lowercasedTerm) ||
          driver.email.toLowerCase().includes(lowercasedTerm) ||
          driver.licenseNumber.toLowerCase().includes(lowercasedTerm)
        ) {
          return true;
        }
        const assignedVehicle = vehicles.find(v => v.driverId === driver.id);
        if (assignedVehicle && assignedVehicle.rego.toLowerCase().includes(lowercasedTerm)) {
          return true;
        }
        return false;
      });
    }, [drivers, vehicles, searchTerm, activeTab]);

    const handleAdd = () => {
        setDriverToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (driver: Driver) => {
        setDriverToEdit(driver);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this driver? This will also unassign their vehicle.')) {
            // Unassign vehicle first
            setVehicles(prev => prev.map(v => v.driverId === id ? {...v, driverId: undefined, status: VehicleStatus.Available} : v));
            setDrivers(prev => prev.filter(d => d.id !== id));
        }
    };
    
    const handleApprove = (id: string) => {
        setDrivers(prev => prev.map(d => d.id === id ? {...d, status: DriverStatus.Active} : d));
    }

    const handleSaveDriver = (driverData: Driver, newAssignedVehicleId: string | undefined) => {
        const oldVehicle = vehicles.find(v => v.driverId === driverData.id);
        const newVehicle = newAssignedVehicleId ? vehicles.find(v => v.id === newAssignedVehicleId) : undefined;

        if (oldVehicle?.id !== newVehicle?.id) {
            let updatedVehicles = [...vehicles];
            // Unassign old vehicle
            if (oldVehicle) {
                const oldVIndex = updatedVehicles.findIndex(v => v.id === oldVehicle.id);
                updatedVehicles[oldVIndex] = {...oldVehicle, status: VehicleStatus.Available, driverId: undefined };
            }
            // Assign new vehicle
            if (newVehicle) {
                const newVIndex = updatedVehicles.findIndex(v => v.id === newVehicle.id);
                updatedVehicles[newVIndex] = {...newVehicle, status: VehicleStatus.Hired, driverId: driverData.id };
            }
            setVehicles(updatedVehicles);
        }

        if (driverToEdit) {
            setDrivers(prev => prev.map(d => d.id === driverData.id ? driverData : d));
        } else {
            setDrivers(prev => [driverData, ...prev]);
        }
    };
    
    const getAssignedVehicleRego = useCallback((driverId: string) => {
        const vehicle = vehicles.find(v => v.driverId === driverId);
        return vehicle ? <span className="font-mono">{vehicle.rego}</span> : <span className="text-slate-400">N/A</span>;
    }, [vehicles]);



    return (
        <>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h3 className="text-xl font-semibold text-slate-800">Driver Management</h3>
                 <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search name, email, license, or rego..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="p-2 border rounded-md w-64 pl-9"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button onClick={handleAdd} className="px-4 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        Add Driver
                    </button>
                </div>
            </div>
            {/* Tabs for driver status */}
            <div className="flex gap-2 mb-4">
              {DRIVER_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-md font-medium border transition-colors ${activeTab === tab.value ? 'bg-brand-blue-600 text-white border-brand-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b bg-slate-50">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-slate-600">Driver</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Date of Birth</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">License No.</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Assigned Vehicle</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Contract Period</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDrivers.map(driver => (
                            <tr key={driver.id} className="border-b hover:bg-slate-50">
                                <td className="p-3 flex items-start gap-3">
                                    <img src={driver.profileImageUrl} alt={driver.name} className="w-10 h-10 object-cover rounded-full mt-1"/>
                                    <div>
                                        <p className="font-bold text-slate-800">{driver.name}</p>
                                        <p className="text-sm text-slate-500">{driver.phone}</p>
                                        <p className="text-xs text-slate-400">{driver.address}</p>
                                    </div>
                                </td>
                                <td className="p-3 text-slate-700">
                                    <span>{formatDateForDisplay(driver.dateOfBirth)}</span>
                                    <br />
                                    <span className="text-xs text-slate-400">Age: {calculateAge(driver.dateOfBirth)}</span>
                                </td>
                                <td className="p-3 text-slate-700">
                                    <p className="font-mono">{driver.licenseNumber}</p>
                                    <p className="text-xs text-slate-500">Expires: {formatDateForDisplay(driver.licenseExpiry)}</p>
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[driver.status]}`}>{driver.status}</span>
                                </td>
                                <td className="p-3 text-slate-700">{getAssignedVehicleRego(driver.id)}</td>
                                <td className="p-3 text-slate-700 text-sm">
                                  {driver.status === DriverStatus.Inactive && driver.contractEndDate ? (
                                    <div>
                                      <span>{formatDateForDisplay(driver.joinDate)}</span>
                                      <span className="mx-1"> - </span>
                                      <span>{formatDateForDisplay(driver.contractEndDate)}</span>
                                    </div>
                                  ) : (
                                    <span>Joined: {formatDateForDisplay(driver.joinDate)}</span>
                                  )}
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setViewDriver(driver)} className="text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1 text-xs font-semibold">View</button>
                                        {driver.status === DriverStatus.Pending && 
                                            <button onClick={() => handleApprove(driver.id)} className="text-green-600 hover:text-green-800" aria-label="Approve"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                        }
                                        <button onClick={() => handleEdit(driver)} className="text-slate-500 hover:text-brand-blue-600" aria-label="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                        <button onClick={() => handleDelete(driver.id)} className="text-slate-500 hover:text-rose-600" aria-label="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <DriverFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveDriver} 
                driverToEdit={driverToEdit} 
                vehicles={vehicles}
            />
        </div>
        {/* View Driver Modal */}
        {viewDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
              <button onClick={() => setViewDriver(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
              <h1 className="text-3xl font-bold mb-2 text-slate-800">{viewDriver ? formatDateForDisplay(viewDriver.dateOfBirth) : ''}</h1>
              <h2 className="text-xl font-semibold mb-6 text-slate-600">Age: {viewDriver ? calculateAge(viewDriver.dateOfBirth) : ''}</h2>
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Driver Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {viewDriver?.profileImageUrl && <img src={viewDriver.profileImageUrl} alt={viewDriver.name} className="w-16 h-16 object-cover rounded-full" />}
                  <div>
                    <p className="font-bold text-lg text-slate-800">{viewDriver?.name}</p>
                    <p className="text-sm text-slate-500">{viewDriver?.phone}</p>
                    <p className="text-xs text-slate-400">{viewDriver?.email}</p>
                  </div>
                </div>
                <div><span className="font-semibold">Status:</span> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[viewDriver?.status ?? 'Inactive']}`}>{viewDriver?.status}</span></div>
                <div><span className="font-semibold">License Number:</span> {viewDriver?.licenseNumber}</div>
                <div><span className="font-semibold">License Expiry:</span> {viewDriver ? formatDateForDisplay(viewDriver.licenseExpiry) : ''}</div>
                <div><span className="font-semibold">Address:</span> {viewDriver?.address}</div>
                <div><span className="font-semibold">Join Date:</span> {viewDriver ? formatDateForDisplay(viewDriver.joinDate) : ''}</div>
                {viewDriver?.contractEndDate && <div><span className="font-semibold">Contract End:</span> {formatDateForDisplay(viewDriver.contractEndDate)}</div>}
                <div><span className="font-semibold">Assigned Vehicle:</span> {viewDriver ? getAssignedVehicleRego(viewDriver.id) : ''}</div>
              </div>
            </div>
          </div>
        )}
        </>
    );
};

export default DriverManagement;
