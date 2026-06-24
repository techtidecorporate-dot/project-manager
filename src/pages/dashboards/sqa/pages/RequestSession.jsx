import React, { useState, useEffect } from 'react';
import {
    Zap,
    Send,
    FileText,
    AlertCircle,
    User,
    MessageSquare,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const RequestSession = () => {
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
    const [submittingId, setSubmittingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        if (currentUser) {
            fetchRequests();
        }
    }, [currentUser]);

    const fetchRequests = async () => {
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
            console.error('Error fetching requests:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                setFormData({
                    title: '',
                    type: 'Support',
                    priority: 'Medium',
                    category: 'Request',
                    description: '',
                });
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
                fetchRequests();
            }
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setSubmittingId(null);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
            case 'high':
                return 'text-red-500 bg-red-500/10';
            case 'medium':
                return 'text-orange-500 bg-orange-500/10';
            case 'low':
                return 'text-green-500 bg-green-500/10';
            default:
                return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
            case 'completed':
                return 'text-green-500 bg-green-500/10';
            case 'pending':
                return 'text-orange-500 bg-orange-500/10';
            case 'open':
                return 'text-blue-500 bg-blue-500/10';
            case 'closed':
                return 'text-red-500 bg-red-500/10';
            default:
                return 'text-gray-500 bg-gray-500/10';
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
        <div className="space-y-8 pb-10 selection:bg-[#f0e4d4] selection:text-[#191a23]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Support Desk</h2>
                    <p className="text-[#191a23]/60 font-medium text-xs">Submit requests and complaints â€” all in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2 bg-white border border-[#191a23]/5 px-4 py-2 rounded-xl shadow-sm">
                        <Zap className="text-[#453abc]" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#191a23]">Portal Active</span>
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
                            <h3 className="text-base font-black text-[#191a23]">New Request</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5">
                                    Request Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter a clear, concise title..."
                                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#453abc]/10 focus:bg-white focus:border-[#453abc]/20 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#453abc]/10 focus:bg-white focus:border-[#453abc]/20 transition-all"
                                    >
                                        <option value="Request">Request</option>
                                        <option value="Compliance">Compliance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#453abc]/10 focus:bg-white focus:border-[#453abc]/20 transition-all"
                                    >
                                        <option value="Support">Support</option>
                                        <option value="Bug">Bug Report</option>
                                        <option value="Feature">Feature Request</option>
                                        <option value="Complaint">Complaint</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#453abc]/10 focus:bg-white focus:border-[#453abc]/20 transition-all"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[#191a23] uppercase tracking-widest mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    placeholder="Provide detailed information about your request..."
                                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#453abc]/10 focus:bg-white focus:border-[#453abc]/20 transition-all resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 bg-gradient-to-br from-[#453abc] to-[#60c3e3]   text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[rgb(69,58,188)] hover:text-[#191a23] transition-all shadow-md flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
                            >
                                <Send size={16} />
                                <span>{isSubmitting ? 'Transmitting...' : 'Submit Request'}</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Request Stats */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-md border border-[#191a23]/5">
                        <h4 className="text-sm font-bold text-[#191a23] mb-3">Live Feed</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-xl">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total</span>
                                <span className="text-xl font-black text-blue-500">{requests.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-xl">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Pending</span>
                                <span className="text-xl font-black text-orange-500">
                                    {requests.filter(r => r.status === 'Pending').length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-xl">
                                <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Complaints</span>
                                <span className="text-xl font-black text-purple-500">
                                    {requests.filter(r => (r.category || 'Request').toLowerCase() === 'compliance').length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-xl">
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Resolved</span>
                                <span className="text-xl font-black text-green-500">
                                    {requests.filter(r => r.status === 'Resolved' || r.status === 'Closed').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-2xl shadow-md text-white">
                        <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="text-[#453abc]" size={16} />
                            <h4 className="text-xs font-black uppercase tracking-widest">Operator Note</h4>
                        </div>
                        <p className="text-xs text-white/60 font-medium leading-relaxed">
                            All requests and complaints are routed directly to Management (Admin). Use the appropriate category to ensure fast resolution.
                        </p>
                    </div>
                </div>
            </div>

            {/* Thread History */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h3 className="text-2xl font-black text-[#191a23]">Active Threads</h3>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'requests', 'complaints', 'unread', 'Support', 'Bug', 'Feature', 'Complaint'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${selectedFilter === filter
                                    ? 'bg-gray-700 text-white shadow-lg'
                                    : 'bg-white text-[#191a23]/60 hover:text-[#191a23] border border-[#191a23]/5 shadow-sm'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-[#191a23]/40 font-medium italic">Loading requests...</div>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => {
                        const isExpanded = expandedId === request._id;
                        const currentReply = replyMap[request._id] || '';
                        const isThisSubmitting = submittingId === request._id;
                        const isComplaint = (request.category || 'Request').toLowerCase() === 'compliance';

                        return (
                            <div
                                key={request._id}
                                className={`bg-white rounded-[32px] shadow-sm border border-[#191a23]/5 overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-[#453abc]/10 shadow-xl' : ''}`}
                            >
                                <div
                                    className="p-6 cursor-pointer select-none hover:bg-gray-50/50 transition-colors"
                                    onClick={() => setExpandedId(prev => prev === request._id ? null : request._id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isComplaint ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                                <MessageSquare size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-[#191a23]">{request.title}</h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${getPriorityColor(request.priority)}`}>
                                                        {request.priority}
                                                    </span>
                                                    <span className="text-[#191a23]/20">â€¢</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${isComplaint ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {isComplaint ? 'Complaint' : 'Request'}
                                                    </span>
                                                    <span className="text-[#191a23]/20">â€¢</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${request.type === 'Complaint' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        {request.type}
                                                    </span>
                                                    <span className="text-[#191a23]/20">â€¢</span>
                                                    <span className="text-xs font-bold text-[#191a23]/40">{new Date(request.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 shrink-0">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                            <span className="text-xs text-[#191a23]/40">{request.messages?.length || 0} msgs</span>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-4 border-t border-gray-50 bg-gray-50/30 space-y-4 max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}>
                                        <div className="space-y-3">
                                            {request.messages && request.messages.length > 0 ? (
                                                request.messages.map((msg, idx) => {
                                                    const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                                                    const isMe = senderId?.toString() === currentUser._id?.toString();
                                                    return (
                                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[85%] p-4 rounded-2xl ${isMe
                                                                ? 'bg-[#191a23] text-white rounded-tr-none'
                                                                : 'bg-white border border-[#191a23]/5 text-[#191a23] rounded-tl-none shadow-sm'
                                                                }`}>
                                                                <p className="text-sm font-medium">{msg.content}</p>
                                                                <p className={`text-[10px] font-black uppercase mt-2 ${isMe ? 'text-white/40' : 'text-[#191a23]/40'}`}>
                                                                    {isMe ? 'You' : (typeof msg.sender === 'object' ? msg.sender?.name : 'Admin')} â€¢ {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-4 text-[#191a23]/40 font-medium italic">No messages yet.</div>
                                            )}
                                        </div>

                                        {request.status !== 'Closed' && request.status !== 'Resolved' && (
                                            <div className="flex items-center gap-2 pt-3">
                                                <input
                                                    type="text"
                                                    value={currentReply}
                                                    onChange={(e) => setReplyMap(prev => ({ ...prev, [request._id]: e.target.value }))}
                                                    placeholder="Type your message..."
                                                    className="flex-1 bg-white border border-[#191a23]/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#453abc] transition-colors shadow-sm"
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleReply(request._id); }}
                                                />
                                                <button
                                                    onClick={() => handleReply(request._id)}
                                                    disabled={isThisSubmitting || !currentReply.trim()}
                                                    className="bg-[#453abc] text-white p-3 rounded-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-40"
                                                >
                                                    {isThisSubmitting
                                                        ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                        : <Send size={20} />}
                                                </button>
                                            </div>
                                        )}
                                        {(request.status === 'Closed' || request.status === 'Resolved') && (
                                            <p className="text-center text-xs font-black text-[#191a23]/30 uppercase tracking-[0.15em] pt-2">Case {request.status} â€” awaiting admin action to reopen</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                        <MessageSquare size={32} className="text-[#191a23]/20 mx-auto mb-3" />
                        <p className="text-[#191a23]/30 font-black uppercase tracking-[0.2em] text-xs">No active sessions found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestSession;

