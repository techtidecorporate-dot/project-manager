import React, { useState, useEffect } from 'react';
import {
    Zap,
    Send,
    FileText,
    AlertCircle,
    User,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    X
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const PMRequests = () => {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        type: 'Support',
        priority: 'Medium',
        category: 'Request',
        description: '',
    });

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [replyMap, setReplyMap] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingId, setSubmittingId] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [replyError, setReplyError] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchRequests();
        }
    }, [currentUser]);

    const fetchRequests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/requests', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await response.json();
            if (response.ok) setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                fetchRequests();
                setFormData({ title: '', type: 'Support', priority: 'Medium', category: 'Request', description: '' });
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async (requestId) => {
        const content = replyMap[requestId] || '';
        if (!content.trim()) return;
        setSubmittingId(requestId);
        setReplyError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/requests/${requestId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ content: content.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                setReplyMap(prev => ({ ...prev, [requestId]: '' }));
                fetchRequests();
            } else {
                setReplyError(data.message || 'Failed to send reply.');
            }
        } catch (error) {
            setReplyError('Network error. Please try again.');
        } finally {
            setSubmittingId(null);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
            case 'high': return 'text-red-500 bg-red-500/10';
            case 'medium': return 'text-orange-500 bg-orange-500/10';
            case 'low': return 'text-green-500 bg-green-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
            case 'completed': return 'text-green-600 bg-green-500/10';
            case 'pending': return 'text-orange-500 bg-orange-500/10';
            case 'open': return 'text-blue-500 bg-blue-500/10';
            case 'in progress': return 'text-[#453abc] bg-[#453abc]/10';
            case 'closed': return 'text-gray-500 bg-gray-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    const filteredRequests = requests.filter(r => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'requests') return (r.category || 'Request').toLowerCase() === 'request';
        if (selectedFilter === 'complaints') return (r.category || 'Request').toLowerCase() === 'compliance';
        if (selectedFilter === 'unread') return r.status === 'Pending';
        return r.type.toLowerCase() === selectedFilter.toLowerCase();
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Support Desk</h2>
                    <p className="text-[#191a23]/60 font-medium text-xs">Submit requests and complaints â€” all in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2 bg-white border border-[#191a23]/5 px-4 py-2 rounded-xl shadow-sm">
                        <Zap className="text-[#453abc]" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#191a23]">Transmission Active</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-[#191a23]/5">
                        <AlertCircle size={16} className="text-[#453abc] mr-2" />
                        <span className="text-xs font-black text-[#191a23] uppercase">{requests.filter(r => r.status === 'Pending').length} Pending</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                {/* Request Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-[#191a23]/5 max-h-[480px] overflow-y-auto">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-[#453abc]/10 text-[#453abc] rounded-lg flex items-center justify-center">
                                <FileText size={16} />
                            </div>
                            <h3 className="text-base font-black text-[#191a23]">New Submission</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5 ml-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter a clear, concise title..."
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#453abc]/20 rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5 ml-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#453abc]/20 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                                    >
                                        <option value="Request">Request</option>
                                        <option value="Compliance">Complaint</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5 ml-1">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#453abc]/20 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                                    >
                                        <option value="Support">Support</option>
                                        <option value="Bug">Bug Report</option>
                                        <option value="Feature">Feature Request</option>
                                        <option value="Complaint">Complaint</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#453abc]/20 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5 ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    placeholder="Provide detailed information..."
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#453abc]/20 rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 bg-gradient-to-br from-[#453abc] to-[#60c3e3]  text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#453abc] transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Sending...' : 'Transmit to Admin'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-md border border-[#191a23]/5 text-center">
                        <h4 className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-widest mb-3">Overview</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 p-3 rounded-2xl">
                                <p className="text-xl font-black text-blue-600">{requests.length}</p>
                                <p className="text-[9px] font-black uppercase text-blue-600/60">Total</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-2xl">
                                <p className="text-xl font-black text-orange-600">{requests.filter(r => r.status === 'Pending').length}</p>
                                <p className="text-[9px] font-black uppercase text-orange-600/60">Pending</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-2xl">
                                <p className="text-xl font-black text-purple-600">{requests.filter(r => (r.category || 'Request').toLowerCase() === 'compliance').length}</p>
                                <p className="text-[9px] font-black uppercase text-purple-600/60">Complaints</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-2xl">
                                <p className="text-xl font-black text-green-600">{requests.filter(r => r.status === 'Resolved').length}</p>
                                <p className="text-[9px] font-black uppercase text-green-600/60">Resolved</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-2xl shadow-md text-[#453abc]">
                        <AlertCircle className="mb-2" size={18} />
                        <p className="text-xs font-bold text-[#ffffff] leading-relaxed">
                            All transmissions are routed directly to Management. Use "Urgent" priority only for critical issues.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {['all', 'requests', 'complaints', 'unread', 'Support', 'Bug', 'Feature', 'Complaint'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${selectedFilter === filter
                            ? 'bg-gray-700 text-white shadow-lg'
                            : 'bg-white text-[#191a23]/60 hover:text-[#191a23] border border-[#191a23]/5 shadow-sm'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Error Banner */}
            {replyError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm font-bold">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{replyError}</span>
                    <button onClick={() => setReplyError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
            )}

            {/* Unified List */}
            <div className="space-y-4">
                <h3 className="text-2xl font-black text-[#191a23]">Transmission History</h3>
                {loading ? (
                    <div className="text-center py-12 text-[#191a23]/40 italic font-bold text-sm uppercase tracking-widest">Receiving Frequencies...</div>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => {
                        const isExpanded = expandedId === req._id;
                        const currentReply = replyMap[req._id] || '';
                        const isThisSubmitting = submittingId === req._id;
                        const isComplaint = (req.category || 'Request').toLowerCase() === 'compliance';

                        return (
                            <div key={req._id} className={`bg-white rounded-[32px] border border-[#191a23]/5 overflow-hidden shadow-sm transition-all ${isExpanded ? 'ring-2 ring-[#453abc]/10 shadow-xl' : 'hover:border-[#453abc]/20'}`}>
                                <div
                                    className="p-6 cursor-pointer select-none flex items-center justify-between"
                                    onClick={() => setExpandedId(prev => prev === req._id ? null : req._id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-[#191a23]/5 rounded-2xl flex items-center justify-center text-[#191a23]">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#191a23]">{req.title}</h4>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${getPriorityColor(req.priority)}`}>{req.priority}</span>
                                                <span className="text-[#191a23]/20">â€¢</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${getStatusColor(req.status)}`}>{req.status}</span>
                                                <span className="text-[#191a23]/20">â€¢</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${isComplaint ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {isComplaint ? 'Complaint' : 'Request'}
                                                </span>
                                                <span className="text-[#191a23]/20">â€¢</span>
                                                <span className="text-[10px] font-black text-[#191a23]/30">{req.messages?.length || 0} msgs</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>

                                {isExpanded && (
                                    <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-4 max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}>
                                        <div className="space-y-3">
                                            {req.messages && req.messages.length > 0 ? req.messages.map((msg, i) => {
                                                const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                                                const isMe = senderId?.toString() === currentUser._id?.toString();
                                                return (
                                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${isMe ? 'bg-[#191a23] text-white rounded-tr-none' : 'bg-white text-[#191a23] rounded-tl-none border border-[#191a23]/5'}`}>
                                                            <p className="text-sm font-medium">{msg.content}</p>
                                                            <p className={`text-[9px] font-black uppercase mt-2 ${isMe ? 'text-white/40' : 'text-[#191a23]/30'}`}>
                                                                {isMe ? 'You' : (typeof msg.sender === 'object' ? msg.sender?.name : 'Admin')} â€¢ {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }) : <p className="text-center text-sm text-[#191a23]/30 italic py-4">No messages yet.</p>}
                                        </div>

                                        {req.status !== 'Closed' && req.status !== 'Resolved' && (
                                            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                                                <input
                                                    type="text"
                                                    value={currentReply}
                                                    onChange={(e) => setReplyMap(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleReply(req._id); }}
                                                    placeholder="Type your reply..."
                                                    className="flex-1 bg-white border-2 border-gray-100 focus:border-[#453abc] rounded-xl px-3 py-2 text-sm font-bold outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => handleReply(req._id)}
                                                    disabled={isThisSubmitting || !currentReply.trim()}
                                                    className="p-2 bg-[#453abc] text-white rounded-lg hover:shadow-md transition-all disabled:opacity-40 shrink-0"
                                                >
                                                    {isThisSubmitting
                                                        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                        : <Send size={16} />
                                                    }
                                                </button>
                                            </div>
                                        )}
                                        {(req.status === 'Closed' || req.status === 'Resolved') && (
                                            <p className="text-center text-xs font-black text-[#191a23]/30 uppercase tracking-[0.2em] pt-4 border-t border-gray-100">
                                                Case {req.status} â€” awaiting admin action to reopen
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-[#191a23]/5">
                        <MessageSquare size={32} className="text-[#191a23]/20 mx-auto mb-3" />
                        <p className="text-[#191a23]/30 font-black uppercase tracking-[0.2em] text-xs">No submissions found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PMRequests;

