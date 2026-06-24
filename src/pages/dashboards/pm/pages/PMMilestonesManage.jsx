import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Flag, Plus, X, Search, Calendar, CheckCircle2,
    AlertCircle, Trash2, Edit3, Users, Percent
} from 'lucide-react';

const PMMilestonesManage = () => {
    const { user: currentUser } = useAuth();
    const [milestones, setMilestones] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '', description: '', project: '', deadline: '',
        status: 'Pending', completionPercentage: 0, responsibleTeam: ''
    });

    useEffect(() => { if (currentUser) fetchData(); }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${currentUser.token}` };
            const [milRes, projRes] = await Promise.all([
                fetch('http://localhost:5000/api/milestones', { headers }),
                fetch('http://localhost:5000/api/projects', { headers })
            ]);
            setMilestones(await milRes.json());
            setProjects(await projRes.json());
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const resetForm = () => {
        setFormData({
            name: '', description: '', project: '', deadline: '',
            status: 'Pending', completionPercentage: 0, responsibleTeam: ''
        });
        setEditingMilestone(null);
    };

    const openCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (milestone) => {
        setEditingMilestone(milestone);
        setFormData({
            name: milestone.name || '',
            description: milestone.description || '',
            project: milestone.project?._id || '',
            deadline: milestone.deadline ? milestone.deadline.split('T')[0] : '',
            status: milestone.status || 'Pending',
            completionPercentage: milestone.completionPercentage || 0,
            responsibleTeam: milestone.responsibleTeam || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.project) return;

        const isEdit = !!editingMilestone;
        const url = isEdit
            ? `http://localhost:5000/api/milestones/${editingMilestone._id}`
            : 'http://localhost:5000/api/milestones';
        const method = isEdit ? 'PUT' : 'POST';

        const body = {
            name: formData.name,
            description: formData.description || '',
            project: formData.project,
            deadline: formData.deadline || null,
            status: formData.status || 'Pending',
            completionPercentage: Number(formData.completionPercentage) || 0,
            responsibleTeam: formData.responsibleTeam || '',
        };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                showMessage('success', isEdit ? 'Milestone updated!' : 'Milestone created!');
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                const data = await res.json();
                showMessage('error', data.message || 'Failed');
            }
        } catch (err) {
            showMessage('error', 'Error saving milestone');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this milestone?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/milestones/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.ok) {
                showMessage('success', 'Milestone deleted');
                fetchData();
            }
        } catch (err) {
            showMessage('error', 'Error deleting milestone');
        }
    };

    const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Completed': 'bg-green-100 text-green-700',
    };

    const getProgressColor = (pct) => {
        if (pct >= 80) return 'bg-green-500';
        if (pct >= 40) return 'bg-blue-500';
        if (pct >= 20) return 'bg-amber-500';
        return 'bg-gray-400';
    };

    const filtered = milestones.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.responsibleTeam?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]" />
        </div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Milestone Management</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">
                        Milestones represent major project deliverables. Track completion percentage, due dates, and responsible teams.
                    </p>
                </div>
                <button onClick={openCreate}
                    className="px-6 py-3 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2">
                    <Plus size={16} /> New Milestone
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
                <input type="text" placeholder="Search milestones by name, project, or team..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] transition-all font-bold placeholder:text-[#191a23]/20" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((milestone) => (
                    <div key={milestone._id} className="bg-white rounded-[24px] p-6 shadow-xl border border-[#191a23]/5 hover:border-[#453abc]/20 transition-all relative group">
                        <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(milestone)}
                                className="p-1.5 text-[#191a23]/20 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                <Edit3 size={14} />
                            </button>
                            <button onClick={() => handleDelete(milestone._id)}
                                className="p-1.5 text-[#191a23]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                <Flag size={24} className="text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black text-[#191a23] truncate">{milestone.name}</h3>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusColors[milestone.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {milestone.status}
                                </span>
                            </div>
                        </div>

                        {milestone.description && (
                            <p className="text-xs text-[#191a23]/50 italic mb-4 line-clamp-2">{milestone.description}</p>
                        )}

                        <div className="space-y-3 mb-4">
                            <div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-[#191a23]/50 mb-1.5">
                                    <span className="flex items-center gap-1"><Percent size={10} /> Completion</span>
                                    <span>{milestone.completionPercentage || 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(milestone.completionPercentage || 0)}`}
                                        style={{ width: `${milestone.completionPercentage || 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-[10px] text-[#191a23]/50 font-bold">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                    <Flag size={12} />
                                    {milestone.project?.title || 'No project'}
                                </span>
                                {milestone.deadline && (
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(milestone.deadline).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            {milestone.responsibleTeam && (
                                <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                                    <Users size={12} />
                                    <span>Team: {milestone.responsibleTeam}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <Flag size={40} className="mx-auto text-[#191a23]/20 mb-4" />
                        <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No milestones found</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-[#191a23]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 shadow-2xl max-w-[95vw] md:max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#191a23] tracking-tight">
                                {editingMilestone ? 'Edit Milestone' : 'New Milestone'}
                            </h3>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Milestone Name</label>
                                <input type="text" value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Project</label>
                                <select value={formData.project}
                                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" required>
                                    <option value="">Select project...</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Deadline</label>
                                    <input type="date" value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Status</label>
                                    <select value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">
                                    Completion Percentage: {formData.completionPercentage}%
                                </label>
                                <div className="flex items-center gap-3">
                                    <input type="range" min="0" max="100" step="5" value={formData.completionPercentage}
                                        onChange={(e) => setFormData({ ...formData, completionPercentage: parseInt(e.target.value) })}
                                        className="flex-1 h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#453abc]" />
                                    <span className="text-xs font-black text-[#453abc] w-8 text-right">{formData.completionPercentage}%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Responsible Team</label>
                                <input type="text" value={formData.responsibleTeam}
                                    onChange={(e) => setFormData({ ...formData, responsibleTeam: e.target.value })}
                                    placeholder="e.g. UI Team, Backend Team, QA Team"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Description</label>
                                <textarea value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold resize-none" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <button type="submit"
                                    className="w-full sm:flex-1 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                                    {editingMilestone ? 'Update Milestone' : 'Create Milestone'}
                                </button>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="w-full sm:w-auto px-8 bg-[#191a23]/10 text-[#191a23] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#191a23]/20 transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PMMilestonesManage;
