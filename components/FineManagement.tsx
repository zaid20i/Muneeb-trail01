import React, { useState, useMemo } from 'react';
import { Fine, FineStatus, Vehicle, Driver, Booking } from '../types';
import DateInput from './common/DateInput';
import { formatDateForDisplay, convertDDMMYYYYToISO } from '../utils/dateUtils';





const STATUS_OPTIONS = [
  { value: 'Nominated', label: 'Nominated', color: 'bg-blue-100 text-blue-800' },
  { value: 'Paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'Due', label: 'Due', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Pending', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
];

interface FineManagementProps {
  fines: Fine[];
  setFines: React.Dispatch<React.SetStateAction<Fine[]>>;
  vehicles: Vehicle[];
  drivers: Driver[];
  bookings: Booking[];
}

const FineManagement: React.FC<FineManagementProps> = ({ fines, setFines, vehicles, drivers, bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    rego: '',
    date: '',
    amount: '',
    serviceName: '',
    description: '',
    dueDate: '',
    infringementNumber: '',
    status: 'Nominated',
  });
  const [error, setError] = useState<string | null>(null);

  const filteredFines = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return fines.filter(f => {
      const vehicle = vehicles.find(v => v.id === f.vehicleId);
      const driver = drivers.find(d => d.id === f.driverId);
      return (
        (vehicle?.rego.toLowerCase().includes(lower) || '') ||
        (driver?.name.toLowerCase().includes(lower) || '') ||
        (f.serviceName.toLowerCase().includes(lower)) ||
        (f.infringementNumber?.toLowerCase().includes(lower) || '')
      );
    });
  }, [fines, vehicles, drivers, searchTerm]);

  const handleOpenModal = () => {
    setForm({ rego: '', date: '', amount: '', serviceName: '', description: '', dueDate: '', infringementNumber: '', status: 'Nominated' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!form.rego || !form.date || !form.amount || !form.serviceName || !form.dueDate || !form.infringementNumber || !form.status) {
      setError('Please fill all required fields.');
      return;
    }

    // Date validation is handled by DateInput component

    // Find vehicle
    const vehicle = vehicles.find(v => v.rego.toLowerCase() === form.rego.toLowerCase());
    if (!vehicle) {
      setError('Vehicle not found.');
      return;
    }

    // Convert DD-MM-YYYY to YYYY-MM-DD for comparison with booking dates
    const offenceDateYYYYMMDD = convertDDMMYYYYToISO(form.date);
    if (!offenceDateYYYYMMDD) {
      setError('Invalid date format for offence date.');
      return;
    }

    // Find booking for rego and offence date
    const booking = bookings.find(
      (b: Booking) => b.vehicleRego.toLowerCase() === form.rego.toLowerCase() &&
        b.startDate <= offenceDateYYYYMMDD &&
        b.endDate >= offenceDateYYYYMMDD
    );
    
    if (!booking) {
      setError('No booking found for this rego and offence date.');
      return;
    }
    
    const driverId = booking.driverId;
    if (!driverId) {
      setError('No driver currently assigned to this vehicle.');
      return;
    }

    // Convert dates to ISO format for storage
    const issueDateISO = convertDDMMYYYYToISO(form.date);
    const dueDateISO = convertDDMMYYYYToISO(form.dueDate);
    
    const newFine: Fine = {
      id: 'f' + (fines.length + 1),
      driverId,
      vehicleId: vehicle.id,
      amount: Number(form.amount),
      issueDate: issueDateISO,
      dueDate: dueDateISO,
      serviceName: form.serviceName,
      status: form.status as any,
      description: form.description,
      infringementNumber: form.infringementNumber,
    };
    setFines(prev => [newFine, ...prev]);
    setIsModalOpen(false);
  };

  // Date formatting is now handled by imported formatDateForDisplay utility

  function getStatusColor(status: string) {
    const found = STATUS_OPTIONS.find(opt => opt.value === status);
    return found ? found.color : 'bg-slate-100 text-slate-800';
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Fine Management</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by rego, driver, service, or infringement..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="p-2 border rounded-md w-64 pl-9"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button onClick={handleOpenModal} className="px-4 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Add Fine
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-3 text-sm font-semibold text-slate-600">Fine #</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Infringement #</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Vehicle Rego</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Driver</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Service Name</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Issue Date</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Due Date</th>
              <th className="p-3 text-sm font-semibold text-slate-600 text-right">Amount</th>
              <th className="p-3 text-sm font-semibold text-slate-600 text-center">Status</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredFines.length > 0 ? filteredFines.map(f => {
              const vehicle = vehicles.find(v => v.id === f.vehicleId);
              const driver = drivers.find(d => d.id === f.driverId);
              return (
                <tr key={f.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 text-slate-500 font-mono text-xs">{f.id}</td>
                  <td className="p-3 text-slate-700 font-mono">{f.infringementNumber || '-'}</td>
                  <td className="p-3 text-slate-700 font-mono">{vehicle?.rego || 'N/A'}</td>
                  <td className="p-3 text-slate-800 font-medium">{driver?.name || 'N/A'}</td>
                  <td className="p-3 text-slate-800">{f.serviceName}</td>
                  <td className="p-3 text-slate-600">{formatDateForDisplay(f.issueDate)}</td>
                  <td className="p-3 text-slate-600">{formatDateForDisplay(f.dueDate)}</td>
                  <td className="p-3 text-red-600 font-bold text-right">${f.amount}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(f.status)}`}>{f.status}</span>
                  </td>
                  <td className="p-3 text-slate-600">{f.description || '-'}</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={10} className="text-center p-6 text-slate-500">No fines found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal for adding fine */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Nominate Fine</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Registration No.</label>
                <input name="rego" value={form.rego} onChange={handleChange} className="p-2 border rounded-md w-full" placeholder="e.g., 1AB-2CD" required />
              </div>
              <div>
                <DateInput 
                  name="date" 
                  value={form.date} 
                  onChange={handleChange} 
                  label="Date of Offence"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <input name="amount" type="number" value={form.amount} onChange={handleChange} className="p-2 border rounded-md w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                <input name="serviceName" value={form.serviceName} onChange={handleChange} className="p-2 border rounded-md w-full" placeholder="e.g., Transport for NSW" required />
              </div>
              <div>
                <DateInput 
                  name="dueDate" 
                  value={form.dueDate} 
                  onChange={handleChange} 
                  label="Due Date"
                  isExpiryDate={true}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Infringement Number</label>
                <input name="infringementNumber" value={form.infringementNumber} onChange={handleChange} className="p-2 border rounded-md w-full" placeholder="e.g., 12345678" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="p-2 border rounded-md w-full" required>
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="p-2 border rounded-md w-full h-20" placeholder="Short description of the offence..." />
              </div>
              {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700">Add Fine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineManagement; 
