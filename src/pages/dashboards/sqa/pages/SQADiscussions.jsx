import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Layout,
    User,
    Clock,
    ChevronDown,
    ChevronUp,
    Filter
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const SQADiscussions = () => {
    const { user: currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState('all');
    const [replyMap, setReplyMap] = useState({});
    const [submittingId, setSubmittingId] = useState(null);

    useEffect(() => {
        if (currentUser) {
            Promise.all([fetchProjects(), fetchRequests()]);
        }
    }, [currentUser]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/projects', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/requests', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setLoading(false);
        }
    };

    const handleReply = async (requestId) => {
        const content = replyMap[requestId] || '';
        if (!content.trim()) return;
        setSubmittingId(requestId);
        try {
            const res = await fetch(`http://localhost:5000/api/requests/${requestId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ content: content.trim() })
            });
            if (res.ok) {
                setReplyMap(prev => ({ ...prev, [requestId]: '' }));
                fetchRequests();
            }
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setSubmittingId(null);
        }
    };

    const projectMap = {};
    projects.forEach(p => { projectMap[p._id] = p.title; });

    const discussionThreads = requests.filter(r => {
        if (selectedProject === 'all') return true;
        if (selectedProject === 'sqa') return r.category === 'SQA Review' || r.type === 'Bug';
        return r.project === selectedProject;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#191a23]">Project Discussions</h1>
                    <p className="text-[#191a23]/60 font-medium">Collaborate with the team on project topics.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Filter size={16} className="text-[#191a23]/40" />
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#453abc]/20"
                    >
                        <option value="all">All Discussions</option>
                        <option value="sqa">SQA Reviews</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-[#191a23]/20 italic font-medium">Loading discussions...</div>
            ) : discussionThreads.length > 0 ? (
                <div className="space-y-4">
                    {discussionThreads.map((thread) => {
                        const currentReply = replyMap[thread._id] || '';
                        const isSubmitting = submittingId === thread._id;

                        return (
                            <div key={thread._id} className="bg-white rounded-[32px] shadow-sm border border-[#191a23]/5 overflow-hidden hover:shadow-md transition-all">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#453abc]">
                                                <Layout size={14} />
                                                <span>{projectMap[thread.project] || 'General'}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-[#191a23]">{thread.title}</h3>
                                            <div className="flex items-center space-x-3 text-xs text-[#191a23]/50 font-bold">
                                                <span className="flex items-center space-x-1">
                                                    <User size={12} />
                                                    <span>{thread.createdBy?.name || 'Unknown'}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <Clock size={12} />
                                                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                                </span>
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">
                                                    {thread.type || 'Discussion'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-[#191a23]/40">
                                            {thread.messages?.length || 0} messages
                                        </span>
                                    </div>

                                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                                        {thread.messages && thread.messages.length > 0 ? (
                                            thread.messages.map((msg, idx) => {
                                                const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                                                const isMe = senderId?.toString() === currentUser._id?.toString();
                                                return (
                                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-3 rounded-2xl ${isMe
                                                            ? 'bg-[#191a23] text-white rounded-tr-none'
                                                            : 'bg-gray-50 border border-gray-100 text-[#191a23] rounded-tl-none'
                                                        }`}>
                                                            <p className="text-sm font-medium">{msg.content}</p>
                                                            <p className={`text-[10px] font-black uppercase mt-1 ${isMe ? 'text-white/40' : 'text-[#191a23]/40'}`}>
                                                                {isMe ? 'You' : (typeof msg.sender === 'object' ? msg.sender?.name : 'User')} &middot; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-4 text-[#191a23]/40 font-medium italic">No messages yet. Start the discussion!</div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <input
                                            type="text"
                                            value={currentReply}
                                            onChange={(e) => setReplyMap(prev => ({ ...prev, [thread._id]: e.target.value }))}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#453abc] transition-colors"
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleReply(thread._id); }}
                                        />
                                        <button
                                            onClick={() => handleReply(thread._id)}
                                            disabled={isSubmitting || !currentReply.trim()}
                                            className="bg-[#453abc] text-white p-3 rounded-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-40"
                                        >
                                            {isSubmitting
                                                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                : <Send size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-[#191a23]/10">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <MessageSquare size={64} className="text-[#191a23]/10" />
                        <h3 className="text-xl font-bold text-[#191a23]/40 tracking-tight">No Discussions Yet</h3>
                        <p className="text-sm text-[#191a23]/30 font-medium">Start a discussion via the Request Session page.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SQADiscussions;
