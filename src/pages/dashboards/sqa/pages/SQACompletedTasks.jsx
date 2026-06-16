import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    Calendar,
    Layout,
    CheckCircle2,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const SQACompletedTasks = () => {
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
            const projectsRes = await fetch('http://localhost:5000/api/projects', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const projectsData = await projectsRes.json();
            setProjects(projectsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    // Get all completed phases assigned to this SQA
    const getCompletedPhases = () => {
        const completedPhases = [];
        projects.forEach(project => {
            if (project.phases && project.phases.length > 0) {
                project.phases.forEach(phase => {
                    const sqaId = phase.sqa?._id || phase.sqa;
                    const sqaName = phase.sqa?.name || (typeof phase.sqa === 'object' ? phase.sqa.name : '');
                    const isMatch = sqaId === currentUser._id || sqaName.toLowerCase() === currentUser.name?.toLowerCase();

                    // Show approved or rejected phases as completed from SQA's perspective
                    if (isMatch && ['Completed', 'Error'].includes(phase.status)) {
                        completedPhases.push({
                            ...phase,
                            project: {
                                _id: project._id,
                                title: project.title,
                                client: project.client
                            }
                        });
                    }
                });
            }
        });
        return completedPhases;
    };

    const completedPhases = getCompletedPhases();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#373833]">Completed Validations</h1>
                    <p className="text-[#373833]/60 font-medium tracking-tight">History of all approved and verified phases.</p>
                </div>
                <div className="bg-[#373833]/5 px-5 py-2.5 rounded-2xl border border-[#373833]/10">
                    <span className="text-sm font-black text-[#373833] uppercase tracking-widest">
                        {completedPhases.length} Validated & Rejected
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-[#373833]/20 italic font-medium">Loading history...</div>
            ) : completedPhases.length > 0 ? (
                <div className="space-y-4">
                    {completedPhases.map((phase, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-[#373833]/5 opacity-80 hover:opacity-100 transition-all hover:shadow-md group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#373833]/40">
                                        <Layout size={14} />
                                        <span>{phase.project?.title}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#373833] group-hover:text-[#fa2742] transition-colors">{phase.name}</h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {phase.status === 'Completed' ? (
                                        <>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-black uppercase tracking-widest">
                                                Approved
                                            </span>
                                            <CheckCircle size={20} className="text-green-500" />
                                        </>
                                    ) : (
                                        <>
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black uppercase tracking-widest">
                                                Rejected
                                            </span>
                                            <AlertTriangle size={20} className="text-red-500" />
                                        </>
                                    )}
                                </div>
                            </div>

                            {phase.status === 'Error' && phase.errors && (
                                <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <XCircle size={10} /> {phase.errors.length} Issues Reported
                                    </p>
                                    <div className="space-y-1">
                                        {phase.errors.slice(0, 2).map((err, ei) => (
                                            <p key={ei} className="text-xs text-red-800 font-bold truncate">• {err.name || err.message}</p>
                                        ))}
                                        {phase.errors.length > 2 && <p className="text-[9px] text-red-400 font-medium ml-2">+{phase.errors.length - 2} more issues</p>}
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-[#373833]/60 mb-6 italic truncate">
                                "{phase.description || "No description provided."}"
                            </p>

                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#373833]/30">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        <Calendar size={12} />
                                        <span>Target: {phase.deadline || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircle2 size={12} />
                                        <span>Dev: {phase.developer?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                                <span className={phase.status === 'Completed' ? "text-green-600" : "text-red-600"}>
                                    {phase.status === 'Completed' ? "Verification Complete" : "Sent for Fixes"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-[#373833]/10">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <CheckCircle2 size={64} className="text-[#373833]/10" />
                        <h3 className="text-xl font-bold text-[#373833]/40 tracking-tight">No validations yet</h3>
                        <p className="text-sm text-[#373833]/30 font-medium">Approved phases will be archived here.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SQACompletedTasks;
