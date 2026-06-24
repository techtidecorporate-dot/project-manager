import React, { useState, useEffect } from 'react';
import {
    Flag, Calendar, Percent, Users, Search,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ClientMilestones = () => {
    const { user: currentUser } = useAuth();
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (currentUser) fetchMilestones();
    }, [currentUser]);

    const fetchMilestones = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/milestones', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            setMilestones(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching milestones:', error);
            setLoading(false);
        }
    };

    const getProgressColor = (pct) => {
        if (pct >= 80) return 'bg-green-500';
        if (pct >= 40) return 'bg-blue-500';
        if (pct >= 20) return 'bg-amber-500';
        return 'bg-gray-400';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const filtered = milestones.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.responsibleTeam?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-[#191a23] tracking-tight">Project Milestones</h1>
                    <p className="text-gray-500 font-bold text-sm">Track major project deliverables and their progress.</p>
                </div>
            </div>

            <div className="relative max-w-md mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/20" size={18} />
                <input type="text" placeholder="Search milestones..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] transition-all font-bold placeholder:text-[#191a23]/20" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((milestone) => {
                        const isExpanded = expandedId === milestone._id;
                        return (
                            <div key={milestone._id} className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                                <div
                                    className="p-6 cursor-pointer select-none"
                                    onClick={() => setExpandedId(prev => prev === milestone._id ? null : milestone._id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                                <Flag className="text-amber-500" size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-[#191a23] truncate">{milestone.name}</h3>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500 font-bold mt-0.5">
                                                    <span>{milestone.project?.title || 'Unknown Project'}</span>
                                                    <span>•</span>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getStatusColor(milestone.status)}`}>
                                                        {milestone.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 shrink-0">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-[#191a23]">{milestone.completionPercentage || 0}%</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Complete</p>
                                            </div>
                                            {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                        </div>
                                    </div>

                                    <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(milestone.completionPercentage || 0)}`}
                                            style={{ width: `${milestone.completionPercentage || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-50 rounded-2xl p-4">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                                    <Calendar size={14} />
                                                    Due Date
                                                </div>
                                                <p className="font-bold text-[#191a23]">
                                                    {milestone.deadline ? new Date(milestone.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                                    <Percent size={14} />
                                                    Progress
                                                </div>
                                                <p className="font-bold text-[#191a23]">{milestone.completionPercentage || 0}% complete</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                                    <Users size={14} />
                                                    Team
                                                </div>
                                                <p className="font-bold text-[#191a23]">{milestone.responsibleTeam || 'Not assigned'}</p>
                                            </div>
                                        </div>
                                        {milestone.description && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                                                <p className="text-sm text-[#191a23]/70">{milestone.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                            <Flag size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#191a23]/40">No Milestones Yet</h3>
                            <p className="text-sm text-gray-400 font-bold mt-2">Milestones will appear here once created by your project manager.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientMilestones;
