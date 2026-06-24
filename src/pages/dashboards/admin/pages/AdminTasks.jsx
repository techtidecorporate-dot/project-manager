import React, { useState, useEffect } from 'react';
import TaskDetailModal from '../../../../components/TaskDetailModal';
import { useAuth } from '@/context/AuthContext';
import {
    CheckSquare,
    Plus,
    X,
    Edit2,
    Trash2,
    Search,
    Eye,
    Filter,
    Calendar,
    User,
    FolderKanban,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

const AdminTasks = () => {
    const { user: currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [detailTask, setDetailTask] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        project: '',
        assignedTo: '',
        dueDate: '',
        tags: ''
    });

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${currentUser.token}` };

            const [taskRes, projRes, userRes] = await Promise.all([
                fetch('http://localhost:5000/api/tasks', { headers }),
                fetch('http://localhost:5000/api/projects', { headers }),
                fetch('http://localhost:5000/api/auth/users', { headers })
            ]);

            const [tasksData, projectsData, usersData] = await Promise.all([
                taskRes.json(), projRes.json(), userRes.json()
            ]);

            setTasks(tasksData);
            setProjects(projectsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: task.project?._id || task.project || '',
                assignedTo: task.assignedTo?._id || task.assignedTo || '',
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                tags: task.tags?.join(', ') || ''
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                status: 'Todo',
                priority: 'Medium',
                project: '',
                assignedTo: '',
                dueDate: '',
                tags: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingTask
            ? `http://localhost:5000/api/tasks/${editingTask._id}`
            : 'http://localhost:5000/api/tasks';
        const method = editingTask ? 'PUT' : 'POST';

        const body = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: editingTask ? 'Task updated!' : 'Task created!' });
                setShowModal(false);
                fetchData();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Operation failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving task' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task permanently?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Task deleted!' });
                fetchData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error deleting task' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    const priorityColors = {
        Low: 'bg-gray-100 text-gray-600',
        Medium: 'bg-blue-100 text-blue-600',
        High: 'bg-orange-100 text-orange-600',
        Urgent: 'bg-red-100 text-red-600'
    };
    const statusColors = {
        Todo: 'bg-gray-100 text-gray-600',
        'In Progress': 'bg-[#453abc]/10 text-[#453abc]',
        'In Review': 'bg-amber-100 text-amber-600',
        Completed: 'bg-green-100 text-green-600'
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 selection:bg-[#453abc] selection:text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Task Management</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Create, assign, and manage all tasks across projects.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus size={16} />
                    New Task
                </button>
            </div>

            {message.text && (
                <div className={`px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto"><X size={16} /></button>
                </div>
            )}

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['All', 'Todo', 'In Progress', 'Completed'].map(status => (
                    <div key={status} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-2xl font-black text-[#191a23]">{status === 'All' ? tasks.length : (statusCounts[status] || 0)}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">{status}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/20" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] transition-all font-bold placeholder:text-[#191a23]/20"
                    />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {['All', 'Todo', 'In Progress', 'In Review', 'Completed'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-[#453abc] shadow-sm' : 'text-[#191a23]/40 hover:text-[#191a23]'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-[20px] shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Task</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Project</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Assigned To</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Status</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Priority</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Due</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTasks.length > 0 ? filteredTasks.map(t => (
                                <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-bold text-[#191a23]">{t.title}</p>
                                        <p className="text-[10px] text-[#191a23]/40 mt-0.5 line-clamp-1">{t.description}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-xs font-bold text-[#191a23]/60 flex items-center gap-1.5">
                                            <FolderKanban size={12} />
                                            {t.project?.title || '---'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {t.assignedTo ? (
                                            <span className="text-xs font-bold text-[#191a23]/60 flex items-center gap-1.5">
                                                <User size={12} />
                                                {t.assignedTo.name || 'Unknown'}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-[#191a23]/30 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${statusColors[t.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${priorityColors[t.priority] || 'bg-gray-100 text-gray-600'}`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {t.dueDate ? (
                                            <span className="text-xs font-bold text-[#191a23]/60 flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(t.dueDate).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-[#191a23]/30 italic">---</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setDetailTask(t)}
                                                className="p-2 text-[#191a23]/40 hover:text-[#453abc] hover:bg-[#453abc]/10 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(t)}
                                                className="p-2 text-[#191a23]/40 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                                                title="Edit task"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t._id)}
                                                className="p-2 text-[#191a23]/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete task"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center text-[#191a23]/30 italic font-bold uppercase tracking-widest text-xs">
                                        No tasks found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {detailTask && (
                <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} onUpdate={fetchData} />
            )}

            {/* Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#191a23]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 shadow-2xl max-w-[95vw] md:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#191a23] tracking-tight">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <X size={20} className="text-[#191a23]" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold resize-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        {['Todo', 'In Progress', 'In Review', 'Completed'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Project</label>
                                    <select name="project" value={formData.project} onChange={handleInputChange} className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" required>
                                        <option value="">Select Project</option>
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Assigned To</label>
                                    <select name="assignedTo" value={formData.assignedTo} onChange={handleInputChange} className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold">
                                        <option value="">Unassigned</option>
                                        {users.filter(u => u.role === 'DEVELOPER' || u.role === 'SQA').map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Due Date</label>
                                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Tags (comma-separated)</label>
                                    <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g. frontend, bug, urgent" className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold" />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                                    {editingTask ? 'Update Task' : 'Create Task'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-8 bg-[#191a23]/10 text-[#191a23] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#191a23]/20 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTasks;
