import React, { useState, useMemo } from 'react';
import { Driver, Vehicle } from '../types';

interface Document {
    id: string;
    name: string;
    type: 'license' | 'insurance' | 'registration' | 'contract' | 'agreement' | 'policy' | 'report' | 'other';
    category: 'driver' | 'vehicle' | 'company' | 'legal' | 'financial';
    status: 'active' | 'expired' | 'pending' | 'rejected' | 'archived';
    uploadDate: string;
    expiryDate?: string;
    fileSize: string;
    fileType: string;
    uploadedBy: string;
    relatedId?: string; // driver or vehicle ID
    description?: string;
    version: number;
    isRequired: boolean;
}

interface DocumentsProps {
    drivers: Driver[];
    vehicles: Vehicle[];
}

const Documents: React.FC<DocumentsProps> = ({ drivers, vehicles }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'driver' | 'vehicle' | 'company'>('all');
    const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'expiry' | 'type'>('date');
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [showUpload, setShowUpload] = useState(false);

    // Mock documents
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: 'DOC001',
            name: 'John Smith - Driver License',
            type: 'license',
            category: 'driver',
            status: 'active',
            uploadDate: '2024-01-01',
            expiryDate: '2025-12-31',
            fileSize: '2.3 MB',
            fileType: 'PDF',
            uploadedBy: 'John Smith',
            relatedId: 'd1',
            description: 'Current Victorian driver license',
            version: 1,
            isRequired: true
        },
        {
            id: 'DOC002',
            name: 'Vehicle Insurance - Toyota Corolla VIC001',
            type: 'insurance',
            category: 'vehicle',
            status: 'active',
            uploadDate: '2024-01-15',
            expiryDate: '2024-06-15',
            fileSize: '1.8 MB',
            fileType: 'PDF',
            uploadedBy: 'Admin',
            relatedId: 'v1',
            description: 'Comprehensive insurance policy',
            version: 2,
            isRequired: true
        },
        {
            id: 'DOC003',
            name: 'Rental Agreement Template',
            type: 'agreement',
            category: 'company',
            status: 'active',
            uploadDate: '2024-01-10',
            fileSize: '456 KB',
            fileType: 'PDF',
            uploadedBy: 'Admin',
            description: 'Standard rental agreement template',
            version: 3,
            isRequired: false
        },
        {
            id: 'DOC004',
            name: 'Sarah Connor - License (Expired)',
            type: 'license',
            category: 'driver',
            status: 'expired',
            uploadDate: '2023-06-15',
            expiryDate: '2024-01-01',
            fileSize: '2.1 MB',
            fileType: 'PDF',
            uploadedBy: 'Sarah Connor',
            relatedId: 'd2',
            description: 'Expired driver license - renewal required',
            version: 1,
            isRequired: true
        },
        {
            id: 'DOC005',
            name: 'Fleet Maintenance Report - December 2023',
            type: 'report',
            category: 'company',
            status: 'active',
            uploadDate: '2024-01-05',
            fileSize: '3.2 MB',
            fileType: 'PDF',
            uploadedBy: 'Admin',
            description: 'Monthly fleet maintenance and service report',
            version: 1,
            isRequired: false
        }
    ]);

    const filteredDocuments = useMemo(() => {
        let filtered = documents;

        // Filter by category
        if (activeTab !== 'all') {
            filtered = filtered.filter(doc => doc.category === activeTab);
        }

        // Filter by status
        if (filter !== 'all') {
            filtered = filtered.filter(doc => doc.status === filter);
        }

        // Sort documents
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
                case 'expiry':
                    if (!a.expiryDate && !b.expiryDate) return 0;
                    if (!a.expiryDate) return 1;
                    if (!b.expiryDate) return -1;
                    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
                case 'type':
                    return a.type.localeCompare(b.type);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [documents, activeTab, filter, sortBy]);

    const documentStats = useMemo(() => {
        return {
            total: documents.length,
            active: documents.filter(d => d.status === 'active').length,
            expired: documents.filter(d => d.status === 'expired').length,
            pending: documents.filter(d => d.status === 'pending').length,
            expiringSoon: documents.filter(d => {
                if (!d.expiryDate) return false;
                const daysUntilExpiry = Math.ceil((new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            }).length
        };
    }, [documents]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'expired': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-rose-100 text-rose-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'license':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>;
            case 'insurance':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
            case 'contract':
            case 'agreement':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            case 'report':
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            default:
                return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        }
    };

    const handleSelectDoc = (docId: string) => {
        setSelectedDocs(prev => 
            prev.includes(docId) 
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    const handleSelectAll = () => {
        if (selectedDocs.length === filteredDocuments.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(filteredDocuments.map(doc => doc.id));
        }
    };

    const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; count?: number }> = ({ label, isActive, onClick, count }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
            {label}
            {count !== undefined && (
                <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Document Management</h2>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-800">{documentStats.total}</p>
                        <p className="text-sm text-slate-600">Total</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{documentStats.active}</p>
                        <p className="text-sm text-slate-600">Active</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{documentStats.expired}</p>
                        <p className="text-sm text-slate-600">Expired</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{documentStats.pending}</p>
                        <p className="text-sm text-slate-600">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{documentStats.expiringSoon}</p>
                        <p className="text-sm text-slate-600">Expiring Soon</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <TabButton
                        label="All Documents"
                        isActive={activeTab === 'all'}
                        onClick={() => setActiveTab('all')}
                        count={documents.length}
                    />
                    <TabButton
                        label="Driver Documents"
                        isActive={activeTab === 'driver'}
                        onClick={() => setActiveTab('driver')}
                        count={documents.filter(d => d.category === 'driver').length}
                    />
                    <TabButton
                        label="Vehicle Documents"
                        isActive={activeTab === 'vehicle'}
                        onClick={() => setActiveTab('vehicle')}
                        count={documents.filter(d => d.category === 'vehicle').length}
                    />
                    <TabButton
                        label="Company Documents"
                        isActive={activeTab === 'company'}
                        onClick={() => setActiveTab('company')}
                        count={documents.filter(d => d.category === 'company').length}
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700">Status:</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                            >
                                <option value="date">Upload Date</option>
                                <option value="name">Name</option>
                                <option value="expiry">Expiry Date</option>
                                <option value="type">Document Type</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedDocs.length > 0 && (
                            <>
                                <button className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors">
                                    Delete ({selectedDocs.length})
                                </button>
                                <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors">
                                    Archive ({selectedDocs.length})
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setShowUpload(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Upload Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                </th>
                                <th className="p-4 text-left text-sm font-medium text-slate-700">Document</th>
                                <th className="p-4 text-left text-sm font-medium text-slate-700">Type</th>
                                <th className="p-4 text-left text-sm font-medium text-slate-700">Status</th>
                                <th className="p-4 text-left text-sm font-medium text-slate-700">Upload Date</th>
                                <th className="p-4 text-left text-sm font-medium text-slate-700">Expiry Date</th>
                                <th className="p-4 text-left text-sm font-medium text-slate-700">Size</th>
                                <th className="p-4 text-left text-sm font-medium text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredDocuments.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedDocs.includes(doc.id)}
                                            onChange={() => handleSelectDoc(doc.id)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-slate-600">
                                                {getTypeIcon(doc.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{doc.name}</p>
                                                <p className="text-sm text-slate-500">{doc.description}</p>
                                                {doc.isRequired && (
                                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Required</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-slate-600 capitalize">{doc.type}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                            {doc.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{doc.uploadDate}</td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {doc.expiryDate ? (
                                            <span className={
                                                new Date(doc.expiryDate) < new Date() ? 'text-red-600 font-medium' :
                                                Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 30 ? 'text-orange-600 font-medium' :
                                                'text-slate-600'
                                            }>
                                                {doc.expiryDate}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{doc.fileSize}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                                            <button className="text-green-600 hover:text-green-800 text-sm">Download</button>
                                            <button className="text-slate-600 hover:text-slate-800 text-sm">Edit</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredDocuments.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="text-slate-400 mb-2">
                            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-600">No documents found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Documents; 