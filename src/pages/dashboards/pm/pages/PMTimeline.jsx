import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Clock, Calendar, ChevronDown, ChevronRight,
    User, CheckCircle, AlertCircle, Filter, Search
} from 'lucide-react';
import clsx from 'clsx';

const PMTimeline = () => {
    const { user: currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { if (currentUser) fetchProjects(); }, [currentUser]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/projects', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-500';
            case 'Working': return 'bg-blue-500';
            case 'Under SQA': return 'bg-purple-500';
            case 'Completed (Dev)': return 'bg-emerald-500';
            case 'Error': return 'bg-red-500';
            case 'Pending': return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'Completed') return <CheckCircle size={14} className="text-green-500" />;
        if (status === 'Error') return <AlertCircle size={14} className="text-red-500" />;
        return <Clock size={14} className="text-blue-500" />;
    };

    const filteredProjects = projects.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]" />
        </div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Project Timeline</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Visual timeline of project phases and milestones.</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/20" size={18} />
                <input type="text" placeholder="Search projects..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] transition-all font-bold placeholder:text-[#191a23]/20" />
            </div>

            <div className="space-y-6">
                {filteredProjects.map((project) => {
                    const isExpanded = expandedProject === project._id;
                    const phases = project.phases || [];
                    const completedPhases = phases.filter(p => p.status === 'Completed').length;
                    const totalPhases = phases.length;

                    return (
                        <div key={project._id} className="bg-white rounded-[24px] shadow-xl border border-[#191a23]/5 overflow-hidden">
                            {/* Project Header */}
                            <div
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                                onClick={() => setExpandedProject(prev => prev === project._id ? null : project._id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#453abc]/10 rounded-2xl flex items-center justify-center">
                                        <Calendar size={24} className="text-[#453abc]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-[#191a23]">{project.title}</h3>
                                        <p className="text-xs text-[#191a23]/60 font-medium">{project.client}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-black text-[#191a23]/40 uppercase tracking-widest">
                                            {completedPhases}/{totalPhases} phases
                                        </p>
                                        <p className="text-[10px] text-[#191a23]/30">{project.progress || 0}% complete</p>
                                    </div>
                                    {isExpanded ? <ChevronDown size={20} className="text-[#453abc]" /> : <ChevronRight size={20} className="text-[#191a23]/40" />}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="px-6 pb-2">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#453abc] to-[#60c3e3] transition-all duration-700 rounded-full"
                                        style={{ width: `${project.progress || 0}%` }} />
                                </div>
                            </div>

                            {/* Expanded Timeline */}
                            {isExpanded && (
                                <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {totalPhases > 0 ? (
                                        <div className="relative ml-4 mt-6">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gray-200" />

                                            {phases.map((phase, idx) => {
                                                const phaseStart = new Date(project.startDate || Date.now());
                                                const phaseDeadline = phase.deadline ? new Date(phase.deadline) : new Date(phaseStart.getTime() + (phase.duration || 7) * 86400000);
                                                const daysTotal = Math.max(1, Math.ceil((phaseDeadline - phaseStart) / 86400000));
                                                const daysLeft = Math.max(0, Math.ceil((phaseDeadline - new Date()) / 86400000));
                                                const progressPct = Math.min(100, Math.round(((daysTotal - daysLeft) / daysTotal) * 100));

                                                return (
                                                    <div key={idx} className="relative flex gap-4 pb-8 last:pb-0">
                                                        {/* Timeline Dot */}
                                                        <div className="relative z-10 mt-1">
                                                            <div className={`w-[15px] h-[15px] rounded-full border-4 border-white shadow ${getStatusColor(phase.status)}`} />
                                                        </div>

                                                        {/* Phase Card */}
                                                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-[#453abc]/20 transition-all">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="font-bold text-[#191a23] text-sm">{phase.name}</h4>
                                                                        <span className={clsx(
                                                                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                                                                            phase.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                                phase.status === 'Working' ? 'bg-blue-100 text-blue-700' :
                                                                                    phase.status === 'Under SQA' ? 'bg-purple-100 text-purple-700' :
                                                                                        phase.status === 'Error' ? 'bg-red-100 text-red-700' :
                                                                                            phase.status === 'Completed (Dev)' ? 'bg-emerald-100 text-emerald-700' :
                                                                                                'bg-yellow-100 text-yellow-700'
                                                                        )}>
                                                                            {phase.status}
                                                                        </span>
                                                                    </div>
                                                                    {phase.description && (
                                                                        <p className="text-[11px] text-[#191a23]/60 italic mb-2">{phase.description}</p>
                                                                    )}
                                                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#191a23]/50 font-medium">
                                                                        <span className="flex items-center gap-1">
                                                                            <User size={10} />
                                                                            Dev: {typeof phase.developer === 'object' ? phase.developer?.name || 'N/A' : 'N/A'}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <User size={10} />
                                                                            SQA: {typeof phase.sqa === 'object' ? phase.sqa?.name || 'N/A' : 'N/A'}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar size={10} />
                                                                            {phase.deadline ? new Date(phase.deadline).toLocaleDateString() : 'No deadline'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Phase Progress */}
                                                            {phase.status !== 'Completed' && (
                                                                <div className="mt-3">
                                                                    <div className="flex justify-between text-[9px] font-black text-[#191a23]/40 uppercase tracking-widest mb-1">
                                                                        <span>Progress</span>
                                                                        <span>{progressPct}%</span>
                                                                    </div>
                                                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                        <div className={`h-full rounded-full transition-all duration-700 ${phase.status === 'Error' ? 'bg-red-500' : 'bg-[#453abc]'}`}
                                                                            style={{ width: `${phase.status === 'Error' ? 100 : progressPct}%` }} />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {phase.errors && phase.errors.length > 0 && (
                                                                <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-xl">
                                                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">
                                                                        {phase.errors.filter(e => !e.isFixed).length} unresolved errors
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-[#191a23]/30 italic font-medium">
                                            No phases defined for this project. Go to Project Division to add phases.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {filteredProjects.length === 0 && (
                    <div className="py-16 text-center bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <Clock size={40} className="mx-auto text-[#191a23]/20 mb-4" />
                        <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No projects found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PMTimeline;
