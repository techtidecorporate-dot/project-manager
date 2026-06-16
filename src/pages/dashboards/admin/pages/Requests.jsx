import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Filter,
    X,
    CheckCircle,
    Circle,
    ChevronDown,
    ChevronUp,
    Clock,
    User,
    Send,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Requests = () => {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [replyMap, setReplyMap] = useState({}); // per-request reply content
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [submittingId, setSubmittingId] = useState(null); // which request is being submitted
    const [replyError, setReplyError] = useState(null);

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

    const handleToggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
        setReplyError(null);
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
                // Clear only this request's reply box
                setReplyMap(prev => ({ ...prev, [requestId]: '' }));
                await fetchRequests();
            } else {
                setReplyError(data.message || 'Failed to send reply. Please try again.');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            setReplyError('Network error. Please check your connection and try again.');
        } finally {
            setSubmittingId(null);
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchRequests();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'unread') return req.status === 'Pending';
        if (selectedFilter === 'requests') return (req.category || 'Request').toLowerCase() === 'request';
        if (selectedFilter === 'complaints') return (req.category || 'Request').toLowerCase() === 'compliance';
        return req.type.toLowerCase() === selectedFilter.toLowerCase();
    });

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-400 text-[#373833]',
            'Open': 'bg-blue-500 text-white',
            'In Progress': 'bg-[#fa2742] text-white',
            'Resolved': 'bg-green-500 text-white',
            'Closed': 'bg-gray-500 text-white'
        };
        return colors[status] || 'bg-gray-400 text-white';
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return 'bg-red-500 text-white shadow-red-500/20';
            case 'high': return 'bg-orange-500 text-white shadow-orange-500/20';
            case 'medium': return 'bg-blue-500 text-white shadow-blue-500/20';
            case 'low': return 'bg-green-500 text-white shadow-green-500/20';
            default: return 'bg-gray-400 text-white';
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
        <div className="space-y-8 pb-10 selection:bg-white selection:text-[#373833]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#373833] tracking-tight">Support Desk</h2>
                    <p className="text-[#373833]/60 font-medium text-xs">All requests and complaints in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#373833]/5">
                        <AlertCircle size={18} className="text-[#fa2742] mr-2" />
                        <span className="text-xs font-black text-[#373833] uppercase">
                            {requests.filter(r => r.status === 'Pending').length} Pending
                        </span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#373833]/5">
                        <MessageSquare size={16} className="text-blue-500 mr-2" />
                        <span className="text-xs font-black text-[#373833] uppercase">{requests.length} Total</span>
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
                            ? 'bg-[#373833] text-white shadow-lg'
                            : 'bg-white text-[#373833]/60 hover:text-[#373833] border border-[#373833]/5 shadow-sm'
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
                    <button onClick={() => setReplyError(null)} className="ml-auto text-red-400 hover:text-red-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Requests List */}
            <div className="space-y-6">
                {filteredRequests.map((req) => {
                    const isExpanded = expandedId === req._id;
                    const currentReply = replyMap[req._id] || '';
                    const isThisSubmitting = submittingId === req._id;
                    const isClosed = req.status === 'Closed' || req.status === 'Resolved';

                    return (
                        <div
                            key={req._id}
                            className={`bg-white rounded-[28px] shadow-sm border border-[#373833]/5 overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-[#fa2742]/10 shadow-xl' : 'hover:border-[#fa2742]/20'}`}
                        >
                            {/* Card Header – click to expand */}
                            <div
                                className="p-6 cursor-pointer select-none"
                                onClick={() => handleToggleExpand(req._id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-2xl ${getStatusColor(req.status)}`}>
                                            <MessageSquare size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-[#373833] tracking-tight">{req.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <div className="flex items-center space-x-1.5">
                                                    <User size={14} className="text-[#373833]/40" />
                                                    <span className="text-xs font-bold text-[#373833]/60">{req.user?.name}</span>
                                                    <span className="text-[#373833]/30 text-xs">({req.user?.role})</span>
                                                </div>
                                                <span className="text-[#373833]/20">•</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${getPriorityColor(req.priority)}`}>
                                                    {req.priority}
                                                </span>
                                                <span className="text-[#373833]/20">•</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${getStatusColor(req.status)}`}>
                                                    {req.status}
                                                </span>
                                                <span className="text-[#373833]/20">•</span>
                                                <span className="text-[10px] font-black uppercase text-[#373833]/40 tracking-wider">{req.type}</span>
                                                <span className="text-[#373833]/20">•</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${(req.category || 'Request').toLowerCase() === 'compliance'
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : 'bg-blue-100 text-blue-600'
                                                    }`}>{(req.category || 'Request').toLowerCase() === 'compliance' ? 'Complaint' : 'Request'}</span>
                                                <span className="text-[#373833]/20">•</span>
                                                <span className="text-[10px] font-black text-[#373833]/30">{req.messages?.length || 0} msgs</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black text-[#373833]/30 uppercase tracking-widest leading-none mb-1">Received</p>
                                            <p className="text-xs font-bold text-[#373833]/60">{new Date(req.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-xl">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Thread */}
                            {isExpanded && (
                                <div
                                    className="border-t border-gray-100 bg-gray-50/40 p-5 space-y-5 max-h-80 overflow-y-auto"
                                    onClick={(e) => e.stopPropagation()} // prevent card header click from firing inside
                                >
                                    {/* Message History */}
                                    <div className="space-y-4">
                                        {req.messages && req.messages.length > 0 ? (
                                            req.messages.map((msg, idx) => {
                                                const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                                                const isMe = senderId?.toString() === currentUser._id?.toString();
                                                const senderName = typeof msg.sender === 'object' ? msg.sender?.name : null;
                                                const senderRole = typeof msg.sender === 'object' ? msg.sender?.role : null;
                                                return (
                                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-5 ${isMe
                                                            ? 'bg-[#fa2742] text-white rounded-t-3xl rounded-bl-3xl'
                                                            : 'bg-white text-[#373833] rounded-t-3xl rounded-br-3xl shadow-sm border border-[#373833]/5'
                                                            }`}>
                                                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                            <div className={`mt-2 flex items-center gap-2 text-[10px] font-black uppercase ${isMe ? 'text-white/60' : 'text-[#373833]/40'}`}>
                                                                <span>{isMe ? 'You (Admin)' : `${senderName || req.user?.name}${senderRole ? ` · ${senderRole}` : ''}`}</span>
                                                                <span>•</span>
                                                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-center text-sm text-[#373833]/30 italic py-4">No messages yet.</p>
                                        )}
                                    </div>

                                    {/* Reply Section */}
                                    {!isClosed ? (
                                        <div className="space-y-4 pt-4 border-t border-[#373833]/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#fa2742] rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-[#373833] uppercase tracking-widest">
                                                    Replying to {req.user?.name}
                                                </span>
                                            </div>

                                            <div className="flex gap-3 items-end">
                                                <textarea
                                                    value={currentReply}
                                                    onChange={(e) => setReplyMap(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                            handleReply(req._id);
                                                        }
                                                    }}
                                                    placeholder="Type your reply here... (Ctrl+Enter to send)"
                                                    rows={3}
                                                    className="flex-1 bg-white border-2 border-gray-100 focus:border-[#fa2742] rounded-2xl p-4 text-sm font-bold text-[#373833] outline-none shadow-sm transition-all resize-none"
                                                />
                                                <button
                                                    onClick={() => handleReply(req._id)}
                                                    disabled={isThisSubmitting || !currentReply.trim()}
                                                    className="bg-[#fa2742] text-white p-4 rounded-2xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0"
                                                    title="Send reply"
                                                >
                                                    {isThisSubmitting
                                                        ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                        : <Send size={20} />
                                                    }
                                                </button>
                                            </div>

                                            {/* Status Action Buttons */}
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex gap-2 flex-wrap">
                                                    {req.status !== 'In Progress' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(req._id, 'In Progress')}
                                                            className="px-4 py-2 bg-[#fa2742]/10 text-[#fa2742] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#fa2742]/20 transition-all"
                                                        >
                                                            Start Handling
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUpdateStatus(req._id, 'Resolved')}
                                                        className="px-4 py-2 bg-green-500/10 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req._id, 'Closed')}
                                                        className="px-4 py-2 bg-gray-500/10 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-500/20 transition-all"
                                                    >
                                                        Close Case
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-[#373833]/30 font-black uppercase italic">Reply as Administrator</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/60 border border-dashed border-gray-200 rounded-2xl p-5 text-center">
                                            <p className="text-xs font-black text-[#373833]/40 uppercase tracking-[0.2em]">
                                                Case {req.status} — channel closed
                                            </p>
                                            <button
                                                onClick={() => handleUpdateStatus(req._id, 'Open')}
                                                className="mt-3 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                                            >
                                                Reopen Case
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredRequests.length === 0 && (
                    <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="text-[#373833]/20" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-[#373833]">Support Desk Clear</h3>
                        <p className="text-sm text-[#373833]/40 font-bold mt-2">No submissions found matching the selected filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Requests;
