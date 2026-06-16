import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Plus,
    AlertCircle,
    CheckCircle,
    X,
    Send,
    ChevronDown,
    ChevronUp,
    Clock,
    User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ClientTickets = () => {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyMap, setReplyMap] = useState({});
    const [submittingId, setSubmittingId] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        type: 'Support',
        priority: 'Medium',
        category: 'Request'
    });

    useEffect(() => {
        if (currentUser) {
            fetchTickets();
        }
    }, [currentUser]);

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/requests', {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setRequests(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(newTicket),
            });

            if (response.ok) {
                fetchTickets();
                setIsModalOpen(false);
                setNewTicket({ title: '', description: '', type: 'Support', priority: 'Medium', category: 'Request' });
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    };

    const handleReply = async (requestId) => {
        const content = replyMap[requestId] || '';
        if (!content.trim()) return;
        setSubmittingId(requestId);
        try {
            const response = await fetch(`http://localhost:5000/api/requests/${requestId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ content: content.trim() }),
            });
            if (response.ok) {
                setReplyMap(prev => ({ ...prev, [requestId]: '' }));
                fetchTickets();
            }
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setSubmittingId(null);
        }
    };

    const filteredTickets = requests.filter(r => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'requests') return (r.category || 'Request').toLowerCase() === 'request';
        if (selectedFilter === 'complaints') return (r.category || 'Request').toLowerCase() === 'compliance';
        if (selectedFilter === 'unread') return r.status === 'Pending';
        return r.type.toLowerCase() === selectedFilter.toLowerCase();
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-600';
            case 'Pending': return 'bg-yellow-100 text-yellow-600';
            case 'Open': return 'bg-blue-100 text-blue-600';
            case 'Closed': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fa2742]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#373833] tracking-tight">Support Desk</h1>
                    <p className="text-gray-500 font-bold text-sm">All your requests and complaints — in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-[#373833]/5">
                        <AlertCircle size={16} className="text-[#fa2742] mr-2" />
                        <span className="text-xs font-black text-[#373833] uppercase">{requests.filter(r => r.status === 'Pending').length} Pending</span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-[#fa2742] text-white rounded-2xl shadow-xl hover:shadow-2xl font-black transition-all text-sm flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Raise Ticket</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {['all', 'requests', 'complaints', 'unread', 'Support', 'Bug', 'Feature', 'Complaint'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${selectedFilter === filter
                            ? 'bg-[#373833] text-white shadow-lg'
                            : 'bg-white text-[#373833]/60 hover:text-[#373833] border border-[#373833]/5 shadow-sm'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="grid gap-6">
                {filteredTickets.map((ticket) => {
                    const isExpanded = expandedId === ticket._id;
                    const currentReply = replyMap[ticket._id] || '';
                    const isThisSubmitting = submittingId === ticket._id;
                    const isComplaint = (ticket.category || 'Request').toLowerCase() === 'compliance';

                    return (
                        <div
                            key={ticket._id}
                            className={`bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-[#fa2742]/10 shadow-xl' : 'hover:shadow-md'}`}
                        >
                            <div
                                className="p-8 cursor-pointer select-none group"
                                onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${getStatusStyles(ticket.status)}`}>
                                            {ticket.status === 'Resolved' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-[#373833] text-xl leading-tight group-hover:text-[#fa2742] transition-colors">{ticket.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-sm text-gray-400 font-bold">#{ticket._id.substring(ticket._id.length - 6).toUpperCase()}</span>
                                                <span className="text-gray-200">•</span>
                                                <span className="text-sm text-gray-400 font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                <span className="text-gray-200">•</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${isComplaint ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {isComplaint ? 'Complaint' : 'Request'}
                                                </span>
                                                <span className="text-gray-200">•</span>
                                                <span className="text-[10px] font-black text-gray-400">{ticket.messages?.length || 0} msgs</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusStyles(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                        {isExpanded ? <ChevronUp size={24} className="text-gray-300" /> : <ChevronDown size={24} className="text-gray-300" />}
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-5 border-t border-gray-50 bg-gray-50/30 space-y-4 max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}>
                                    <div className="space-y-4">
                                        {ticket.messages && ticket.messages.length > 0 ? ticket.messages.map((msg, idx) => {
                                            const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                                            const isMe = senderId?.toString() === currentUser._id?.toString();
                                            return (
                                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] p-6 rounded-[24px] ${isMe
                                                        ? 'bg-[#373833] text-white rounded-tr-none'
                                                        : 'bg-white border border-gray-100 text-[#373833] rounded-tl-none shadow-sm'
                                                        }`}>
                                                        <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                                                        <div className={`flex items-center mt-3 gap-2 text-[10px] font-black uppercase ${isMe ? 'text-white/40' : 'text-gray-300'}`}>
                                                            <Clock size={10} />
                                                            <span>{isMe ? 'You' : (typeof msg.sender === 'object' ? msg.sender?.name : 'Admin')} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }) : <p className="text-center text-sm text-gray-300 italic py-4">No messages yet.</p>}
                                    </div>

                                    {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="text"
                                                value={currentReply}
                                                onChange={(e) => setReplyMap(prev => ({ ...prev, [ticket._id]: e.target.value }))}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleReply(ticket._id); }}
                                                placeholder="Reply to our team..."
                                                className="flex-1 bg-white border-2 border-transparent focus:border-[#fa2742] rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all shadow-sm"
                                            />
                                            <button
                                                onClick={() => handleReply(ticket._id)}
                                                disabled={isThisSubmitting || !currentReply.trim()}
                                                className="bg-[#fa2742] text-white p-2.5 rounded-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 shrink-0"
                                            >
                                                {isThisSubmitting
                                                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                    : <Send size={18} />}
                                            </button>
                                        </div>
                                    )}
                                    {(ticket.status === 'Closed' || ticket.status === 'Resolved') && (
                                        <p className="text-center text-xs font-black text-gray-300 uppercase tracking-[0.15em] pt-2">Case {ticket.status} — contact support to reopen</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredTickets.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                        <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
                        <h3 className="text-xl font-black text-[#373833]">Silent Inbox</h3>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">No tickets match the selected filter.</p>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#373833]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-[#373833] tracking-tight">Initiate Ticket</h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket} className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={newTicket.title}
                                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                    placeholder="Brief summary of your inquiry"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                    <select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl px-2 py-2.5 text-xs font-bold outline-none transition-all appearance-none"
                                    >
                                        <option value="Request">Request</option>
                                        <option value="Compliance">Complaint</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Type</label>
                                    <select
                                        value={newTicket.type}
                                        onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl px-2 py-2.5 text-xs font-bold outline-none transition-all appearance-none"
                                    >
                                        <option value="Support">Support</option>
                                        <option value="Bug">Technical Bug</option>
                                        <option value="Feature">Feature Request</option>
                                        <option value="Complaint">Complaint</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Priority</label>
                                    <select
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl px-2 py-2.5 text-xs font-bold outline-none transition-all appearance-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Detail</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    placeholder="Provide full context here..."
                                    className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all resize-none"
                                />
                            </div>

                            <button type="submit" className="w-full py-2.5 bg-[#fa2742] text-white font-black rounded-xl hover:shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest">
                                Submit Inquiry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientTickets;
