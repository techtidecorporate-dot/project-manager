import React, { useState, useEffect } from 'react';
import {
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Layout,
    Calendar,
    ChevronRight,
    ExternalLink,
    Bug,
    Clock,
    XCircle
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const SQATrackFixes = () => {
    const { user: currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/projects', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            setProjects(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const getTrackedPhases = () => {
        const rejected = [];
        const resubmitted = [];

        projects.forEach(project => {
            if (project.phases && project.phases.length > 0) {
                project.phases.forEach(phase => {
                    const sqaId = phase.sqa?._id || phase.sqa;
                    const sqaName = phase.sqa?.name || (typeof phase.sqa === 'object' ? phase.sqa.name : '');
                    const isMatch = sqaId === currentUser._id || sqaName.toLowerCase() === currentUser.name?.toLowerCase();

                    if (!isMatch) return;

                    const hasErrors = phase.errors && phase.errors.length > 0;

                    if (phase.status === 'Error') {
                        rejected.push({
                            ...phase,
                            project: { _id: project._id, title: project.title, client: project.client }
                        });
                    } else if (phase.status === 'Completed (Dev)' && hasErrors) {
                        resubmitted.push({
                            ...phase,
                            project: { _id: project._id, title: project.title, client: project.client }
                        });
                    }
                });
            }
        });

        return { rejected, resubmitted };
    };

    const { rejected, resubmitted } = getTrackedPhases();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#191a23]">Track Fixes</h1>
                    <p className="text-[#191a23]/60 font-medium">Monitor rejected phases and re-submissions.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="bg-red-500/10 px-4 py-2 rounded-xl border border-red-200">
                        <span className="text-sm font-bold text-red-600">{rejected.length} Awaiting Fixes</span>
                    </div>
                    <div className="bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-200">
                        <span className="text-sm font-bold text-blue-600">{resubmitted.length} Re-submitted</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-[#191a23]/20 italic font-medium">Loading fix tracking data...</div>
            ) : (
                <div className="space-y-8">
                    {/* Re-submitted for Re-review */}
                    {resubmitted.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-[#191a23] mb-6 flex items-center space-x-2">
                                <RefreshCw size={20} className="text-blue-500" />
                                <span>Ready for Re-review</span>
                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-lg font-bold">{resubmitted.length}</span>
                            </h2>
                            <div className="grid gap-4">
                                {resubmitted.map((phase, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-blue-200 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#453abc]">
                                                    <Layout size={14} />
                                                    <span>{phase.project?.title}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-[#191a23]">{phase.name}</h3>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                                                        Re-submitted for Review
                                                    </span>
                                                    <span className="flex items-center space-x-1 text-xs text-[#191a23]/60 font-bold">
                                                        <Calendar size={14} />
                                                        <span>Target: {phase.deadline}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <a href={`/sqa/tasks`} className="flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest text-[#453abc] hover:underline">
                                                <span>Review in Center</span>
                                                <ChevronRight size={14} />
                                            </a>
                                        </div>

                                        {phase.deliverableUrl && (
                                            <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                                                <span className="text-xs font-bold text-blue-700">Deliverable URL</span>
                                                <a href={phase.deliverableUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-[10px] font-black text-blue-600 hover:underline">
                                                    <ExternalLink size={12} />
                                                    <span>View</span>
                                                </a>
                                            </div>
                                        )}

                                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                            <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <Bug size={14} /> Previously Reported Issues ({phase.errors?.length || 0})
                                            </h4>
                                            <div className="space-y-2">
                                                {(phase.errors || []).map((err, ei) => (
                                                    <div key={ei} className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-100">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                            <span className="text-xs font-medium text-red-700">{err.name || err.message}</span>
                                                        </div>
                                                        {err.evidence && (
                                                            <a href={err.evidence} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-red-100 px-2 py-0.5 rounded text-red-700 font-black hover:bg-red-200">
                                                                EVIDENCE
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Awaiting Developer Fixes */}
                    {rejected.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-[#191a23] mb-6 flex items-center space-x-2">
                                <Clock size={20} className="text-orange-500" />
                                <span>Awaiting Developer Fixes</span>
                                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-lg font-bold">{rejected.length}</span>
                            </h2>
                            <div className="grid gap-4">
                                {rejected.map((phase, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-orange-200 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                                                    <Layout size={14} />
                                                    <span>{phase.project?.title}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-[#191a23]">{phase.name}</h3>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-red-100 text-red-700">
                                                        Rejected - Fix Pending
                                                    </span>
                                                    <span className="flex items-center space-x-1 text-xs text-[#191a23]/60 font-bold">
                                                        <Calendar size={14} />
                                                        <span>Target: {phase.deadline}</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1 text-xs text-[#191a23]/60 font-bold">
                                                        <Clock size={14} />
                                                        <span>Dev: {phase.developer?.name || 'Assigned'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                            <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <XCircle size={14} /> Reported Issues ({phase.errors?.length || 0})
                                            </h4>
                                            <div className="space-y-2">
                                                {(phase.errors || []).map((err, ei) => (
                                                    <div key={ei} className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-100">
                                                        <div>
                                                            <span className="text-xs font-bold text-red-700 block">{err.name || err.message}</span>
                                                            {err.message && err.name && (
                                                                <span className="text-[10px] text-red-500">{err.message}</span>
                                                            )}
                                                        </div>
                                                        {err.evidence && (
                                                            <a href={err.evidence} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-red-100 px-2 py-0.5 rounded text-red-700 font-black hover:bg-red-200 shrink-0">
                                                                EVIDENCE
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {rejected.length === 0 && resubmitted.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-[#191a23]/10">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <CheckCircle size={64} className="text-[#191a23]/10" />
                                <h3 className="text-xl font-bold text-[#191a23]/40 tracking-tight">All Clear</h3>
                                <p className="text-sm text-[#191a23]/30 font-medium">No rejected phases or pending re-submissions.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SQATrackFixes;
