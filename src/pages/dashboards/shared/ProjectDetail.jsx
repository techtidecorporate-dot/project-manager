import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    ArrowLeft, Briefcase, Building2, Users, Clock, AlertTriangle,
    DollarSign, FileText, Flag, CheckSquare, MessageSquare, Receipt,
    Download, Trash2, Upload, Plus, User, Calendar, Target,
    BarChart3, Edit3, X, CheckCircle2, Paperclip, Save
} from 'lucide-react';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingBudget, setEditingBudget] = useState(false);
    const [budgetForm, setBudgetForm] = useState({ currency: 'USD', estimated: 0, spent: 0 });
    const [newMessage, setNewMessage] = useState('');
    const [replyToId, setReplyToId] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [showNewDiscussion, setShowNewDiscussion] = useState(false);
    const [discussionForm, setDiscussionForm] = useState({ title: '', description: '', type: 'Chat', priority: 'Medium' });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '', client: '', status: '', priority: '',
        startDate: '', deadline: '', description: ''
    });
    const [showPhaseModal, setShowPhaseModal] = useState(false);
    const [phaseForm, setPhaseForm] = useState({
        name: '', description: '', developer: '', sqa: '',
        deadline: '', priority: 'Medium', duration: '', devDays: '', sqaDays: ''
    });
    const [phaseErrors, setPhaseErrors] = useState([]);
    const [users, setUsers] = useState([]);
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [milestoneForm, setMilestoneForm] = useState({
        name: '', description: '', deadline: '', completionPercentage: 0, responsibleTeam: ''
    });

    const isPMorAdmin = currentUser?.role === 'PM' || currentUser?.role === 'ADMIN';

    const openEditProject = () => {
        if (!project) return;
        setEditForm({
            title: project.title || '',
            client: project.client || '',
            status: project.status || 'Planning',
            priority: project.priority || 'Medium',
            startDate: project.startDate || '',
            deadline: project.deadline || '',
            description: project.description || ''
        });
        setShowEditModal(true);
    };

    const handleSaveProject = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setShowEditModal(false);
                fetchAll();
            }
        } catch (err) {
            console.error('Error updating project:', err);
        }
    };

    const openPhaseManager = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/users', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.ok) setUsers(await res.json());
        } catch (err) {
            console.error('Error fetching users:', err);
        }
        setPhaseErrors(project?.phases || []);
        setShowPhaseModal(true);
    };

    const addPhase = () => {
        if (!phaseForm.name) return;
        setPhaseErrors([...phaseErrors, { ...phaseForm, status: 'Pending', _tempId: Date.now() }]);
        setPhaseForm({ name: '', description: '', developer: '', sqa: '', deadline: '', priority: 'Medium', duration: '', devDays: '', sqaDays: '' });
    };

    const removePhase = (index) => {
        setPhaseErrors(phaseErrors.filter((_, i) => i !== index));
    };

    const handleSavePhases = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                body: JSON.stringify({ phases: phaseErrors })
            });
            if (res.ok) {
                setShowPhaseModal(false);
                fetchAll();
            }
        } catch (err) {
            console.error('Error saving phases:', err);
        }
    };

    const handleCreateMilestone = async () => {
        if (!milestoneForm.name) return;
        try {
            const res = await fetch('http://localhost:5000/api/milestones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                body: JSON.stringify({ ...milestoneForm, project: id, status: 'Pending' })
            });
            if (res.ok) {
                setShowMilestoneModal(false);
                setMilestoneForm({ name: '', description: '', deadline: '', completionPercentage: 0, responsibleTeam: '' });
                fetchAll();
            }
        } catch (err) {
            console.error('Error creating milestone:', err);
        }
    };

    useEffect(() => {
        if (currentUser && id) fetchAll();
    }, [currentUser, id]);

    const fetchAll = async () => {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${currentUser.token}` };
        try {
            const [projRes, milRes, taskRes, invRes, reqRes] = await Promise.all([
                fetch(`http://localhost:5000/api/projects/${id}`, { headers }),
                fetch(`http://localhost:5000/api/milestones?projectId=${id}`, { headers }),
                fetch(`http://localhost:5000/api/tasks?projectId=${id}`, { headers }),
                fetch('http://localhost:5000/api/invoices', { headers }),
                fetch(`http://localhost:5000/api/requests?projectId=${id}`, { headers }),
            ]);

            let projData = null;
            if (projRes.ok) {
                projData = await projRes.json();
                const completedPhases = projData.phases?.filter(p => p.status === 'Completed').length || 0;
                const totalPhases = projData.phases?.length || 0;
                projData.progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
                setProject(projData);
            }

            if (milRes.ok) setMilestones(await milRes.json());
            if (taskRes.ok) setTasks(await taskRes.json());

            if (invRes.ok) {
                const invData = await invRes.json();
                setInvoices(invData.filter(inv =>
                    inv.companyName === projData?.client || inv.client?._id === currentUser?._id
                ));
            }

            if (reqRes.ok) setRequests(await reqRes.json());
        } catch (err) {
            console.error('Error fetching project detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !project) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`http://localhost:5000/api/projects/${id}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: formData,
            });
            if (res.ok) fetchAll();
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };

    const handleSaveBudget = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                body: JSON.stringify({ budget: budgetForm })
            });
            if (res.ok) {
                setEditingBudget(false);
                fetchAll();
            }
        } catch (err) {
            console.error('Error saving budget:', err);
        }
    };

    const handleSendMessage = async (requestId) => {
        if (!newMessage.trim() || !replyToId) return;
        setSendingMessage(true);
        try {
            const res = await fetch(`http://localhost:5000/api/requests/${requestId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                body: JSON.stringify({ content: newMessage })
            });
            if (res.ok) {
                setNewMessage('');
                setReplyToId(null);
                fetchAll();
            }
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleDeleteFile = async (fileName) => {
        if (!project) return;
        const updatedFiles = project.files?.filter(f => f.name !== fileName) || [];
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ files: updatedFiles }),
            });
            if (res.ok) {
                setProject({ ...project, files: updatedFiles });
            }
        } catch (err) {
            console.error('Error deleting file:', err);
        }
    };

    const statusColors = {
        'Planning': 'bg-blue-100 text-blue-700',
        'In Progress': 'bg-[#453abc]/10 text-[#453abc]',
        'Review': 'bg-purple-100 text-purple-700',
        'On Hold': 'bg-orange-100 text-orange-700',
        'Completed': 'bg-green-100 text-green-700',
        'Cancelled': 'bg-red-100 text-red-700',
    };

    const priorityColors = {
        'Low': 'bg-gray-100 text-gray-600',
        'Medium': 'bg-blue-100 text-blue-700',
        'High': 'bg-orange-100 text-orange-700',
        'Urgent': 'bg-red-100 text-red-700',
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'discussions', label: 'Discussions', icon: MessageSquare },
        { id: 'milestones', label: 'Milestones', icon: Flag },
        { id: 'phases', label: 'Phases', icon: Target },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'files', label: 'Files', icon: Paperclip },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertTriangle size={48} className="text-red-400" />
                <p className="text-lg font-bold text-[#191a23]">Project not found</p>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#453abc] text-white rounded-xl font-bold text-sm">
                    Go Back
                </button>
            </div>
        );
    }

    const budgetPercent = project.budget?.estimated > 0
        ? Math.min(100, Math.round((project.budget.spent / project.budget.estimated) * 100))
        : 0;

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#191a23]/5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-xl"><DollarSign size={20} className="text-blue-600" /></div>
                            <span className="text-xs font-black text-[#191a23]/40 uppercase tracking-widest">Budget</span>
                        </div>
                        <button onClick={() => {
                            setBudgetForm({
                                currency: project.budget?.currency || 'USD',
                                estimated: project.budget?.estimated || 0,
                                spent: project.budget?.spent || 0
                            });
                            setEditingBudget(!editingBudget);
                        }} className="text-[10px] font-black text-[#453abc] hover:underline uppercase tracking-wider">
                            {editingBudget ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                    {editingBudget ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <select value={budgetForm.currency} onChange={e => setBudgetForm({ ...budgetForm, currency: e.target.value })}
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none">
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="PKR">PKR</option>
                                </select>
                                <input type="number" value={budgetForm.estimated} onChange={e => setBudgetForm({ ...budgetForm, estimated: Number(e.target.value) })}
                                    placeholder="Estimated" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                                <input type="number" value={budgetForm.spent} onChange={e => setBudgetForm({ ...budgetForm, spent: Number(e.target.value) })}
                                    placeholder="Spent" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                            </div>
                            <button onClick={handleSaveBudget}
                                className="w-full py-2 bg-[#453abc] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                                Save Budget
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-black text-[#191a23]">
                                {project.budget?.currency || 'USD'} {project.budget?.estimated?.toLocaleString() || 0}
                            </p>
                            <div className="mt-2">
                                <div className="flex justify-between text-[10px] font-bold text-[#191a23]/40 mb-1">
                                    <span>Spent: {project.budget?.spent?.toLocaleString() || 0}</span>
                                    <span>{budgetPercent}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${budgetPercent}%` }} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#191a23]/5 shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-[#453abc]/10 rounded-xl"><BarChart3 size={20} className="text-[#453abc]" /></div>
                        <span className="text-xs font-black text-[#191a23]/40 uppercase tracking-widest">Progress</span>
                    </div>
                    <p className="text-2xl font-black text-[#453abc]">{project.progress || 0}%</p>
                    <div className="mt-2">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#453abc] to-[#60c3e3] rounded-full transition-all" style={{ width: `${project.progress || 0}%` }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#191a23]/5 shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-amber-50 rounded-xl"><Users size={20} className="text-amber-600" /></div>
                        <span className="text-xs font-black text-[#191a23]/40 uppercase tracking-widest">Team</span>
                    </div>
                    <p className="text-2xl font-black text-[#191a23]">{project.team?.length || 0} Members</p>
                    <p className="text-xs text-[#191a23]/40 font-medium mt-1">
                        {project.phases?.length || 0} Phases &bull; {milestones.length} Milestones
                    </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#191a23]/5 shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-green-50 rounded-xl"><CheckSquare size={20} className="text-green-600" /></div>
                        <span className="text-xs font-black text-[#191a23]/40 uppercase tracking-widest">Tasks</span>
                    </div>
                    <p className="text-2xl font-black text-[#191a23]">{tasks.length} Tasks</p>
                    <p className="text-xs text-[#191a23]/40 font-medium mt-1">
                        {tasks.filter(t => t.status === 'Completed').length} Completed
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-[#191a23]/5 shadow-sm">
                        <h3 className="text-sm font-black text-[#191a23] uppercase tracking-widest mb-4">Project Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-wider mb-1">Title</p>
                                <p className="text-sm font-bold text-[#191a23]">{project.title}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-wider mb-1">Manager</p>
                                <p className="text-sm font-bold text-[#191a23]">{project.manager?.name || 'Not assigned'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-wider mb-1">Start Date</p>
                                <p className="text-sm font-bold text-[#191a23]">{project.startDate || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-wider mb-1">Deadline</p>
                                <p className="text-sm font-bold text-[#191a23]">{project.deadline || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-wider mb-1">Status</p>
                                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {project.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-wider mb-1">Priority</p>
                                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${priorityColors[project.priority] || 'bg-gray-100 text-gray-600'}`}>
                                    {project.priority || 'Medium'}
                                </span>
                            </div>
                        </div>
                        {project.description && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-wider mb-2">Description</p>
                                <p className="text-sm text-[#191a23]/70">{project.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#191a23]/5 shadow-sm">
                        <h3 className="text-sm font-black text-[#191a23] uppercase tracking-widest mb-4">Client Information</h3>
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-[#453abc]/10 rounded-2xl flex items-center justify-center">
                                <Building2 size={28} className="text-[#453abc]" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-[#191a23]">{project.client || 'No client'}</p>
                                <p className="text-xs text-[#191a23]/40 font-medium">Company Name</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#191a23]/5 shadow-sm">
                        <h3 className="text-sm font-black text-[#191a23] uppercase tracking-widest mb-4">Team Members</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.team?.length > 0 ? project.team.map((member, i) => (
                                <div key={i} className="flex items-center space-x-2 bg-[#191a23] text-white pl-1 pr-3 py-1 rounded-full">
                                    <div className="w-7 h-7 bg-[#453abc] rounded-full flex items-center justify-center text-xs font-bold">
                                        {member.name?.charAt(0) || '?'}
                                    </div>
                                    <span className="text-xs font-bold">{member.name || 'Unknown'}</span>
                                </div>
                            )) : <p className="text-sm text-[#191a23]/40 italic">No team members assigned.</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-[#191a23]/5 shadow-sm">
                        <h3 className="text-sm font-black text-[#191a23] uppercase tracking-widest mb-4">Recent Phases</h3>
                        <div className="space-y-3">
                            {project.phases?.slice(0, 5).map((phase, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-xs font-bold text-[#191a23]">{phase.name}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${phase.status === 'Completed' ? 'text-green-600' : phase.status === 'Error' ? 'text-red-600' : 'text-[#453abc]'}`}>
                                            {phase.status}
                                        </span>
                                    </div>
                                    <CheckCircle2 size={16} className={phase.status === 'Completed' ? 'text-green-500' : 'text-gray-300'} />
                                </div>
                            ))}
                            {(!project.phases || project.phases.length === 0) && (
                                <p className="text-sm text-[#191a23]/40 italic">No phases defined.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#191a23]/5 shadow-sm">
                        <h3 className="text-sm font-black text-[#191a23] uppercase tracking-widest mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {project.updates?.slice(0, 5).map((u, i) => (
                                <div key={i} className="flex space-x-2">
                                    <div className="w-2 h-2 bg-[#453abc] rounded-full mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-[#191a23]">{u.action}</p>
                                        <p className="text-[9px] text-[#191a23]/40 font-medium">By {u.actor} &bull; {u.time}</p>
                                    </div>
                                </div>
                            ))}
                            {(!project.updates || project.updates.length === 0) && (
                                <p className="text-sm text-[#191a23]/40 italic">No activity yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMilestones = () => (
        <div className="space-y-4">
            {isPMorAdmin && (
                <div className="flex justify-end">
                    <button onClick={() => setShowMilestoneModal(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2">
                        <Plus size={14} /> New Milestone
                    </button>
                </div>
            )}
            {milestones.length > 0 ? milestones.map((ms, i) => (
                <div key={ms._id} className="bg-white p-5 rounded-2xl border border-[#191a23]/5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <Flag size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#191a23]">{ms.name}</p>
                            <p className="text-[10px] text-[#191a23]/40 font-medium">{ms.project?.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {ms.deadline && (
                            <span className="text-[10px] text-[#191a23]/40 font-medium flex items-center gap-1">
                                <Calendar size={12} /> {new Date(ms.deadline).toLocaleDateString()}
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${ms.status === 'Completed' ? 'bg-green-100 text-green-700' : ms.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {ms.status}
                        </span>
                    </div>
                </div>
            )) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <Flag size={40} className="mx-auto text-[#191a23]/20 mb-3" />
                    <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No milestones defined</p>
                </div>
            )}
        </div>
    );

    const renderPhases = () => (
        <div className="space-y-4">
            {isPMorAdmin && (
                <div className="flex justify-end">
                    <button onClick={openPhaseManager}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2">
                        <Edit3 size={14} /> Manage Phases
                    </button>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.phases?.length > 0 ? project.phases.map((phase, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-[#191a23]/5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-black text-[#191a23]">{phase.name}</h4>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${phase.status === 'Completed' ? 'bg-green-100 text-green-700' : phase.status === 'Error' ? 'bg-red-100 text-red-700' : phase.status === 'Working' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {phase.status}
                        </span>
                    </div>
                    {phase.description && <p className="text-xs text-[#191a23]/60 mb-3">{phase.description}</p>}
                    <div className="flex flex-wrap gap-2 text-[10px] text-[#191a23]/50 font-medium">
                        <span>Dev: {typeof phase.developer === 'object' ? phase.developer?.name || 'N/A' : 'N/A'}</span>
                        <span>SQA: {typeof phase.sqa === 'object' ? phase.sqa?.name || 'N/A' : 'N/A'}</span>
                        {phase.deadline && <span>Due: {phase.deadline}</span>}
                        <span className={`font-black uppercase ${phase.priority === 'High' ? 'text-red-500' : phase.priority === 'Medium' ? 'text-amber-500' : 'text-gray-400'}`}>
                            {phase.priority}
                        </span>
                    </div>
                    {phase.errors?.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded-xl">
                            <p className="text-[9px] font-black text-red-600 uppercase tracking-wider mb-1">{phase.errors.length} Error(s)</p>
                            {phase.errors.map((err, ei) => (
                                <p key={ei} className="text-[10px] text-red-500">{err.name}: {err.message}</p>
                            ))}
                        </div>
                    )}
                </div>
            )) : (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <Target size={40} className="mx-auto text-[#191a23]/20 mb-3" />
                    <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No phases defined</p>
                </div>
            )}
        </div>
            </div>
    );

    const TaskCard = ({ task }) => {
        const [expanded, setExpanded] = useState(false);
        const [subtaskData, setSubtaskData] = useState(null);
        const [loadingSubs, setLoadingSubs] = useState(false);

        const fetchSubtasks = async () => {
            if (subtaskData) { setExpanded(!expanded); return; }
            setLoadingSubs(true);
            try {
                const res = await fetch(`http://localhost:5000/api/subtasks?taskId=${task._id}`, {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                const data = await res.json();
                if (res.ok) setSubtaskData(data);
            } catch (err) {
                console.error('Error fetching subtasks:', err);
            } finally {
                setLoadingSubs(false);
                setExpanded(true);
            }
        };

        const subsCount = subtaskData?.length ?? 0;
        const completedSubs = subtaskData?.filter(s => s.status === 'Completed').length ?? 0;

        return (
            <div className="bg-white rounded-2xl border border-[#191a23]/5 shadow-sm overflow-hidden">
                <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={fetchSubtasks}>
                    <div className="flex items-center space-x-4">
                        <CheckSquare size={20} className={task.status === 'Completed' ? 'text-green-500' : 'text-[#453abc]'} />
                        <div>
                            <p className="text-sm font-bold text-[#191a23]">{task.title}</p>
                            <p className="text-[10px] text-[#191a23]/40 font-medium">
                                Assigned to: {task.assignedTo?.name || 'Unassigned'}
                                {task.dueDate && ` | Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {subtaskData && (
                            <span className="text-[9px] text-[#191a23]/40 font-medium">{completedSubs}/{subsCount} subs</span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${task.status === 'Completed' ? 'bg-green-100 text-green-700' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {task.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${task.priority === 'Urgent' ? 'bg-red-100 text-red-700' : task.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                            {task.priority}
                        </span>
                    </div>
                </div>
                {expanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 space-y-2">
                        {loadingSubs ? (
                            <p className="text-xs text-[#191a23]/40 text-center py-2 italic">Loading subtasks...</p>
                        ) : subtaskData && subtaskData.length > 0 ? (
                            subtaskData.map(st => (
                                <div key={st._id} className="flex items-center gap-3 py-1.5">
                                    {st.status === 'Completed' ? (
                                        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                    ) : st.status === 'In Progress' ? (
                                        <div className="w-3.5 h-3.5 border-2 border-blue-500 rounded-full shrink-0" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full shrink-0" />
                                    )}
                                    <span className={`text-xs ${st.status === 'Completed' ? 'text-[#191a23]/40 line-through' : 'text-[#191a23] font-medium'}`}>
                                        {st.title}
                                    </span>
                                    <span className={`ml-auto text-[9px] px-2 py-0.5 rounded font-bold ${st.status === 'Completed' ? 'bg-green-100 text-green-700' : st.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {st.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-[#191a23]/30 text-center py-2 italic">No subtasks</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderTasks = () => (
        <div className="space-y-3">
            {tasks.length > 0 ? tasks.map(task => (
                <TaskCard key={task._id} task={task} />
            )) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <CheckSquare size={40} className="mx-auto text-[#191a23]/20 mb-3" />
                    <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No tasks for this project</p>
                </div>
            )}
        </div>
    );

    const renderFiles = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#191a23] uppercase tracking-widest">Project Files ({project.files?.length || 0})</h3>
                <label className="px-4 py-2 bg-[#453abc] text-white rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer hover:shadow-lg transition-all flex items-center gap-2">
                    <Upload size={14} /> Upload File
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
            </div>

            {project.files?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.files.map((file, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-[#191a23]/5 shadow-sm flex items-center justify-between group">
                            <div className="flex items-center space-x-3 min-w-0">
                                <div className="p-2 bg-[#453abc]/10 rounded-xl shrink-0">
                                    <FileText size={20} className="text-[#453abc]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#191a23] truncate max-w-[150px]">{file.name}</p>
                                    <p className="text-[9px] text-[#191a23]/40 font-medium">
                                        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                                        {file.uploadedAt && ` | ${new Date(file.uploadedAt).toLocaleDateString()}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={file.url?.startsWith('blob:') ? file.url : `http://localhost:5000${file.url}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="p-1.5 text-[#191a23]/30 hover:text-[#453abc] rounded-lg transition-all">
                                    <Download size={14} />
                                </a>
                                <button onClick={() => handleDeleteFile(file.name)}
                                    className="p-1.5 text-[#191a23]/30 hover:text-red-500 rounded-lg transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <Paperclip size={40} className="mx-auto text-[#191a23]/20 mb-3" />
                    <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No files uploaded</p>
                </div>
            )}
        </div>
    );

    const renderTimeline = () => (
        <div className="space-y-4">
            {project.updates?.length > 0 ? (
                <div className="relative pl-8 space-y-6">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
                    {project.updates.map((u, i) => (
                        <div key={i} className="relative">
                            <div className="absolute -left-6 top-1 w-3 h-3 bg-[#453abc] rounded-full border-2 border-white" />
                            <div className="bg-white p-4 rounded-2xl border border-[#191a23]/5 shadow-sm">
                                <p className="text-sm font-bold text-[#191a23]">{u.action}</p>
                                <p className="text-[10px] text-[#191a23]/40 font-medium mt-1">
                                    By {u.actor} &bull; {u.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <Clock size={40} className="mx-auto text-[#191a23]/20 mb-3" />
                    <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No timeline activity</p>
                </div>
            )}
        </div>
    );

    const renderInvoices = () => (
        <div className="space-y-3">
            {invoices.length > 0 ? invoices.map((inv, i) => (
                <div key={inv._id} className="bg-white p-5 rounded-2xl border border-[#191a23]/5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <Receipt size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#191a23]">{inv.title || 'Invoice'}</p>
                            <p className="text-[10px] text-[#191a23]/40 font-medium">{inv.companyName || inv.client?.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-[#191a23]">{inv.amount ? `$${inv.amount.toLocaleString()}` : '---'}</p>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${inv.status === 'Paid' ? 'text-green-600' : inv.status === 'Overdue' ? 'text-red-600' : 'text-amber-600'}`}>
                            {inv.status || 'Unpaid'}
                        </span>
                    </div>
                </div>
            )) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <Receipt size={40} className="mx-auto text-[#191a23]/20 mb-3" />
                    <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No invoices</p>
                </div>
            )}
        </div>
    );

    const renderDiscussions = () => (
        <div className="space-y-4">
            {requests.length > 0 ? requests.map(req => (
                <div key={req._id} className="bg-white rounded-2xl border border-[#191a23]/5 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-black text-[#191a23]">{req.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${req.status === 'Resolved' || req.status === 'Closed' ? 'bg-green-100 text-green-700' : req.status === 'Open' || req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {req.status}
                            </span>
                        </div>
                        <p className="text-[10px] text-[#191a23]/50 font-medium">
                            {req.user?.name} &bull; {new Date(req.createdAt).toLocaleDateString()} &bull; {req.type}
                        </p>
                    </div>
                    <div className="p-5 space-y-3 max-h-[300px] overflow-y-auto bg-gray-50/50">
                        {req.messages?.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender?._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender?._id === currentUser?._id ? 'bg-[#453abc] text-white' : 'bg-white border border-gray-100'}`}>
                                    <p className="text-xs font-bold mb-1">{msg.sender?.name || 'Unknown'}</p>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className="text-[9px] opacity-60 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={replyToId === req._id ? newMessage : ''}
                            onFocus={() => setReplyToId(req._id)}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(req._id); } }}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#453abc] font-medium"
                        />
                        <button onClick={() => { setReplyToId(req._id); handleSendMessage(req._id); }}
                            disabled={sendingMessage || replyToId !== req._id || !newMessage.trim()}
                            className="px-4 py-2.5 bg-[#453abc] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            Send
                        </button>
                    </div>
                </div>
            )) : (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <MessageSquare size={40} className="mx-auto text-[#191a23]/20 mb-3" />
                    <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No discussions for this project</p>
                </div>
            )}
        </div>
    );

    return (
        <><div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <ArrowLeft size={22} className="text-[#191a23]" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl lg:text-3xl font-bold text-[#191a23] tracking-tight">{project.title}</h2>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                                {project.status}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${priorityColors[project.priority] || 'bg-gray-100 text-gray-600'}`}>
                                {project.priority || 'Medium'}
                            </span>
                        </div>
                        <p className="text-sm text-[#191a23]/60 font-medium mt-1">
                            {project.client} {project.manager?.name ? `| Managed by ${project.manager.name}` : ''}
                        </p>
                    </div>
                </div>
                {isPMorAdmin && (
                    <button onClick={openEditProject}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2">
                        <Edit3 size={14} /> Edit Project
                    </button>
                )}
            </div>

            <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex space-x-1 min-w-max">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-[#453abc] text-[#453abc]' : 'border-transparent text-[#191a23]/40 hover:text-[#191a23]/70'}`}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'discussions' && renderDiscussions()}
            {activeTab === 'milestones' && renderMilestones()}
            {activeTab === 'phases' && renderPhases()}
            {activeTab === 'tasks' && renderTasks()}
            {activeTab === 'files' && renderFiles()}
            {activeTab === 'timeline' && renderTimeline()}
            {activeTab === 'invoices' && renderInvoices()}
        </div>

                {showEditModal && (
                <div className="fixed inset-0 bg-[#191a23]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-2xl max-w-[95vw] md:max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#191a23] tracking-tight">Edit Project</h3>
                            <button onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Title</label>
                                <input type="text" value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Client</label>
                                <input type="text" value={editForm.client}
                                    onChange={e => setEditForm({ ...editForm, client: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Status</label>
                                    <select value={editForm.status}
                                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        <option value="Planning">Planning</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Priority</label>
                                    <select value={editForm.priority}
                                        onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Start Date</label>
                                    <input type="date" value={editForm.startDate}
                                        onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Deadline</label>
                                    <input type="date" value={editForm.deadline}
                                        onChange={e => setEditForm({ ...editForm, deadline: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Description</label>
                                <textarea value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows="4"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold resize-none" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={handleSaveProject}
                                    className="flex-1 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Save size={16} /> Save Changes
                                </button>
                                <button onClick={() => setShowEditModal(false)}
                                    className="px-8 bg-[#191a23]/10 text-[#191a23] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#191a23]/20 transition-all">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPhaseModal && (
                <div className="fixed inset-0 bg-[#191a23]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-2xl max-w-[95vw] md:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#191a23] tracking-tight">Manage Phases</h3>
                            <button onClick={() => setShowPhaseModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Phase Name</label>
                                    <input type="text" value={phaseForm.name}
                                        onChange={e => setPhaseForm({ ...phaseForm, name: e.target.value })}
                                        placeholder="e.g. UI Design"
                                        className="w-full bg-white border-2 border-transparent focus:border-[#453abc] rounded-xl py-2.5 px-4 text-sm outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Developer</label>
                                    <select value={phaseForm.developer}
                                        onChange={e => setPhaseForm({ ...phaseForm, developer: e.target.value })}
                                        className="w-full bg-white border-2 border-transparent focus:border-[#453abc] rounded-xl py-2.5 px-4 text-sm outline-none transition-all font-bold">
                                        <option value="">Select...</option>
                                        {users.filter(u => u.role === 'DEVELOPER').map(u => (
                                            <option key={u._id} value={u._id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">SQA</label>
                                    <select value={phaseForm.sqa}
                                        onChange={e => setPhaseForm({ ...phaseForm, sqa: e.target.value })}
                                        className="w-full bg-white border-2 border-transparent focus:border-[#453abc] rounded-xl py-2.5 px-4 text-sm outline-none transition-all font-bold">
                                        <option value="">Select...</option>
                                        {users.filter(u => u.role === 'SQA').map(u => (
                                            <option key={u._id} value={u._id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Priority</label>
                                    <select value={phaseForm.priority}
                                        onChange={e => setPhaseForm({ ...phaseForm, priority: e.target.value })}
                                        className="w-full bg-white border-2 border-transparent focus:border-[#453abc] rounded-xl py-2.5 px-4 text-sm outline-none transition-all font-bold">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Deadline</label>
                                    <input type="date" value={phaseForm.deadline}
                                        onChange={e => setPhaseForm({ ...phaseForm, deadline: e.target.value })}
                                        className="w-full bg-white border-2 border-transparent focus:border-[#453abc] rounded-xl py-2.5 px-4 text-sm outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Duration (days)</label>
                                    <input type="number" value={phaseForm.duration}
                                        onChange={e => setPhaseForm({ ...phaseForm, duration: e.target.value })}
                                        placeholder="e.g. 5"
                                        className="w-full bg-white border-2 border-transparent focus:border-[#453abc] rounded-xl py-2.5 px-4 text-sm outline-none transition-all font-bold" />
                                </div>
                            </div>
                            <button onClick={addPhase}
                                className="w-full py-3 border-2 border-dashed border-[#453abc]/30 text-[#453abc] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#453abc]/5 transition-all flex items-center justify-center gap-2">
                                <Plus size={14} /> Add Phase
                            </button>
                            {phaseErrors.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-[#191a23] uppercase tracking-widest">Current Phases ({phaseErrors.length})</p>
                                    {phaseErrors.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="text-sm font-bold text-[#191a23]">{p.name}</p>
                                                <p className="text-[10px] text-[#191a23]/50">
                                                    {p.developerName || (users.find(u => u._id === p.developer)?.name) || 'No dev'} |
                                                    {p.sqaName || (users.find(u => u._id === p.sqa)?.name) || 'No SQA'} | {p.priority}
                                                </p>
                                            </div>
                                            <button onClick={() => removePhase(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button onClick={handleSavePhases}
                                    className="flex-1 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                                    Save Phases
                                </button>
                                <button onClick={() => setShowPhaseModal(false)}
                                    className="px-8 bg-[#191a23]/10 text-[#191a23] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#191a23]/20 transition-all">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMilestoneModal && (
                <div className="fixed inset-0 bg-[#191a23]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-2xl max-w-[95vw] md:max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#191a23] tracking-tight">New Milestone</h3>
                            <button onClick={() => setShowMilestoneModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Milestone Name</label>
                                <input type="text" value={milestoneForm.name}
                                    onChange={e => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                                    placeholder="e.g. UI Design Complete"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Deadline</label>
                                <input type="date" value={milestoneForm.deadline}
                                    onChange={e => setMilestoneForm({ ...milestoneForm, deadline: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">
                                    Completion: {milestoneForm.completionPercentage}%
                                </label>
                                <input type="range" min="0" max="100" step="5" value={milestoneForm.completionPercentage}
                                    onChange={e => setMilestoneForm({ ...milestoneForm, completionPercentage: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#453abc]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Responsible Team</label>
                                <input type="text" value={milestoneForm.responsibleTeam}
                                    onChange={e => setMilestoneForm({ ...milestoneForm, responsibleTeam: e.target.value })}
                                    placeholder="e.g. UI Team, Backend Team"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Description</label>
                                <textarea value={milestoneForm.description}
                                    onChange={e => setMilestoneForm({ ...milestoneForm, description: e.target.value })} rows="3"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold resize-none" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={handleCreateMilestone}
                                    className="flex-1 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                                    Create Milestone
                                </button>
                                <button onClick={() => setShowMilestoneModal(false)}
                                    className="px-8 bg-[#191a23]/10 text-[#191a23] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#191a23]/20 transition-all">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectDetail;
