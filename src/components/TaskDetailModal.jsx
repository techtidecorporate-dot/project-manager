import React, { useState, useEffect } from 'react';
import {
    X, Plus, CheckCircle2, Circle, Trash2, User, Calendar,
    AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const TaskDetailModal = ({ task, onClose, onUpdate }) => {
    const { user: currentUser } = useAuth();
    const [subtasks, setSubtasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (task?._id) fetchSubtasks();
    }, [task?._id]);

    const fetchSubtasks = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:5000/api/subtasks?taskId=${task._id}`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) setSubtasks(data);
        } catch (error) {
            console.error('Error fetching subtasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            const res = await fetch('http://localhost:5000/api/subtasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ title: newTitle, description: newDescription, task: task._id })
            });
            if (res.ok) {
                setNewTitle('');
                setNewDescription('');
                setShowAddForm(false);
                fetchSubtasks();
                showMessage('success', 'Subtask added!');
            } else {
                const data = await res.json();
                showMessage('error', data.message || 'Failed to add subtask');
            }
        } catch (error) {
            showMessage('error', 'Error adding subtask');
        }
    };

    const handleStatusToggle = async (subtask) => {
        const nextStatus = subtask.status === 'Completed' ? 'Todo' :
            subtask.status === 'In Progress' ? 'Completed' : 'In Progress';
        try {
            const res = await fetch(`http://localhost:5000/api/subtasks/${subtask._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) {
                fetchSubtasks();
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            showMessage('error', 'Error updating subtask');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subtask?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/subtasks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.ok) {
                fetchSubtasks();
                showMessage('success', 'Subtask removed');
            }
        } catch (error) {
            showMessage('error', 'Error deleting subtask');
        }
    };

    const statusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={18} className="text-green-500" />;
            case 'In Progress': return <Loader2 size={18} className="text-blue-500 animate-spin" />;
            default: return <Circle size={18} className="text-gray-300" />;
        }
    };

    const statusColors = {
        Todo: 'bg-gray-100 text-gray-600',
        'In Progress': 'bg-blue-100 text-blue-600',
        Completed: 'bg-green-100 text-green-600'
    };

    const priorityColors = {
        Low: 'bg-gray-100 text-gray-600', Medium: 'bg-blue-100 text-blue-600',
        High: 'bg-orange-100 text-orange-600', Urgent: 'bg-red-100 text-red-600'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191a23]/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 md:p-6 border-b border-gray-100 rounded-t-[32px]">
                    <h3 className="text-xl font-black text-[#191a23] tracking-tight truncate pr-4">Task Details</h3>
                    <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {message.text && (
                    <div className={`mx-4 md:mx-6 mt-4 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 ${
                        message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}

                <div className="p-4 md:p-6 space-y-6">
                    {/* Task Info */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                        <h4 className="text-lg font-black text-[#191a23]">{task.title}</h4>
                        {task.description && (
                            <p className="text-sm text-[#191a23]/60">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${statusColors[task.status] || 'bg-gray-100 text-gray-600'}`}>{task.status}</span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${priorityColors[task.priority] || 'bg-gray-100 text-gray-600'}`}>{task.priority}</span>
                            {task.assignedTo && (
                                <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-[#453abc]/10 text-[#453abc] flex items-center gap-1">
                                    <User size={12} />{task.assignedTo.name || 'Assigned'}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-gray-100 text-gray-600 flex items-center gap-1">
                                    <Calendar size={12} />{new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        {task.project && (
                            <p className="text-[10px] font-bold text-[#191a23]/40 uppercase tracking-wider">Project: {task.project.title || '---'}</p>
                        )}
                    </div>

                    {/* Subtasks Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-black text-[#191a23] uppercase tracking-widest">
                                Subtasks <span className="text-[#191a23]/40">({subtasks.length})</span>
                            </h4>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#453abc] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg transition-all active:scale-95"
                            >
                                <Plus size={14} /> Add Subtask
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-[#191a23]/40 font-medium italic">Loading subtasks...</div>
                        ) : subtasks.length === 0 && !showAddForm ? (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No subtasks yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {subtasks.map(st => (
                                    <div key={st._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                        <button onClick={() => handleStatusToggle(st)} className="mt-0.5 shrink-0 hover:scale-110 transition-transform">
                                            {statusIcon(st.status)}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold ${st.status === 'Completed' ? 'text-[#191a23]/40 line-through' : 'text-[#191a23]'}`}>
                                                {st.title}
                                            </p>
                                            {st.description && (
                                                <p className="text-xs text-[#191a23]/50 mt-0.5">{st.description}</p>
                                            )}
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black ${statusColors[st.status]}`}>
                                                {st.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(st._id)}
                                            className="p-1.5 text-[#191a23]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Subtask Form */}
                        {showAddForm && (
                            <form onSubmit={handleCreate} className="mt-4 p-4 bg-[#453abc]/5 border border-[#453abc]/20 rounded-2xl space-y-3">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Subtask title..."
                                    className="w-full bg-white border-2 border-transparent focus:border-[#453abc] rounded-xl py-3 px-4 text-sm text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    className="w-full bg-white border-2 border-transparent focus:border-[#453abc] rounded-xl py-3 px-4 text-sm text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                />
                                <div className="flex gap-2">
                                    <button type="submit"
                                        className="flex-1 py-3 bg-[#453abc] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                                        Create
                                    </button>
                                    <button type="button" onClick={() => setShowAddForm(false)}
                                        className="px-6 py-3 bg-gray-100 text-[#191a23] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
