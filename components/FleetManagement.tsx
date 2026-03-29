import React, { useState, useCallback, useMemo } from 'react';
import { Vehicle, VehicleStatus, Driver } from '../types';
import { generateVehicleDescription } from '../services/geminiService';
import DateInput from './common/DateInput';
import { formatDateForDisplay } from '../utils/dateUtils';

const statusColors: Record<VehicleStatus, string> = {
    [VehicleStatus.Available]: 'bg-green-100 text-green-800',
    [VehicleStatus.Hired]: 'bg-blue-100 text-blue-800',
    [VehicleStatus.Maintenance]: 'bg-yellow-100 text-yellow-800',
};

type FleetTab = 'all' | 'available' | 'hired' | 'maintenance';

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: Vehicle) => void;
    vehicleToEdit: Vehicle | null;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ isOpen, onClose, onSave, vehicleToEdit }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id' | 'imageUrl'>>({
        make: '', model: '', year: new Date().getFullYear(), rego: '',
        odometer: 0, bond: 0, purchasePrice: 0, weeklyRent: 0, status: VehicleStatus.Available,
        insuranceExpiry: '', serviceDue: '', description: '', driverId: undefined
    });
    const [isGenerating, setIsGenerating] = useState(false);

    React.useEffect(() => {
        if (vehicleToEdit) {
            setFormData({ 
                ...vehicleToEdit,
                insuranceExpiry: vehicleToEdit.insuranceExpiry,
                serviceDue: vehicleToEdit.serviceDue
            });
        } else {
            setFormData({
                make: '', model: '', year: new Date().getFullYear(), rego: '',
                odometer: 0, bond: 0, purchasePrice: 0, weeklyRent: 0, status: VehicleStatus.Available,
                insuranceExpiry: '', serviceDue: '', description: '', driverId: undefined
            });
        }
    }, [vehicleToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: ['year', 'purchasePrice', 'weeklyRent', 'odometer', 'bond'].includes(name) ? Number(value) : value }));
    };

    const handleGenerateDesc = useCallback(async () => {
        if (!formData.make || !formData.model || !formData.year) {
            alert("Please fill in Make, Model, and Year to generate a description.");
            return;
        }
        setIsGenerating(true);
        try {
            const description = await generateVehicleDescription(formData.make, formData.model, formData.year);
            setFormData(prev => ({...prev, description}));
        } catch (error) {
            // Error generating description - fail silently
        } finally {
            setIsGenerating(false);
        }
    }, [formData.make, formData.model, formData.year]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: vehicleToEdit?.id || new Date().toISOString(),
            imageUrl: vehicleToEdit?.imageUrl || `https://picsum.photos/seed/${new Date().getTime()}/400/300`,
            insuranceExpiry: formData.insuranceExpiry,
            serviceDue: formData.serviceDue
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{vehicleToEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="make" className="block text-sm font-medium text-slate-700 mb-1">Make</label>
                            <input id="make" name="make" value={formData.make} onChange={handleChange} placeholder="e.g., Toyota" className="p-2 border rounded-md w-full" required />
                        </div>
                         <div>
                            <label htmlFor="model" className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                            <input id="model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g., Camry" className="p-2 border rounded-md w-full" required />
                        </div>
                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                            <input id="year" name="year" type="number" value={formData.year} onChange={handleChange} placeholder="e.g., 2023" className="p-2 border rounded-md w-full" required />
                        </div>
                        <div>
                            <label htmlFor="rego" className="block text-sm font-medium text-slate-700 mb-1">Registration No.</label>
                            <input id="rego" name="rego" value={formData.rego} onChange={handleChange} placeholder="e.g., 1AB-2CD" className="p-2 border rounded-md w-full" required />
                        </div>
                        <div>
                            <label htmlFor="odometer" className="block text-sm font-medium text-slate-700 mb-1">Odometer (km)</label>
                            <input id="odometer" name="odometer" type="number" value={formData.odometer} onChange={handleChange} placeholder="e.g., 55000" className="p-2 border rounded-md w-full" required />
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded-md w-full bg-white" disabled={!!formData.driverId}>
                                {Object.values(VehicleStatus).map(s => <option key={s} value={s} disabled={s === VehicleStatus.Hired && !formData.driverId}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="purchasePrice" className="block text-sm font-medium text-slate-700 mb-1">Purchase Price ($)</label>
                            <input id="purchasePrice" name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} placeholder="e.g., 32000" className="p-2 border rounded-md w-full" />
                        </div>
                        <div>
                            <label htmlFor="weeklyRent" className="block text-sm font-medium text-slate-700 mb-1">Weekly Rent ($)</label>
                            <input id="weeklyRent" name="weeklyRent" type="number" value={formData.weeklyRent} onChange={handleChange} placeholder="e.g., 350" className="p-2 border rounded-md w-full" required />
                        </div>
                        <div>
                            <label htmlFor="bond" className="block text-sm font-medium text-slate-700 mb-1">Bond ($)</label>
                            <input id="bond" name="bond" type="number" value={formData.bond} onChange={handleChange} placeholder="e.g., 500" className="p-2 border rounded-md w-full" required />
                        </div>
                         <div>
                            <DateInput
                                name="insuranceExpiry"
                                value={formData.insuranceExpiry}
                                onChange={handleChange}
                                label="Insurance Expiry"
                                isExpiryDate={true}
                            />
                        </div>
                         <div className="md:col-span-2">
                            <DateInput
                                name="serviceDue"
                                value={formData.serviceDue}
                                onChange={handleChange}
                                label="Service Due"
                                isExpiryDate={true}
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="A short marketing description of the vehicle." className="p-2 border rounded-md w-full h-24" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700">Save Vehicle</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface FleetManagementProps {
    vehicles: Vehicle[];
    setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
    drivers: Driver[];
}

const FleetManagement: React.FC<FleetManagementProps> = ({ vehicles, setVehicles, drivers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<FleetTab>('all');

    const filteredVehicles = useMemo(() => {
        let filtered = vehicles;

        // Filter by status tab
        if (activeTab !== 'all') {
            const statusMap: Record<FleetTab, VehicleStatus> = {
                all: VehicleStatus.Available, // This won't be used
                available: VehicleStatus.Available,
                hired: VehicleStatus.Hired,
                maintenance: VehicleStatus.Maintenance
            };
            filtered = filtered.filter(v => v.status === statusMap[activeTab]);
        }

        // Filter by search term
        const lowercasedTerm = searchTerm.toLowerCase();
        if (lowercasedTerm) {
            filtered = filtered.filter(v =>
                v.make.toLowerCase().includes(lowercasedTerm) ||
                v.model.toLowerCase().includes(lowercasedTerm) ||
                v.rego.toLowerCase().includes(lowercasedTerm)
            );
        }

        return filtered;
    }, [vehicles, searchTerm, activeTab]);

    // Calculate counts for each tab
    const tabCounts = useMemo(() => {
        return {
            all: vehicles.length,
            available: vehicles.filter(v => v.status === VehicleStatus.Available).length,
            hired: vehicles.filter(v => v.status === VehicleStatus.Hired).length,
            maintenance: vehicles.filter(v => v.status === VehicleStatus.Maintenance).length
        };
    }, [vehicles]);

    const handleAdd = () => {
        setVehicleToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setVehicleToEdit(vehicle);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            setVehicles(prev => prev.filter(v => v.id !== id));
        }
    };

    const handleSaveVehicle = (vehicle: Vehicle) => {
        if (vehicleToEdit) {
            setVehicles(prev => prev.map(v => v.id === vehicle.id ? vehicle : v));
        } else {
            setVehicles(prev => [vehicle, ...prev]);
        }
    };
    
    const getDriverName = useCallback((driverId?: string) => {
        if (!driverId) return <span className="text-slate-400">N/A</span>;
        const driver = drivers.find(d => d.id === driverId);
        return driver ? driver.name : <span className="text-rose-500">Unknown Driver</span>;
    }, [drivers]);



    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h3 className="text-xl font-semibold text-slate-800">Vehicle Fleet</h3>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by make, model, rego..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="p-2 border rounded-md w-64 pl-9"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button onClick={handleAdd} className="px-4 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        Add Vehicle
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="border-b border-slate-200 mb-6">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`relative px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                            activeTab === 'all' 
                                ? 'text-brand-blue-600 border-brand-blue-600 bg-brand-blue-50' 
                                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-50'
                        }`}
                    >
                        All Vehicles
                        <span className="ml-2 px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded-full">
                            {tabCounts.all}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`relative px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                            activeTab === 'available' 
                                ? 'text-green-600 border-green-600 bg-green-50' 
                                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-50'
                        }`}
                    >
                        Available
                        <span className="ml-2 px-2 py-1 text-xs bg-green-200 text-green-700 rounded-full">
                            {tabCounts.available}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('hired')}
                        className={`relative px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                            activeTab === 'hired' 
                                ? 'text-blue-600 border-blue-600 bg-blue-50' 
                                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-50'
                        }`}
                    >
                        Hired
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-200 text-blue-700 rounded-full">
                            {tabCounts.hired}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`relative px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                            activeTab === 'maintenance' 
                                ? 'text-yellow-600 border-yellow-600 bg-yellow-50' 
                                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-50'
                        }`}
                    >
                        Maintenance
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-200 text-yellow-700 rounded-full">
                            {tabCounts.maintenance}
                        </span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b bg-slate-50">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-slate-600">Vehicle</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Rego</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Odometer</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Assigned Driver</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Weekly Rent</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Bond</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Insurance Expiry</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Service Due</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehicles.length > 0 ? (
                            filteredVehicles.map(vehicle => (
                                <tr key={vehicle.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3 flex items-center gap-3">
                                        <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-16 h-12 object-cover rounded-md"/>
                                        <div>
                                            <p className="font-bold text-slate-800">{vehicle.make} {vehicle.model}</p>
                                            <p className="text-sm text-slate-500">{vehicle.year}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 text-slate-700 font-mono">{vehicle.rego}</td>
                                    <td className="p-3 text-slate-700">{(vehicle.odometer ?? 0).toLocaleString()} km</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[vehicle.status]}`}>{vehicle.status}</span>
                                    </td>
                                    <td className="p-3 text-slate-700">{getDriverName(vehicle.driverId)}</td>
                                    <td className="p-3 text-slate-700">${(vehicle.weeklyRent ?? 0).toLocaleString()}</td>
                                    <td className="p-3 text-slate-700">${(vehicle.bond ?? 0).toLocaleString()}</td>
                                                                    <td className="p-3 text-slate-700">{formatDateForDisplay(vehicle.insuranceExpiry)}</td>
                                <td className="p-3 text-slate-700">{formatDateForDisplay(vehicle.serviceDue)}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(vehicle)} className="text-slate-500 hover:text-brand-blue-600" aria-label="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => handleDelete(vehicle.id)} className="text-slate-500 hover:text-rose-600" aria-label="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className="text-center p-8 text-slate-500">
                                    {searchTerm ? 'No vehicles found matching your search.' : `No vehicles found in ${activeTab} status.`}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <VehicleFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveVehicle} vehicleToEdit={vehicleToEdit} />
        </div>
    );
};

export default FleetManagement;
