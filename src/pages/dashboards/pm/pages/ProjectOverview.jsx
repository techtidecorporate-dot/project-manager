import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Clock,
    User,
    FileText,
    Download
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../../../context/AuthContext';

const ProjectOverview = () => {
    const { user: currentUser } = useAuth();
    const [expandedProject, setExpandedProject] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (currentUser) {
            fetchProjects();
        }
    }, [currentUser]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/projects', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleMarkPhaseAsDone = async (projectId, phaseName) => {
        try {
            const project = projects.find(p => p._id === projectId);
            if (!project) return;

            // Update the phase status to 'Completed'
            const updatedPhases = project.phases.map(phase => {
                if (phase.name === phaseName) {
                    return { ...phase, status: 'Completed' };
                }
                return phase;
            });

            const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ phases: updatedPhases })
            });

            if (response.ok) {
                // Refresh projects to show updated progress
                fetchProjects();
            }
        } catch (error) {
            console.error('Error marking phase as done:', error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-[#373833] tracking-tight">Mission Intelligence</h2>
                    <p className="text-[#373833]/60 font-bold text-sm italic uppercase tracking-widest">Real-time status of all enterprise deployments.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {projects.map((project) => (
                    <div
                        key={project._id}
                        className="bg-white rounded-[20px] p-6 shadow-md hover:shadow-xl transition-all border border-[#373833]/5 cursor-pointer"
                        onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                    >
                        {/* Project Header - Always Visible */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#373833]/5 flex items-center justify-center shadow-lg">
                                    <Briefcase size={24} className="text-[#373833]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#373833] hover:text-[#fa2742] transition-colors">{project.title}</h3>
                                    <p className="text-sm text-[#373833]/60 font-medium">{project.client}</p>
                                </div>
                            </div>
                            <div className={`p-2 rounded-lg transition-colors ${expandedProject === project._id ? 'bg-[#373833]/5' : ''}`}>
                                {expandedProject === project._id ? <ChevronUp className="text-[#fa2742]" size={20} /> : <ChevronDown className="text-[#373833]/40" size={20} />}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedProject === project._id && (
                            <div className="mt-6 pt-6 border-t border-[#373833]/10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                {/* Completion Progress Section */}
                                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-[#373833]/5">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-[#373833]/50 uppercase tracking-wider">Project Completion</span>
                                            <span className="text-4xl font-black text-[#fa2742]">{project.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-white h-5 rounded-full overflow-hidden border-2 border-[#373833]/10 shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#fa2742] to-[#ff4757] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(250,39,66,0.4)]"
                                                style={{ width: `${project.progress || 0}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-[#373833]/40 text-center font-medium">
                                            {project.phases?.filter(p => p.status === 'Completed').length || 0} of {project.phases?.length || 0} phases completed
                                        </p>
                                    </div>
                                </div>

                                {/* Project Briefing Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <h4 className="text-xs font-black text-[#373833] uppercase tracking-widest flex items-center space-x-2">
                                            <FileText size={16} />
                                            <span>Mission Briefing</span>
                                        </h4>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-[#373833]/5">
                                            <p className="text-sm text-[#373833]/70 leading-relaxed italic">
                                                {project.description || "Intelligence briefing pending for this deployment."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-[#373833] uppercase tracking-widest flex items-center space-x-2">
                                            <Download size={16} />
                                            <span>Operational Assets</span>
                                        </h4>
                                        {project.documentURL ? (
                                            <a
                                                href={project.documentURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center justify-between p-4 bg-white border-2 border-dashed border-[#fa2742]/20 rounded-2xl hover:border-[#fa2742] transition-all group/doc"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-[#fa2742]/10 rounded-lg flex items-center justify-center text-[#fa2742]">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div className="max-w-[120px]">
                                                        <p className="text-[10px] font-black text-[#373833] uppercase truncate">
                                                            {project.documentName || "Primary Doc"}
                                                        </p>
                                                        <p className="text-[8px] text-[#373833]/40 font-bold uppercase">Asset Verified</p>
                                                    </div>
                                                </div>
                                                <Download size={16} className="text-[#373833]/20 group-hover/doc:text-[#fa2742] transition-colors" />
                                            </a>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center opacity-50">
                                                <p className="text-[9px] font-black text-[#373833]/40 uppercase">No Assets Linked</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Phases and Team in Grid */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-xs font-black text-[#373833] uppercase tracking-widest mb-4 flex items-center space-x-2">
                                            <Clock size={16} />
                                            <span>Project Phases</span>
                                        </h4>
                                        <div className="space-y-3">
                                            {project.phases && project.phases.length > 0 ? project.phases.map((phase, i) => (
                                                <div key={i} className="p-4 bg-[#f5f5f5] rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-[#fa2742]/20">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1">
                                                            <span className="font-black text-[#373833] text-sm block mb-1">{phase.name}</span>
                                                            <span className="text-[10px] text-[#373833]/50 font-bold uppercase tracking-wider">
                                                                Dev: {typeof phase.developer === 'object' ? phase.developer.name : 'Unassigned'}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={clsx(
                                                                    "text-[8px] px-1.5 py-0.5 font-black rounded uppercase",
                                                                    phase.priority === 'High' ? 'bg-[#fa2742]/10 text-[#fa2742]' :
                                                                        phase.priority === 'Medium' ? 'bg-blue-50 text-blue-600' :
                                                                            'bg-gray-100 text-gray-400'
                                                                )}>{phase.priority || 'Medium'}</span>
                                                                <span className="text-[8px] text-[#373833]/40 font-bold uppercase">{phase.duration || 0}d (D:{phase.devDays || 0} S:{phase.sqaDays || 0})</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest
                                                            ${phase.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                phase.status === 'Working' ? 'bg-blue-100 text-blue-700' :
                                                                    phase.status === 'Under SQA' ? 'bg-purple-100 text-purple-700' :
                                                                        phase.status === 'Completed (Dev)' ? 'bg-emerald-100 text-emerald-700' :
                                                                            phase.status === 'Error' ? 'bg-red-100 text-red-700' :
                                                                                'bg-gray-100 text-gray-600'}`}>
                                                            {phase.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            {phase.status === 'Completed' ? (
                                                                <CheckCircle2 size={14} className="text-green-500" />
                                                            ) : phase.status === 'Error' ? (
                                                                <span className="text-[9px] text-red-600 font-black">NEEDS FIX</span>
                                                            ) : (
                                                                <span className="text-[9px] text-blue-600 font-black">ACTIVE</span>
                                                            )}
                                                        </div>
                                                        {/* PM Action Button */}
                                                        {(phase.status === 'Under SQA' || phase.status === 'Completed (Dev)') && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkPhaseAsDone(project._id, phase.name);
                                                                }}
                                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                                                            >
                                                                Mark as Done
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : <p className="text-xs text-[#373833]/40 italic">No phases defined.</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-[#373833] uppercase tracking-widest mb-4 flex items-center space-x-2">
                                            <User size={16} />
                                            <span>Team Members</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {project.team && project.team.length > 0 ? project.team.map((member, i) => (
                                                <div key={i} className="flex items-center space-x-2 bg-[#373833] text-white pl-1 pr-3 py-1 rounded-full">
                                                    <div className="w-6 h-6 bg-[#fa2742] rounded-full flex items-center justify-center text-[10px] font-bold">
                                                        {member.name ? member.name.charAt(0) : '?'}
                                                    </div>
                                                    <span className="text-xs font-bold">{member.name || 'Unknown'}</span>
                                                </div>
                                            )) : <p className="text-xs text-[#373833]/40 italic">No team assigned.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectOverview;
