import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    Plus, X, FolderKanban, Briefcase, Calendar,
    AlertCircle, CheckCircle2, Search
} from 'lucide-react';

const PMProjects = () => {
    const { user: currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const [workspaces, setWorkspaces] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [formData, setFormData] = useState({
        title: '', description: '', client: '', startDate: '',
        deadline: '', priority: 'Medium', status: 'Planning',
        workspace: '', department: ''
    });

    useEffect(() => { if (currentUser) fetchData(); }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${currentUser.token}` };
            const [projRes, userRes] = await Promise.all([
                fetch('http://localhost:5000/api/projects', { headers }),
                fetch('http://localhost:5000/api/auth/users', { headers })
            ]);
            setProjects(await projRes.json());
            setUsers(await userRes.json());

            const [wsRes, deptRes] = await Promise.all([
                fetch('http://localhost:5000/api/workspaces', { headers }),
                fetch('http://localhost:5000/api/departments', { headers })
            ]);
            setWorkspaces(await wsRes.json());
            setDepartments(await deptRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    ...formData,
                    manager: currentUser._id
                })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Project created successfully!' });
                setShowModal(false);
                setFormData({ title: '', description: '', client: '', startDate: '', deadline: '', priority: 'Medium', status: 'Planning', workspace: '', department: '' });
                fetchData();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Failed to create project' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error creating project' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const filteredProjects = projects.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusColors = {
        Planning: 'bg-blue-100 text-blue-700',
        'In Progress': 'bg-[#453abc]/10 text-[#453abc]',
        'On Hold': 'bg-orange-100 text-orange-700',
        Completed: 'bg-green-100 text-green-700',
        Cancelled: 'bg-red-100 text-red-700',
        Review: 'bg-purple-100 text-purple-700'
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]" />
        </div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">My Projects</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Create and manage your projects.</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2">
                    <Plus size={16} /> New Project
                </button>
            </div>

            {message.text && (
                <div className={`px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto"><X size={16} /></button>
                </div>
            )}

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/20" size={18} />
                <input type="text" placeholder="Search projects..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] transition-all font-bold placeholder:text-[#191a23]/20" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <Link to={`/pm/projects/${project._id}`} key={project._id} className="block bg-white rounded-[24px] p-6 shadow-xl border border-[#191a23]/5 hover:border-[#453abc]/20 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-[#453abc]/10 rounded-2xl flex items-center justify-center">
                                <Briefcase size={24} className="text-[#453abc]" />
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
                                {project.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-black text-[#191a23] mb-1">{project.title}</h3>
                        <p className="text-xs text-[#191a23]/60 font-medium mb-4">{project.client || 'No client'}</p>

                        {project.description && (
                            <p className="text-xs text-[#191a23]/50 italic mb-4 line-clamp-2">{project.description}</p>
                        )}

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-[10px] font-black text-[#191a23]/40 uppercase tracking-wider">
                                <span>Progress</span>
                                <span>{project.progress || 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#453abc] to-[#60c3e3] transition-all duration-700 rounded-full"
                                    style={{ width: `${project.progress || 0}%` }} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#191a23]/50 font-bold pt-4 border-t border-gray-100">
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-[9px] font-black uppercase">
                                {project.phases?.length || 0} phases
                            </span>
                        </div>
                    </Link>
                ))}
                {filteredProjects.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <FolderKanban size={40} className="mx-auto text-[#191a23]/20 mb-4" />
                        <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No projects found</p>
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#191a23]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 shadow-2xl max-w-[95vw] md:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#191a23] tracking-tight">Create New Project</h3>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateProject} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Project Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Client Name</label>
                                    <input type="text" name="client" value={formData.client} onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Workspace</label>
                                    <select name="workspace" value={formData.workspace} onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        <option value="">Select workspace...</option>
                                        {workspaces.map(ws => (
                                            <option key={ws._id} value={ws._id}>{ws.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Department</label>
                                    <select name="department" value={formData.department} onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        <option value="">Select department...</option>
                                        {departments.map(d => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Deadline</label>
                                    <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        {['Planning', 'In Progress', 'On Hold', 'Review'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold resize-none" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <button type="submit"
                                    className="w-full sm:flex-1 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                                    Create Project
                                </button>
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="w-full sm:w-auto px-8 bg-[#191a23]/10 text-[#191a23] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#191a23]/20 transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PMProjects;
