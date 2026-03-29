import React, { useState, useMemo } from 'react';
import { Driver, Vehicle, RentalApplication } from '../types';
import { formatDateForDisplay } from '../utils/dateUtils';

interface ContractManagementProps {
  applications: RentalApplication[];
  setApplications: React.Dispatch<React.SetStateAction<RentalApplication[]>>;
  drivers: Driver[];
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
}

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

interface ApplicationWithStatus extends RentalApplication {
  status: ApplicationStatus;
  submittedDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  adminNotes?: string;
}

const ContractManagement: React.FC<ContractManagementProps> = ({
  applications,
  setApplications,
  drivers,
  vehicles,
  setVehicles,
  setDrivers
}) => {
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithStatus | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Convert applications to include status
  const applicationsWithStatus: ApplicationWithStatus[] = useMemo(() => {
    return applications.map(app => ({
      ...app,
      status: 'pending' as ApplicationStatus,
      submittedDate: new Date().toISOString().split('T')[0]
    }));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    let filtered = applicationsWithStatus;

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(app => app.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const driver = drivers.find(d => d.id === app.driverId);
        const vehicle = vehicles.find(v => v.id === app.vehicleId);
        
        return (
          driver?.name.toLowerCase().includes(lowercaseSearch) ||
          driver?.email.toLowerCase().includes(lowercaseSearch) ||
          vehicle?.rego.toLowerCase().includes(lowercaseSearch) ||
          `${vehicle?.make} ${vehicle?.model}`.toLowerCase().includes(lowercaseSearch)
        );
      });
    }

    // Sort by submission date (newest first)
    return filtered.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
  }, [applicationsWithStatus, activeTab, searchTerm, drivers, vehicles]);

  const getDriverName = (driverId: string) => {
    return drivers.find(d => d.id === driverId)?.name || 'Unknown Driver';
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.rego})` : 'Unknown Vehicle';
  };

  const getDriver = (driverId: string) => {
    return drivers.find(d => d.id === driverId);
  };

  const getVehicle = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const handleApproveApplication = (applicationId: string) => {
    const application = applicationsWithStatus.find(a => a.driverId === applicationId);
    if (!application) return;

    // Update application status
    setApplications(prev => prev.map(app => 
      app.driverId === applicationId 
        ? { ...app, status: 'approved' as ApplicationStatus }
        : app
    ));

    // Update vehicle status to hired and assign driver
    setVehicles(prev => prev.map(v => 
      v.id === application.vehicleId 
        ? { ...v, status: 'Hired' as any, driverId: application.driverId }
        : v
    ));

    // Update driver status to active
    setDrivers(prev => prev.map(d => 
      d.id === application.driverId 
        ? { ...d, status: 'Active' as any }
        : d
    ));

    setAdminNotes('');
    alert('Application approved successfully! Vehicle has been assigned to the driver.');
  };

  const handleRejectApplication = (applicationId: string) => {
    setApplications(prev => prev.map(app => 
      app.driverId === applicationId 
        ? { ...app, status: 'rejected' as ApplicationStatus }
        : app
    ));

    setAdminNotes('');
    alert('Application rejected. Driver will be notified.');
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800">Rental Applications</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="p-2 border rounded-md w-64 pl-9"
            />
            <svg className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            All Applications
            <span className="ml-2 bg-slate-100 text-slate-600 py-1 px-2 rounded-full text-xs">
              {applicationsWithStatus.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Pending
            <span className="ml-2 bg-slate-100 text-slate-600 py-1 px-2 rounded-full text-xs">
              {applicationsWithStatus.filter(a => a.status === 'pending').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Approved
            <span className="ml-2 bg-slate-100 text-slate-600 py-1 px-2 rounded-full text-xs">
              {applicationsWithStatus.filter(a => a.status === 'approved').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Rejected
            <span className="ml-2 bg-slate-100 text-slate-600 py-1 px-2 rounded-full text-xs">
              {applicationsWithStatus.filter(a => a.status === 'rejected').length}
            </span>
          </button>
        </nav>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-3 text-sm font-semibold text-slate-600">Driver</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Vehicle</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Period</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Weekly Rate</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Total Amount</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Submitted</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map(application => (
              <tr key={application.driverId} className="border-b hover:bg-slate-50">
                <td className="p-3 text-sm">
                  <div>
                    <div className="font-medium">{getDriverName(application.driverId)}</div>
                    <div className="text-xs text-slate-500">{getDriver(application.driverId)?.email}</div>
                  </div>
                </td>
                <td className="p-3 text-sm">{getVehicleInfo(application.vehicleId)}</td>
                <td className="p-3 text-sm">
                  {formatDateForDisplay(application.startDate)} - {formatDateForDisplay(application.endDate)}
                </td>
                <td className="p-3 text-sm">${application.weeklyRate}</td>
                <td className="p-3 text-sm">${application.totalAmount}</td>
                <td className="p-3 text-sm">{getStatusBadge(application.status)}</td>
                <td className="p-3 text-sm">{formatDateForDisplay(application.submittedDate)}</td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      title="View Details"
                    >
                      View
                    </button>
                    
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveApplication(application.driverId)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          title="Approve Application"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectApplication(application.driverId)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          title="Reject Application"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No applications found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Application Details - {getDriverName(selectedApplication.driverId)}</h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Driver Information */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Driver Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {getDriver(selectedApplication.driverId)?.name}</div>
                    <div><span className="font-medium">Email:</span> {getDriver(selectedApplication.driverId)?.email}</div>
                    <div><span className="font-medium">Phone:</span> {getDriver(selectedApplication.driverId)?.phone}</div>
                    <div><span className="font-medium">License:</span> {getDriver(selectedApplication.driverId)?.licenseNumber}</div>
                    <div><span className="font-medium">License Expiry:</span> {formatDateForDisplay(getDriver(selectedApplication.driverId)?.licenseExpiry || '')}</div>
                    <div><span className="font-medium">Age:</span> {selectedApplication.driverAge} years</div>
                    <div><span className="font-medium">International License:</span> {selectedApplication.hasInternationalLicense ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Vehicle Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Make/Model:</span> {getVehicle(selectedApplication.vehicleId)?.make} {getVehicle(selectedApplication.vehicleId)?.model}</div>
                    <div><span className="font-medium">Year:</span> {getVehicle(selectedApplication.vehicleId)?.year}</div>
                    <div><span className="font-medium">Registration:</span> {getVehicle(selectedApplication.vehicleId)?.rego}</div>
                    <div><span className="font-medium">Weekly Rate:</span> ${selectedApplication.weeklyRate}</div>
                    <div><span className="font-medium">Bond:</span> ${selectedApplication.bondAmount}</div>
                  </div>
                </div>

                {/* Rental Details */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Rental Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Start Date:</span> {formatDateForDisplay(selectedApplication.startDate)}</div>
                    <div><span className="font-medium">End Date:</span> {formatDateForDisplay(selectedApplication.endDate)}</div>
                    <div><span className="font-medium">Total Amount:</span> ${selectedApplication.totalAmount}</div>
                    <div><span className="font-medium">Insurance Amount:</span> ${selectedApplication.insuranceAmount}</div>
                  </div>
                </div>

                {/* Agreements */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Agreements</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Insurance Agreement:</span> {selectedApplication.agreesToInsurance ? '✓' : '✗'}</div>
                    <div><span className="font-medium">Smoking Policy:</span> {selectedApplication.agreesToSmokingCharges ? '✓' : '✗'}</div>
                    <div><span className="font-medium">Cleaning Policy:</span> {selectedApplication.agreesToCleaningCharges ? '✓' : '✗'}</div>
                  </div>
                </div>
              </div>

              {/* Contract Terms */}
              <div className="mt-6">
                <h4 className="font-semibold text-slate-800 mb-3">Contract Terms</h4>
                <div className="bg-slate-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap">{selectedApplication.contractTerms}</pre>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mt-6">
                <h4 className="font-semibold text-slate-800 mb-3">Admin Notes</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter notes for this application..."
                  className="w-full p-3 border rounded-md h-24 resize-none"
                />
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => handleRejectApplication(selectedApplication.driverId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApproveApplication(selectedApplication.driverId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement; 