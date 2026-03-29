import React, { useState, useMemo } from 'react';
import { Driver, Vehicle } from '../types';

interface SupportTicket {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
    category: 'vehicle' | 'payment' | 'technical' | 'general' | 'complaint';
    submittedBy: string;
    submittedAt: string;
    assignedTo?: string;
    lastUpdated: string;
    driverId?: string;
    vehicleId?: string;
    comments: Array<{
        id: string;
        message: string;
        author: string;
        timestamp: string;
        isInternal: boolean;
    }>;
}

interface ContactLog {
    id: string;
    type: 'call' | 'email' | 'sms' | 'in-person';
    contact: string;
    subject: string;
    notes: string;
    timestamp: string;
    duration?: string;
    outcome: 'resolved' | 'follow-up-required' | 'escalated' | 'information-provided';
    driverId?: string;
}

interface SupportProps {
    drivers: Driver[];
    vehicles: Vehicle[];
}

const Support: React.FC<SupportProps> = ({ drivers, vehicles }) => {
    const [activeTab, setActiveTab] = useState<'tickets' | 'contact-log' | 'quick-actions'>('tickets');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'pending'>('all');

    // Mock support tickets
    const [tickets, setTickets] = useState<SupportTicket[]>([
        {
            id: 'T001',
            title: 'Vehicle air conditioning not working',
            description: 'Driver reports that the air conditioning in Toyota Corolla (VIC001) is not working properly.',
            priority: 'medium',
            status: 'open',
            category: 'vehicle',
            submittedBy: 'John Smith',
            submittedAt: '2024-01-15',
            lastUpdated: '2024-01-15',
            driverId: 'd1',
            vehicleId: 'v1',
            comments: [
                {
                    id: 'c1',
                    message: 'AC stopped working after last service. Need to check refrigerant levels.',
                    author: 'John Smith',
                    timestamp: '2024-01-15 09:30',
                    isInternal: false
                }
            ]
        },
        {
            id: 'T002',
            title: 'Payment processing issue',
            description: 'Unable to process weekly payment through the system.',
            priority: 'high',
            status: 'in-progress',
            category: 'payment',
            submittedBy: 'Sarah Connor',
            submittedAt: '2024-01-14',
            assignedTo: 'Admin Team',
            lastUpdated: '2024-01-15',
            driverId: 'd2',
            comments: [
                {
                    id: 'c2',
                    message: 'Payment gateway returned error code 402. Investigating with payment processor.',
                    author: 'Support Team',
                    timestamp: '2024-01-14 14:20',
                    isInternal: true
                }
            ]
        },
        {
            id: 'T003',
            title: 'App login issues',
            description: 'Driver portal keeps logging out automatically after a few minutes.',
            priority: 'medium',
            status: 'pending',
            category: 'technical',
            submittedBy: 'Michael Johnson',
            submittedAt: '2024-01-13',
            lastUpdated: '2024-01-14',
            driverId: 'd3',
            comments: []
        }
    ]);

    // Mock contact log
    const [contactLog, setContactLog] = useState<ContactLog[]>([
        {
            id: 'C001',
            type: 'call',
            contact: 'John Smith - 0412345678',
            subject: 'Vehicle maintenance inquiry',
            notes: 'Discussed upcoming service schedule and potential issues with brakes.',
            timestamp: '2024-01-15 10:30',
            duration: '15 minutes',
            outcome: 'information-provided',
            driverId: 'd1'
        },
        {
            id: 'C002',
            type: 'email',
            contact: 'sarah@example.com',
            subject: 'Payment extension request',
            notes: 'Requested 3-day extension for this week\'s payment due to medical emergency.',
            timestamp: '2024-01-14 16:45',
            outcome: 'follow-up-required',
            driverId: 'd2'
        }
    ]);

    const filteredTickets = useMemo(() => {
        if (filter === 'all') return tickets;
        return tickets.filter(ticket => ticket.status === filter);
    }, [tickets, filter]);

    const ticketStats = useMemo(() => {
        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open').length,
            inProgress: tickets.filter(t => t.status === 'in-progress').length,
            pending: tickets.filter(t => t.status === 'pending').length,
            urgent: tickets.filter(t => t.priority === 'urgent').length
        };
    }, [tickets]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-white';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in-progress': return 'bg-purple-100 text-purple-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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
            {count !== undefined && count > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {count}
                </span>
            )}
        </button>
    );

    const QuickActionCard: React.FC<{
        title: string;
        description: string;
        icon: React.ReactNode;
        onClick: () => void;
        color: string;
    }> = ({ title, description, icon, onClick, color }) => (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-all hover:scale-[1.02] text-left w-full"
        >
            <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
            </div>
            <p className="text-sm text-slate-600">{description}</p>
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Support & Helpdesk</h2>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-800">{ticketStats.total}</p>
                        <p className="text-sm text-slate-600">Total Tickets</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{ticketStats.open}</p>
                        <p className="text-sm text-slate-600">Open</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{ticketStats.inProgress}</p>
                        <p className="text-sm text-slate-600">In Progress</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{ticketStats.pending}</p>
                        <p className="text-sm text-slate-600">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{ticketStats.urgent}</p>
                        <p className="text-sm text-slate-600">Urgent</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <TabButton
                        label="Support Tickets"
                        isActive={activeTab === 'tickets'}
                        onClick={() => setActiveTab('tickets')}
                        count={ticketStats.open + ticketStats.inProgress}
                    />
                    <TabButton
                        label="Contact Log"
                        isActive={activeTab === 'contact-log'}
                        onClick={() => setActiveTab('contact-log')}
                    />
                    <TabButton
                        label="Quick Actions"
                        isActive={activeTab === 'quick-actions'}
                        onClick={() => setActiveTab('quick-actions')}
                    />
                </div>
            </div>

            {/* Content */}
            {activeTab === 'tickets' && (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-700">Filter:</label>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value as any)}
                                        className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                                    >
                                        <option value="all">All Tickets</option>
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNewTicket(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                New Ticket
                            </button>
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-1">#{ticket.id} - {ticket.title}</h3>
                                        <p className="text-sm text-slate-600">{ticket.submittedBy}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority.toUpperCase()}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('-', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{ticket.description}</p>
                                
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Category: {ticket.category}</span>
                                    <span>Updated: {ticket.lastUpdated}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTickets.length === 0 && (
                        <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200 text-center">
                            <div className="text-slate-400 mb-2">
                                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-slate-600">No tickets found</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'contact-log' && (
                <div className="space-y-4">
                    {contactLog.map((contact) => (
                        <div key={contact.id} className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{contact.subject}</h3>
                                    <p className="text-sm text-slate-600">{contact.contact}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        contact.type === 'call' ? 'bg-green-100 text-green-800' :
                                        contact.type === 'email' ? 'bg-blue-100 text-blue-800' :
                                        contact.type === 'sms' ? 'bg-purple-100 text-purple-800' :
                                        'bg-orange-100 text-orange-800'
                                    }`}>
                                        {contact.type.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-slate-500">{contact.duration}</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-3">{contact.notes}</p>
                            
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Outcome: {contact.outcome.replace('-', ' ')}</span>
                                <span>{contact.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'quick-actions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <QuickActionCard
                        title="Call Driver"
                        description="Initiate a call to a driver and log the interaction"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                        color="bg-green-100 text-green-600"
                        onClick={() => {}}
                    />
                    
                    <QuickActionCard
                        title="Send Email"
                        description="Send an email to a driver or bulk email to multiple drivers"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        color="bg-blue-100 text-blue-600"
                        onClick={() => {}}
                    />
                    
                    <QuickActionCard
                        title="Schedule Callback"
                        description="Schedule a callback reminder for follow-up communication"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="bg-purple-100 text-purple-600"
                        onClick={() => {}}
                    />
                    
                    <QuickActionCard
                        title="Escalate Issue"
                        description="Escalate a support issue to senior management"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        color="bg-red-100 text-red-600"
                        onClick={() => {}}
                    />
                    
                    <QuickActionCard
                        title="Send SMS"
                        description="Send SMS notification to driver for urgent matters"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        color="bg-indigo-100 text-indigo-600"
                        onClick={() => {}}
                    />
                    
                    <QuickActionCard
                        title="Create Knowledge Base"
                        description="Add new articles to the knowledge base"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                        color="bg-yellow-100 text-yellow-600"
                        onClick={() => {}}
                    />
                </div>
            )}
        </div>
    );
};

export default Support; 