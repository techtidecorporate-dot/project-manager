import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ClientProjects = () => {
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
            const response = await fetch('http://localhost:5000/api/projects', {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setProjects(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Planning': return 'bg-orange-100 text-orange-700';
            case 'On Hold': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
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
        <div className="selection:bg-[#fa2742] selection:text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-[#373833] tracking-tight">Active Portfolio</h1>
                    <p className="text-gray-500 font-bold text-sm">Managing projects for <span className="text-[#fa2742]">{currentUser?.companyName || 'Your Company'}</span></p>
                </div>
                <div className="px-6 py-3 bg-[#373833] text-white rounded-2xl shadow-xl font-black text-xs uppercase tracking-widest">
                    {projects.length} Total Projects
                </div>
            </div>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {projects.map((project) => (
                        <div key={project._id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fa2742] rounded-full -mr-16 -mt-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />

                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-gray-50 rounded-[20px] text-[#fa2742] shadow-inner group-hover:scale-110 transition-transform">
                                        <Briefcase size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[#373833] group-hover:text-[#fa2742] transition-colors leading-tight">{project.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 bg-[#fa2742] rounded-full" />
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Global Reach • {project.status}</p>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] ${getStatusColor(project.status)} shadow-sm`}>
                                    {project.status}
                                </span>
                            </div>

                            <div className="space-y-6 mb-8">
                                <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <span>Strategic Progress</span>
                                    <span className="text-[#373833]">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                                    <div
                                        className="bg-gradient-to-r from-[#fa2742] to-[#ff4d63] h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                                        <Calendar size={14} className="text-[#fa2742]" />
                                        <span>Deadline: {project.deadline || 'TBA'}</span>
                                    </div>
                                    {project.documentName && (
                                        <a
                                            href={project.documentURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-wider hover:text-[#fa2742] transition-colors"
                                        >
                                            <FileText size={14} className="text-[#fa2742]" />
                                            <span>Spec Doc</span>
                                        </a>
                                    )}
                                </div>
                                <button className="text-[#373833] font-black text-[10px] uppercase tracking-widest hover:text-[#fa2742] transition-colors flex items-center gap-2">
                                    Full Intel
                                    <Clock size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="text-gray-300" size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-[#373833]">No Projects Assigned</h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-2 max-w-xs mx-auto">Projects matching your corporate identity will appear here once initiated by admin.</p>
                </div>
            )}
        </div>
    );
};

export default ClientProjects;
