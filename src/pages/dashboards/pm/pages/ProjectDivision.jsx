import React, { useState, useEffect } from 'react';
import {
    Plus,
    Layout,
    MoreVertical,
    Calendar,
    User,
    ChevronRight,
    Map,
    Trash2,
    X,
    Edit,
    CheckCircle2,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const ProjectDivision = () => {
    const { user: currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddDivisionOpen, setIsAddDivisionOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [projectSearch, setProjectSearch] = useState('');
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [newPhases, setNewPhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState({
        name: '', description: '', dev: '', sqa: '', deadline: '',
        priority: 'Medium', duration: '', devDays: '', sqaDays: ''
    });

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            const [projectsRes, usersRes] = await Promise.all([
                fetch('http://localhost:5000/api/projects', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                }),
                fetch('http://localhost:5000/api/auth/users', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                })
            ]);

            const projectsData = await projectsRes.json();
            const usersData = await usersRes.json();

            setProjects(projectsData);
            setUsers(usersData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const getDevs = () => users.filter(u => u.role === 'DEVELOPER');
    const getSQAs = () => users.filter(u => u.role === 'SQA');

    const handleAddPhaseToNew = () => {
        if (currentPhase.name && currentPhase.dev && currentPhase.sqa) {
            setNewPhases([...newPhases, { ...currentPhase, id: Date.now(), status: 'Pending' }]);
            setCurrentPhase({
                name: '', description: '', dev: '', sqa: '', deadline: '',
                priority: 'Medium', duration: '', devDays: '', sqaDays: ''
            });
        } else {
            alert('Please fill in Phase Name, Developer and SQA');
        }
    };

    const handleRemovePhaseFromNew = (id) => {
        setNewPhases(newPhases.filter(p => p.id !== id));
    };

    const handleSaveDivision = async () => {
        if (!selectedProject || newPhases.length === 0) return;

        try {
            // Get current project current phases to append or replace?
            // Usually division implies setting the initial phases. Let's assume we append or overwrite.
            // For safety, let's fetch the project first or use the one in state.
            const projectToUpdate = projects.find(p => p._id === selectedProject);
            const updatedPhases = [...(projectToUpdate.phases || []), ...newPhases.map(p => ({
                name: p.name,
                description: p.description,
                status: 'Pending',
                developer: p.dev,
                sqa: p.sqa,
                deadline: p.deadline,
                priority: p.priority,
                duration: p.duration,
                devDays: p.devDays,
                sqaDays: p.sqaDays
            }))];

            const response = await fetch(`http://localhost:5000/api/projects/${selectedProject}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    phases: updatedPhases,
                    status: 'In Progress' // Update status to In Progress when divided? Optional but logical.
                }),
            });

            if (response.ok) {
                fetchData();
                setIsAddDivisionOpen(false);
                setNewPhases([]);
                setSelectedProject('');
            }
        } catch (error) {
            console.error('Error saving division:', error);
        }
    };

    // Helper to get user name by ID
    const getUserName = (id) => {
        const user = users.find(u => u._id === id);
        return user ? user.name : 'Unassigned';
    };

    const openEditModal = (project) => {
        setEditingProject(JSON.parse(JSON.stringify(project))); // Deep copy
        setIsEditModalOpen(true);
    };

    const handleUpdateProject = async () => {
        if (!editingProject) return;
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${editingProject._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ phases: editingProject.phases }),
            });

            if (response.ok) {
                fetchData();
                setIsEditModalOpen(false);
                setEditingProject(null);
            }
        } catch (error) {
            console.error('Error updating project phases:', error);
        }
    };

    // Edit modal phase handling
    const [editPhaseInput, setEditPhaseInput] = useState({
        name: '', description: '', dev: '', sqa: '', deadline: '',
        priority: 'Medium', duration: '', devDays: '', sqaDays: ''
    });

    const addPhaseToEditing = () => {
        if (editPhaseInput.name && editPhaseInput.dev && editPhaseInput.sqa) {
            setEditingProject({
                ...editingProject,
                phases: [...(editingProject.phases || []), {
                    name: editPhaseInput.name,
                    description: editPhaseInput.description,
                    status: 'Pending',
                    developer: editPhaseInput.dev,
                    sqa: editPhaseInput.sqa,
                    deadline: editPhaseInput.deadline,
                    priority: editPhaseInput.priority,
                    duration: editPhaseInput.duration,
                    devDays: editPhaseInput.devDays,
                    sqaDays: editPhaseInput.sqaDays
                }]
            });
            setEditPhaseInput({
                name: '', description: '', dev: '', sqa: '', deadline: '',
                priority: 'Medium', duration: '', devDays: '', sqaDays: ''
            });
        }
    };

    const removePhaseFromEditing = (idx) => {
        const newPhases = [...editingProject.phases];
        newPhases.splice(idx, 1);
        setEditingProject({ ...editingProject, phases: newPhases });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Project Division</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Organize projects into actionable phases.</p>
                </div>
                <button
                    onClick={() => setIsAddDivisionOpen(true)}
                    className="px-6 py-3 bg-gradient-to-br from-[#453abc] to-[#60c3e3] text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center space-x-2 text-xs uppercase tracking-widest"
                >
                    <Layout size={18} />
                    <span>Divide Project</span>
                </button>
            </div>

            <div className="grid gap-8">
                {projects.map((project) => (
                    <div key={project._id} className="bg-white rounded-3xl p-6 shadow-xl border border-[#191a23]/5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6 border-b border-[#191a23]/5 pb-3">
                            <h3 className="text-xl font-black text-[#191a23]">{project.title}</h3>
                            <button
                                onClick={() => openEditModal(project)}
                                className="text-xs font-bold bg-[#191a23]/5 hover:bg-[#453abc] hover:text-[#191a23] px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <Edit size={14} />
                                <span>Edit Phases</span>
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {project.phases && project.phases.length > 0 ? project.phases.map((phase, i) => (
                                <div key={i} className="bg-[#f5f5f5] p-4 rounded-2xl relative group hover:shadow-md transition-all border border-transparent hover:border-[#453abc]/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-5 h-5 bg-[#191a23] text-white rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded
                                                ${phase.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    phase.status === 'Completed (Dev)' ? 'bg-emerald-100 text-emerald-700' :
                                                        phase.status === 'Working' ? 'bg-blue-100 text-blue-700' :
                                                            phase.status === 'Under SQA' ? 'bg-purple-100 text-purple-700' :
                                                                phase.status === 'Error' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'}`}>
                                                {phase.status}
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-[#191a23] text-sm mb-1 line-clamp-1">{phase.name}</h4>

                                    <div className="space-y-1.5 text-[11px] text-[#191a23]/70">
                                        <div className="flex items-center space-x-2">
                                            <User size={12} className="text-[#191a23]/40" />
                                            <span className="truncate">Dev: {typeof phase.developer === 'object' ? phase.developer.name : getUserName(phase.developer)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle2 size={12} className="text-[#191a23]/40" />
                                            <span className="truncate">SQA: {typeof phase.sqa === 'object' ? phase.sqa.name : getUserName(phase.sqa)}</span>
                                        </div>

                                        <div className="pt-2 mt-2 border-t border-[#191a23]/5 text-[9px] space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-[#191a23]/40 uppercase font-black">Status</span>
                                                <span className={clsx(
                                                    "font-bold",
                                                    phase.priority === 'High' ? 'text-[#453abc]' :
                                                        phase.priority === 'Medium' ? 'text-blue-500' : 'text-gray-400'
                                                )}>{phase.priority || 'Medium'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#191a23]/40 uppercase font-black">Timeline</span>
                                                <span className="font-bold">{phase.duration || 0}d ({phase.devDays || 0}+{phase.sqaDays || 0})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-[#191a23]/40 font-bold">No phases defined for this project.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Project Division Modal */}
            {isAddDivisionOpen && (
                <div className="fixed inset-0 bg-[#191a23]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-[95vw] md:max-w-xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 md:p-6 border-b border-[#191a23]/5">
                            <h3 className="text-xl font-black text-[#191a23]">Divide Project into Phases</h3>
                            <button onClick={() => setIsAddDivisionOpen(false)}><X size={24} className="text-[#191a23]/60 hover:text-[#191a23]" /></button>
                        </div>

                        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                            <div>
                                <label className="text-xs font-bold uppercase text-[#191a23]/60">Select Project</label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        value={projectSearch}
                                        onChange={(e) => {
                                            setProjectSearch(e.target.value);
                                            setIsProjectDropdownOpen(true);
                                            if (e.target.value === '') setSelectedProject('');
                                        }}
                                        onFocus={() => setIsProjectDropdownOpen(true)}
                                        placeholder="Search or select a project..."
                                        className="w-full bg-[#f5f5f5] p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#453abc] font-bold text-[#191a23] pr-10"
                                    />
                                    <ChevronDown
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#191a23]/40 cursor-pointer hover:text-[#453abc]"
                                        size={20}
                                        onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                    />

                                    {isProjectDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#191a23]/10 max-h-60 overflow-y-auto z-50">
                                            {projects.filter(p => p.title.toLowerCase().includes(projectSearch.toLowerCase())).length > 0 ? (
                                                projects
                                                    .filter(p => p.title.toLowerCase().includes(projectSearch.toLowerCase()))
                                                    .map(p => (
                                                        <div
                                                            key={p._id}
                                                            onClick={() => {
                                                                setSelectedProject(p._id);
                                                                setProjectSearch(p.title);
                                                                setIsProjectDropdownOpen(false);
                                                            }}
                                                            className="p-3 hover:bg-[#453abc]/5 cursor-pointer transition-colors border-b border-[#191a23]/5 last:border-0"
                                                        >
                                                            <div className="font-bold text-[#191a23] text-sm">{p.title}</div>
                                                            <div className="text-xs text-[#191a23]/50">{p.client}</div>
                                                        </div>
                                                    ))
                                            ) : (
                                                <div className="p-4 text-center text-[#191a23]/40 text-xs font-bold">
                                                    No projects found.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#f9fafb] p-4 rounded-xl border border-[#191a23]/5 space-y-3">
                                <h4 className="text-sm font-black text-[#191a23]">Add Phase Details</h4>
                                <input
                                    value={currentPhase.name}
                                    onChange={e => setCurrentPhase({ ...currentPhase, name: e.target.value })}
                                    className="w-full bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    placeholder="Phase Name (e.g. Requirement Analysis)"
                                />
                                <textarea
                                    value={currentPhase.description}
                                    onChange={e => setCurrentPhase({ ...currentPhase, description: e.target.value })}
                                    className="w-full bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc] resize-none"
                                    rows="2"
                                    placeholder="Phase Description"
                                />
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={currentPhase.dev}
                                        onChange={e => setCurrentPhase({ ...currentPhase, dev: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    >
                                        <option value="">Select Developer</option>
                                        {getDevs().map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                    <select
                                        value={currentPhase.sqa}
                                        onChange={e => setCurrentPhase({ ...currentPhase, sqa: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    >
                                        <option value="">Select SQA</option>
                                        {getSQAs().map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={currentPhase.priority}
                                        onChange={e => setCurrentPhase({ ...currentPhase, priority: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    >
                                        {['Low', 'Medium', 'High'].map(prio => (
                                            <option key={prio} value={prio}>{prio}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={currentPhase.duration}
                                        onChange={e => setCurrentPhase({ ...currentPhase, duration: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                        placeholder="Total Days"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="number"
                                        value={currentPhase.devDays}
                                        onChange={e => setCurrentPhase({ ...currentPhase, devDays: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                        placeholder="Dev Days"
                                    />
                                    <input
                                        type="number"
                                        value={currentPhase.sqaDays}
                                        onChange={e => setCurrentPhase({ ...currentPhase, sqaDays: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                        placeholder="SQA Days"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="date"
                                        value={currentPhase.deadline}
                                        onChange={e => setCurrentPhase({ ...currentPhase, deadline: e.target.value })}
                                        className="w-full sm:flex-1 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    />
                                    <button
                                        onClick={handleAddPhaseToNew}
                                        className="w-full sm:w-auto bg-[#191a23] text-white px-4 rounded-lg hover:bg-[#453abc] transition-colors font-bold text-xs uppercase"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* List of Added Phases */}
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {newPhases.map((phase) => (
                                    <div key={phase.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-[#191a23]/5">
                                        <div className="flex flex-col flex-1">
                                            <span className="text-sm font-bold text-[#191a23]">{phase.name}</span>
                                            {phase.description && (
                                                <span className="text-xs text-[#191a23]/60 italic mt-1">{phase.description}</span>
                                            )}
                                            <span className="text-xs text-[#191a23]/50">Dev: {getUserName(phase.dev)} | SQA: {getUserName(phase.sqa)}</span>
                                            <span className="text-[10px] text-[#453abc] font-black uppercase mt-1">{phase.priority} Priority | {phase.duration}d (D:{phase.devDays} S:{phase.sqaDays})</span>
                                        </div>
                                        <button onClick={() => handleRemovePhaseFromNew(phase.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                        </div>
                        <div className="p-4 md:p-6 border-t border-[#191a23]/5 bg-gray-50/50">
                            <button
                                onClick={handleSaveDivision}
                                className="w-full bg-gradient-to-br from-[#453abc] to-[#60c3e3]  text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:opacity-90 shadow-lg active:scale-95 transition-all"
                            >
                                Confirm Division
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal implementation similar to above but for editing existing phases - omitted for brevity but can be added if needed, or reusing components */}
            {isEditModalOpen && editingProject && (
                <div className="fixed inset-0 bg-[#191a23]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-[95vw] md:max-w-xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 md:p-6 border-b border-[#191a23]/5">
                            <h3 className="text-xl font-black text-[#191a23]">Edit Phases: {editingProject.title}</h3>
                            <button onClick={() => setIsEditModalOpen(false)}><X size={24} className="text-[#191a23]/60 hover:text-[#191a23]" /></button>
                        </div>

                        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                            <div className="bg-[#f9fafb] p-4 rounded-xl border border-[#191a23]/5 space-y-3">
                                <h4 className="text-sm font-black text-[#191a23]">Add New Phase</h4>
                                <input
                                    value={editPhaseInput.name}
                                    onChange={e => setEditPhaseInput({ ...editPhaseInput, name: e.target.value })}
                                    className="w-full bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    placeholder="Phase Name"
                                />
                                <textarea
                                    value={editPhaseInput.description}
                                    onChange={e => setEditPhaseInput({ ...editPhaseInput, description: e.target.value })}
                                    className="w-full bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc] resize-none"
                                    rows="2"
                                    placeholder="Phase Description"
                                />
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={editPhaseInput.dev}
                                        onChange={e => setEditPhaseInput({ ...editPhaseInput, dev: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    >
                                        <option value="">Select Developer</option>
                                        {getDevs().map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                    <select
                                        value={editPhaseInput.sqa}
                                        onChange={e => setEditPhaseInput({ ...editPhaseInput, sqa: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    >
                                        <option value="">Select SQA</option>
                                        {getSQAs().map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={editPhaseInput.priority}
                                        onChange={e => setEditPhaseInput({ ...editPhaseInput, priority: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                    >
                                        {['Low', 'Medium', 'High'].map(prio => (
                                            <option key={prio} value={prio}>{prio}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={editPhaseInput.duration}
                                        onChange={e => setEditPhaseInput({ ...editPhaseInput, duration: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                        placeholder="Total Days"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="number"
                                        value={editPhaseInput.devDays}
                                        onChange={e => setEditPhaseInput({ ...editPhaseInput, devDays: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                        placeholder="Dev Days"
                                    />
                                    <input
                                        type="number"
                                        value={editPhaseInput.sqaDays}
                                        onChange={e => setEditPhaseInput({ ...editPhaseInput, sqaDays: e.target.value })}
                                        className="w-full sm:w-1/2 bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                        placeholder="SQA Days"
                                    />
                                </div>
                                <input
                                    type="date"
                                    value={editPhaseInput.deadline}
                                    onChange={e => setEditPhaseInput({ ...editPhaseInput, deadline: e.target.value })}
                                    className="w-full bg-white p-2 rounded-lg border border-[#191a23]/10 text-sm outline-none focus:border-[#453abc]"
                                />
                                <button
                                    onClick={addPhaseToEditing}
                                    className="w-full bg-[#191a23] text-white py-2 rounded-lg hover:bg-[#453abc] transition-colors font-bold text-xs uppercase"
                                >
                                    Add Phase
                                </button>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {editingProject.phases && editingProject.phases.map((phase, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-[#191a23]/5">
                                        <div className="flex flex-col flex-1">
                                            <span className="text-sm font-bold text-[#191a23]">{phase.name}</span>
                                            {phase.description && (
                                                <span className="text-xs text-[#191a23]/60 italic mt-1">{phase.description}</span>
                                            )}
                                            <span className="text-xs text-[#191a23]/50">Dev: {typeof phase.developer === 'object' ? phase.developer.name : getUserName(phase.developer)}</span>
                                            <span className="text-[10px] text-[#453abc] font-black uppercase mt-1">{phase.priority || 'Medium'} Priority | {phase.duration || 0}d (D:{phase.devDays || 0} S:{phase.sqaDays || 0})</span>
                                        </div>
                                        <button onClick={() => removePhaseFromEditing(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                        </div>
                        <div className="p-4 md:p-6 border-t border-[#191a23]/5 bg-gray-50/50">
                            <button
                                onClick={handleUpdateProject}
                                className="w-full bg-[#453abc] text-[#191a23] font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:opacity-90 shadow-lg active:scale-95 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ProjectDivision;

