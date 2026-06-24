import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FolderKanban,
    Layout,
    Calendar,
    User,
    ChevronRight,
    Clock,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const DeveloperProjects = () => {
    const { user: currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchProjects();
        }
    }, [currentUser]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/projects', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            setProjects(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setLoading(false);
        }
    };

    const getMyProjects = () => {
        const myProjects = [];
        projects.forEach(project => {
            if (project.phases && project.phases.length > 0) {
                let isAssigned = false;
                let myPhases = [];
                project.phases.forEach(phase => {
                    let devId = null;
                    let devName = '';
                    if (phase.developer) {
                        if (typeof phase.developer === 'object') {
                            devId = phase.developer._id;
                            devName = phase.developer.name || '';
                        } else {
                            devId = phase.developer;
                        }
                    }
                    const currentUserId = String(currentUser._id);
                    const phaseDevId = String(devId);
                    const isIdMatch = phaseDevId === currentUserId;
                    const isNameMatch = devName.toLowerCase().trim() === String(currentUser.name || '').toLowerCase().trim();

                    if (isIdMatch || isNameMatch) {
                        isAssigned = true;
                        myPhases.push(phase);
                    }
                });
                if (isAssigned) {
                    myProjects.push({ ...project, myPhases });
                }
            }
        });
        return myProjects;
    };

    const getPhaseStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Completed (Dev)': return 'bg-emerald-100 text-emerald-700';
            case 'Working': return 'bg-blue-100 text-blue-700';
            case 'Under SQA': return 'bg-purple-100 text-purple-700';
            case 'Error': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const myProjects = getMyProjects();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-[#191a23]">My Projects</h1>
                <span className="text-sm text-[#191a23]/60 font-medium">{myProjects.length} projects</span>
            </div>

            {loading ? (
                <div className="text-center py-10 text-[#191a23]/40 font-medium italic">Loading projects...</div>
            ) : myProjects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <FolderKanban size={48} className="text-gray-300" />
                        <p className="text-[#191a23]/40 font-medium">No projects assigned yet.</p>
                        <p className="text-sm text-[#191a23]/30">Projects will appear here once a PM assigns phases to you.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {myProjects.map(project => (
                        <div key={project._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <FolderKanban size={18} className="text-[#453abc]" />
                                            <h2 className="text-xl font-bold text-[#191a23]">{project.title}</h2>
                                        </div>
                                        {project.client && (
                                            <p className="text-sm text-[#191a23]/50 font-medium flex items-center gap-1 mt-1">
                                                <User size={14} />
                                                Client: {project.client.name || project.client}
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        to={`/developer/projects/${project._id}`}
                                        className="flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest text-[#453abc] hover:underline"
                                    >
                                        <span>View Project</span>
                                        <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#191a23]/40">
                                        My Phases ({project.myPhases.length})
                                    </h3>
                                    {project.myPhases.map((phase, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-[#f5f5f5] rounded-xl hover:bg-[#f0e4d4]/30 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-2 h-8 rounded-full ${phase.status === 'Error' ? 'bg-red-500' : phase.status === 'Working' ? 'bg-blue-500' : phase.status === 'Completed' || phase.status === 'Completed (Dev)' || phase.status === 'Under SQA' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                <div>
                                                    <h4 className="font-bold text-[#191a23] text-sm">{phase.name}</h4>
                                                    {phase.description && (
                                                        <p className="text-xs text-[#191a23]/50">{phase.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getPhaseStatusColor(phase.status)}`}>
                                                    {phase.status === 'Completed (Dev)' ? 'Waiting for SQA' : phase.status}
                                                </span>
                                                {phase.deadline && (
                                                    <span className="flex items-center space-x-1 text-[10px] text-gray-500">
                                                        <Calendar size={12} />
                                                        <span>{phase.deadline}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeveloperProjects;
