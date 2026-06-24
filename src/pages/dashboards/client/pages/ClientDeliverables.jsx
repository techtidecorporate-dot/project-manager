import React, { useState, useEffect } from 'react';
import {
    Package,
    ExternalLink,
    Layout,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ClientDeliverables = () => {
    const { user: currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

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

    const getAllDeliverables = () => {
        const deliverables = [];
        projects.forEach(project => {
            if (project.documentName && project.documentURL) {
                deliverables.push({
                    type: 'Project Document',
                    name: project.documentName,
                    url: project.documentURL,
                    project: project.title,
                    date: project.updatedAt,
                    status: 'Available'
                });
            }
            if (project.phases && project.phases.length > 0) {
                project.phases.forEach(phase => {
                    if (phase.deliverableUrl) {
                        deliverables.push({
                            type: 'Phase Deliverable',
                            name: `${phase.name} Deliverable`,
                            url: phase.deliverableUrl,
                            project: project.title,
                            phase: phase.name,
                            date: phase.completedByDevAt || phase.updatedAt,
                            status: phase.status
                        });
                    }
                });
            }
        });
        return deliverables.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    };

    const deliverables = getAllDeliverables();
    const filtered = filter === 'all' ? deliverables : deliverables.filter(d => d.type === filter);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-[#191a23] tracking-tight">Deliverables</h1>
                    <p className="text-gray-500 font-bold text-sm">All project documents and phase deliverables in one place.</p>
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'Project Document', 'Phase Deliverable'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                ? 'bg-[#191a23] text-white'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#453abc]'
                            }`}
                        >
                            {f === 'all' ? 'All' : f === 'Project Document' ? 'Documents' : 'Phase Files'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]"></div>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid gap-4">
                    {filtered.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-[#f0e4d4] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Package className="text-[#453abc]" size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className="text-lg font-bold text-[#191a23]">{item.name}</h3>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                {item.type === 'Project Document' ? 'Document' : 'Deliverable'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500 font-bold">
                                            <span className="flex items-center gap-1">
                                                <Layout size={12} />
                                                {item.project}
                                            </span>
                                            {item.phase && (
                                                <>
                                                    <span>•</span>
                                                    <span>{item.phase}</span>
                                                </>
                                            )}
                                            {item.date && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(item.date).toLocaleDateString()}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'Completed' ? 'bg-green-100 text-green-700' : item.status === 'Available' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {item.status === 'Completed' ? 'Approved' : item.status === 'Available' ? 'Available' : 'In Review'}
                                    </span>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 px-4 py-2 bg-[#191a23] text-white rounded-xl hover:bg-[#453abc] transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <Download size={14} />
                                        <span>View</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                    <Package size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#191a23]/40">No Deliverables Yet</h3>
                    <p className="text-sm text-gray-400 font-bold mt-2">Deliverables will appear here when the team uploads them.</p>
                </div>
            )}
        </div>
    );
};

export default ClientDeliverables;
