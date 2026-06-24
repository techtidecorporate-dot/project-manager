import React, { useState, useEffect } from 'react';
import {
    FolderKanban,
    Plus,
    Search,
    Calendar,
    Filter,
    Briefcase,
    ChevronDown,
    ChevronUp,
    X,
    Trash2,
    FileText,
    ExternalLink,
    Building2,
    Check,
    Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Projects = () => {
    const { user: currentUser } = useAuth();
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [projectsList, setProjectsList] = useState([]);
    const [clientSearch, setClientSearch] = useState('');
    const [allClients, setAllClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [selectedEditFile, setSelectedEditFile] = useState(null);

    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [newProject, setNewProject] = useState({
        title: '',
        client: '',
        status: 'Planning',
        progress: 0,
        startDate: '',
        deadline: '',
        documentName: '',
        documentURL: '',
        workspace: '',
        department: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchProjects();
            fetchClients();
            fetchWorkspacesAndDepartments();
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
                setProjectsList(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/users', {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                const clients = data.filter(u => u.role === 'CLIENT');
                setAllClients(clients);
                setFilteredClients(clients);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchWorkspacesAndDepartments = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${currentUser.token}` };
            const [wsRes, deptRes] = await Promise.all([
                fetch('http://localhost:5000/api/workspaces', { headers }),
                fetch('http://localhost:5000/api/departments', { headers })
            ]);
            if (wsRes.ok) setWorkspaces(await wsRes.json());
            if (deptRes.ok) setDepartments(await deptRes.json());
        } catch (err) {
            console.error('Error fetching hierarchy:', err);
        }
    };

    const handleCardClick = (projectId) => {
        navigate(`/admin/projects/${projectId}`);
    };

    useEffect(() => {
        const filtered = allClients.filter(c =>
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            (c.companyName && c.companyName.toLowerCase().includes(clientSearch.toLowerCase()))
        );
        setFilteredClients(filtered);
    }, [clientSearch, allClients]);

    const handleSelectClient = (client) => {
        setNewProject({ ...newProject, client: client.companyName || client.name });
        setClientSearch(client.name);
        setShowClientDropdown(false);
    };

    const handleAddProject = async () => {
        if (!newProject.title || !newProject.client) return;

        const body = {
            title: newProject.title,
            client: newProject.client,
            status: newProject.status || 'Planning',
            startDate: newProject.startDate || null,
            deadline: newProject.deadline || null,
            workspace: newProject.workspace || null,
            department: newProject.department || null,
        };

        try {
            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const project = await response.json();

                if (selectedFile) {
                    const docFormData = new FormData();
                    docFormData.append('document', selectedFile);
                    await fetch(`http://localhost:5000/api/projects/${project._id}/document`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${currentUser.token}` },
                        body: docFormData,
                    });
                }

                fetchProjects();
            setNewProject({
                title: '',
                client: '',
                status: 'Planning',
                progress: 0,
                startDate: '',
                deadline: '',
                documentName: '',
                documentURL: '',
                workspace: '',
                department: ''
            });
                setSelectedFile(null);
                setClientSearch('');
                setIsAddModalOpen(false);
            }
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };

    const handleDeleteProject = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            if (response.ok) {
                fetchProjects();
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleEditClick = (e, project) => {
        e.stopPropagation();
        setEditingProject({
            ...project,
            client: project.client || '',
            startDate: project.startDate || '',
            deadline: project.deadline || '',
            documentName: project.documentName || '',
            documentURL: project.documentURL || ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateProject = async () => {
        if (!editingProject.title || !editingProject.client) return;

        const body = {
            title: editingProject.title,
            client: editingProject.client,
            status: editingProject.status || 'Planning',
            startDate: editingProject.startDate || null,
            deadline: editingProject.deadline || null,
            workspace: editingProject.workspace || null,
            department: editingProject.department || null,
        };

        try {
            const response = await fetch(`http://localhost:5000/api/projects/${editingProject._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                if (selectedEditFile) {
                    const docFormData = new FormData();
                    docFormData.append('document', selectedEditFile);
                    await fetch(`http://localhost:5000/api/projects/${editingProject._id}/document`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${currentUser.token}` },
                        body: docFormData,
                    });
                }

                fetchProjects();
                setIsEditModalOpen(false);
                setEditingProject(null);
                setSelectedEditFile(null);
            }
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const filtered = projectsList.filter(p => {
        const matchesQuery = `${p.title} ${p.client}`.toLowerCase().includes(query.toLowerCase());
        return matchesQuery;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 relative selection:bg-white selection:text-[#191a23]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Projects</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Manage your projects and clients.</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-br from-[#453abc] to-[#60c3e3]  text-white font-black rounded-xl shadow-lg flex items-center space-x-2 text-sm hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Create Project</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/40" size={20} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder="Search by title or company..."
                    className="w-full bg-white border border-[#191a23]/10 rounded-2xl py-4 pl-12 pr-6 text-[#191a23] outline-none focus:ring-2 focus:ring-[#453abc]/20 transition-all font-bold shadow-sm"
                />
            </div>

            {/* Projects list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project) => (
                    <div
                        key={project._id}
                        className="bg-white p-6 rounded-[24px] shadow-sm border border-[#191a23]/5 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => handleCardClick(project._id)}
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#453abc] transition-all group-hover:w-2" />

                        <div className="flex flex-col space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-[#453abc]/10 rounded-xl">
                                    <Briefcase className="text-[#453abc]" size={24} />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={(e) => handleEditClick(e, project)}
                                        className="p-2 text-[#191a23]/20 hover:text-[#453abc] hover:bg-[#453abc]/10 rounded-lg transition-all"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteProject(e, project._id)}
                                        className="p-2 text-[#191a23]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>


                            <div>
                                <h3 className="text-xl font-black text-[#191a23] leading-tight">{project.title}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs font-bold text-[#453abc] uppercase tracking-wider">Client:</span>
                                    <span className="text-sm font-bold text-[#191a23]/70">{project.client}</span>
                                </div>
                            </div>

                            {project.documentName && (
                                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <FileText className="text-[#191a23]/40" size={16} />
                                    <span className="text-xs font-bold text-[#191a23]/60 truncate max-w-[150px]">{project.documentName}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); window.open(project.documentURL, '_blank'); }}
                                        className="text-[#453abc] hover:underline text-[10px] font-black uppercase ml-auto"
                                    >
                                        View
                                    </button>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs font-black text-[#191a23]/40 uppercase tracking-widest mb-2">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#453abc] transition-all duration-500"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {expanded === project._id && (
                            <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h4 className="text-xs font-black text-[#191a23] uppercase tracking-widest mb-4">Activity Stream</h4>
                                <div className="space-y-4">
                                    {project.updates?.map((u, i) => (
                                        <div key={i} className="flex space-x-3">
                                            <div className="w-1.5 h-1.5 bg-[#453abc] rounded-full mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-[#191a23]">{u.action}</p>
                                                <p className="text-[10px] text-[#191a23]/40 font-medium">By {u.actor} â€¢ {u.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Project Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191a23]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 w-full max-w-[95vw] md:max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-[#191a23] tracking-tight">New Project</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-12 h-12 bg-[#ffffff] rounded-full flex items-center justify-center hover:bg-[#ffffff]/70 transition-colors"
                            >
                                <X size={24} className="text-[#191a23]" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Project Title</label>
                                <input
                                    type="text"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    placeholder="e.g. Acme Corp CRM"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Client</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/30" size={18} />
                                    <input
                                        type="text"
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setShowClientDropdown(true);
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                        placeholder="Search across registered clients..."
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 pl-12 pr-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                    />

                                    {showClientDropdown && filteredClients.length > 0 && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] py-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                            {filteredClients.map((client) => (
                                                <button
                                                    key={client._id}
                                                    type="button"
                                                    onClick={() => handleSelectClient(client)}
                                                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#453abc]/5 transition-colors group"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-sm font-black text-[#191a23]">{client.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{client.companyName || 'No Company Name'}</p>
                                                    </div>
                                                    {newProject.client === (client.companyName || client.name) && (
                                                        <Check size={16} className="text-[#453abc]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="animate-in slide-in-from-top-4 duration-300">
                                <div className="bg-[#453abc]/5 border-2 border-[#453abc]/20 rounded-2xl p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-[#453abc] uppercase tracking-[0.2em]">Client</p>
                                        <p className="text-lg font-black text-[#191a23]">{newProject.client || 'Awaiting Selection...'}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Building2 className="text-[#191a23]/40" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                                <div className="space-y-2 w-full sm:w-1/2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Workspace</label>
                                    <select
                                        value={newProject.workspace}
                                        onChange={(e) => setNewProject({ ...newProject, workspace: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold"
                                    >
                                        <option value="">Select workspace...</option>
                                        {workspaces.map(ws => (
                                            <option key={ws._id} value={ws._id}>{ws.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 w-full sm:w-1/2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Department</label>
                                    <select
                                        value={newProject.department}
                                        onChange={(e) => setNewProject({ ...newProject, department: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold"
                                    >
                                        <option value="">Select department...</option>
                                        {departments.map(d => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                                <div className="space-y-2 w-full sm:w-1/2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={newProject.startDate}
                                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                    />
                                </div>
                                <div className="space-y-2 w-full sm:w-1/2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={newProject.deadline}
                                        onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Project Document</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files && e.target.files[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                setNewProject({ ...newProject, documentName: file.name });
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="w-full flex items-center justify-center space-x-3 bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#453abc] hover:bg-white p-6 rounded-2xl cursor-pointer transition-all"
                                    >
                                        <FileText className="text-[#191a23]/40" size={24} />
                                        <span className="text-sm font-bold text-[#191a23]/60">
                                            {selectedFile?.name || newProject.documentName || 'Select Project File'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleAddProject}
                                className="w-full py-5 bg-[#453abc] text-[#191a23] font-black rounded-2xl hover:shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest mt-6 shadow-lg"
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {isEditModalOpen && editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191a23]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 w-full max-w-[95vw] md:max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-[#191a23] tracking-tight">Edit Project</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-12 h-12 bg-[#ffffff] rounded-full flex items-center justify-center hover:bg-[#ffffff]/70 transition-colors"
                            >
                                <X size={24} className="text-[#191a23]" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Project Title</label>
                                <input
                                    type="text"
                                    value={editingProject.title}
                                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Client (Read Only)</label>
                                <input
                                    type="text"
                                    value={editingProject.client}
                                    readOnly
                                    className="w-full bg-[#f5f5f5]/50 border-2 border-transparent rounded-2xl py-4 px-6 text-[#191a23]/60 font-bold cursor-not-allowed"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                                <div className="space-y-2 w-full sm:w-1/2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={editingProject.startDate}
                                        onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                    />
                                </div>
                                <div className="space-y-2 w-full sm:w-1/2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={editingProject.deadline}
                                        onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Project Document</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="file-upload-edit"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files && e.target.files[0];
                                            if (file) {
                                                setSelectedEditFile(file);
                                                setEditingProject({ ...editingProject, documentName: file.name });
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="file-upload-edit"
                                        className="w-full flex items-center justify-center space-x-3 bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#453abc] hover:bg-white p-6 rounded-2xl cursor-pointer transition-all"
                                    >
                                        <FileText className="text-[#191a23]/40" size={24} />
                                        <span className="text-sm font-bold text-[#191a23]/60">
                                            {selectedEditFile?.name || editingProject.documentName || 'Update Project Specification'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleUpdateProject}
                                className="w-full py-5 bg-[#453abc] text-[#191a23] font-black rounded-2xl hover:shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest mt-6 shadow-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;

