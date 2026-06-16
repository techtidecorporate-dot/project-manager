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

    const [newProject, setNewProject] = useState({
        title: '',
        client: '',
        status: 'Planning',
        progress: 0,
        startDate: '',
        deadline: '',
        documentName: '',
        documentURL: ''
    });

    useEffect(() => {
        if (currentUser) {
            fetchProjects();
            fetchClients();
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

        try {
            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(newProject),
            });

            if (response.ok) {
                fetchProjects();
                setNewProject({
                    title: '',
                    client: '',
                    status: 'Planning',
                    progress: 0,
                    startDate: '',
                    deadline: '',
                    documentName: '',
                    documentURL: ''
                });
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

        try {
            const response = await fetch(`http://localhost:5000/api/projects/${editingProject._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(editingProject),
            });

            if (response.ok) {
                fetchProjects();
                setIsEditModalOpen(false);
                setEditingProject(null);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fa2742]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 relative selection:bg-white selection:text-[#373833]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-[#373833] tracking-tight">Projects</h2>
                    <p className="text-[#373833]/60 font-medium text-sm">Manage your projects and clients.</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-[#fa2742] text-[#373833] font-black rounded-xl shadow-lg flex items-center space-x-2 text-sm hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Create Project</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#373833]/40" size={20} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder="Search by title or company..."
                    className="w-full bg-white border border-[#373833]/10 rounded-2xl py-4 pl-12 pr-6 text-[#373833] outline-none focus:ring-2 focus:ring-[#fa2742]/20 transition-all font-bold shadow-sm"
                />
            </div>

            {/* Projects list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project) => (
                    <div
                        key={project._id}
                        className="bg-white p-6 rounded-[24px] shadow-sm border border-[#373833]/5 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => setExpanded(expanded === project._id ? null : project._id)}
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#fa2742] transition-all group-hover:w-2" />

                        <div className="flex flex-col space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-[#fa2742]/10 rounded-xl">
                                    <Briefcase className="text-[#fa2742]" size={24} />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={(e) => handleEditClick(e, project)}
                                        className="p-2 text-[#373833]/20 hover:text-[#fa2742] hover:bg-[#fa2742]/10 rounded-lg transition-all"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteProject(e, project._id)}
                                        className="p-2 text-[#373833]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>


                            <div>
                                <h3 className="text-xl font-black text-[#373833] leading-tight">{project.title}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs font-bold text-[#fa2742] uppercase tracking-wider">Client:</span>
                                    <span className="text-sm font-bold text-[#373833]/70">{project.client}</span>
                                </div>
                            </div>

                            {project.documentName && (
                                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <FileText className="text-[#373833]/40" size={16} />
                                    <span className="text-xs font-bold text-[#373833]/60 truncate max-w-[150px]">{project.documentName}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); window.open(project.documentURL, '_blank'); }}
                                        className="text-[#fa2742] hover:underline text-[10px] font-black uppercase ml-auto"
                                    >
                                        View
                                    </button>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs font-black text-[#373833]/40 uppercase tracking-widest mb-2">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#fa2742] transition-all duration-500"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {expanded === project._id && (
                            <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h4 className="text-xs font-black text-[#373833] uppercase tracking-widest mb-4">Activity Stream</h4>
                                <div className="space-y-4">
                                    {project.updates?.map((u, i) => (
                                        <div key={i} className="flex space-x-3">
                                            <div className="w-1.5 h-1.5 bg-[#fa2742] rounded-full mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-[#373833]">{u.action}</p>
                                                <p className="text-[10px] text-[#373833]/40 font-medium">By {u.actor} • {u.time}</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#373833]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-[#373833] tracking-tight">New Project</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-12 h-12 bg-[#e8eae3] rounded-full flex items-center justify-center hover:bg-[#e8eae3]/70 transition-colors"
                            >
                                <X size={24} className="text-[#373833]" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Project Title</label>
                                <input
                                    type="text"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    placeholder="e.g. Acme Corp CRM"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-2xl py-4 px-6 text-[#373833] outline-none transition-all font-bold placeholder:text-[#373833]/20"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Client</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#373833]/30" size={18} />
                                    <input
                                        type="text"
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setShowClientDropdown(true);
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                        placeholder="Search across registered clients..."
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-2xl py-4 pl-12 pr-6 text-[#373833] outline-none transition-all font-bold placeholder:text-[#373833]/20"
                                    />

                                    {showClientDropdown && filteredClients.length > 0 && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] py-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                            {filteredClients.map((client) => (
                                                <button
                                                    key={client._id}
                                                    type="button"
                                                    onClick={() => handleSelectClient(client)}
                                                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#fa2742]/5 transition-colors group"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-sm font-black text-[#373833]">{client.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{client.companyName || 'No Company Name'}</p>
                                                    </div>
                                                    {newProject.client === (client.companyName || client.name) && (
                                                        <Check size={16} className="text-[#fa2742]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="animate-in slide-in-from-top-4 duration-300">
                                <div className="bg-[#fa2742]/5 border-2 border-[#fa2742]/20 rounded-2xl p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-[#fa2742] uppercase tracking-[0.2em]">Client</p>
                                        <p className="text-lg font-black text-[#373833]">{newProject.client || 'Awaiting Selection...'}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Building2 className="text-[#373833]/40" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <div className="space-y-2 w-1/2">
                                    <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={newProject.startDate}
                                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-2xl py-4 px-6 text-[#373833] outline-none transition-all font-bold placeholder:text-[#373833]/20"
                                    />
                                </div>
                                <div className="space-y-2 w-1/2">
                                    <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={newProject.deadline}
                                        onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-2xl py-4 px-6 text-[#373833] outline-none transition-all font-bold placeholder:text-[#373833]/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Project Document</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files && e.target.files[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                setNewProject({ ...newProject, documentName: file.name, documentURL: url });
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="w-full flex items-center justify-center space-x-3 bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#fa2742] hover:bg-white p-6 rounded-2xl cursor-pointer transition-all"
                                    >
                                        <FileText className="text-[#373833]/40" size={24} />
                                        <span className="text-sm font-bold text-[#373833]/60">
                                            {newProject.documentName || 'Select Project File'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleAddProject}
                                className="w-full py-5 bg-[#fa2742] text-[#373833] font-black rounded-2xl hover:shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest mt-6 shadow-lg"
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {isEditModalOpen && editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#373833]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-[#373833] tracking-tight">Edit Project</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-12 h-12 bg-[#e8eae3] rounded-full flex items-center justify-center hover:bg-[#e8eae3]/70 transition-colors"
                            >
                                <X size={24} className="text-[#373833]" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Project Title</label>
                                <input
                                    type="text"
                                    value={editingProject.title}
                                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-2xl py-4 px-6 text-[#373833] outline-none transition-all font-bold placeholder:text-[#373833]/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Client (Read Only)</label>
                                <input
                                    type="text"
                                    value={editingProject.client}
                                    readOnly
                                    className="w-full bg-[#f5f5f5]/50 border-2 border-transparent rounded-2xl py-4 px-6 text-[#373833]/60 font-bold cursor-not-allowed"
                                />
                            </div>

                            <div className="flex space-x-4">
                                <div className="space-y-2 w-1/2">
                                    <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={editingProject.startDate}
                                        onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-2xl py-4 px-6 text-[#373833] outline-none transition-all font-bold placeholder:text-[#373833]/20"
                                    />
                                </div>
                                <div className="space-y-2 w-1/2">
                                    <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={editingProject.deadline}
                                        onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-2xl py-4 px-6 text-[#373833] outline-none transition-all font-bold placeholder:text-[#373833]/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Project Document</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="file-upload-edit"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files && e.target.files[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                setEditingProject({ ...editingProject, documentName: file.name, documentURL: url });
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="file-upload-edit"
                                        className="w-full flex items-center justify-center space-x-3 bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#fa2742] hover:bg-white p-6 rounded-2xl cursor-pointer transition-all"
                                    >
                                        <FileText className="text-[#373833]/40" size={24} />
                                        <span className="text-sm font-bold text-[#373833]/60">
                                            {editingProject.documentName || 'Update Project Specification'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleUpdateProject}
                                className="w-full py-5 bg-[#fa2742] text-[#373833] font-black rounded-2xl hover:shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest mt-6 shadow-lg"
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
