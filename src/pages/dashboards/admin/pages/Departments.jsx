import React, { useState, useEffect } from 'react';
import {
    Building2, Plus, Search, X, Trash2, Edit3, Users, Globe
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Departments = () => {
    const { user: currentUser } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [newDepartment, setNewDepartment] = useState({
        name: '', description: '', workspace: '', head: '', members: []
    });

    useEffect(() => {
        if (currentUser) {
            fetchDepartments();
            fetchWorkspaces();
            fetchUsers();
        }
    }, [currentUser]);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/departments', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) setDepartments(data);
        } catch (err) {
            console.error('Error fetching departments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaces = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/workspaces', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) setWorkspaces(data);
        } catch (err) {
            console.error('Error fetching workspaces:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/users', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) setAllUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleCreate = async () => {
        if (!newDepartment.name || !newDepartment.workspace) return;
        try {
            const res = await fetch('http://localhost:5000/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(newDepartment),
            });
            if (res.ok) {
                fetchDepartments();
                setNewDepartment({ name: '', description: '', workspace: '', head: '', members: [] });
                setIsAddModalOpen(false);
            }
        } catch (err) {
            console.error('Error creating department:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this department? Projects linked to it will be unlinked.')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/departments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.ok) fetchDepartments();
        } catch (err) {
            console.error('Error deleting department:', err);
        }
    };

    const handleEdit = (dept) => {
        setEditingDept({
            ...dept,
            head: dept.head?._id || '',
            workspace: dept.workspace?._id || '',
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingDept.name) return;
        try {
            const res = await fetch(`http://localhost:5000/api/departments/${editingDept._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    name: editingDept.name,
                    description: editingDept.description,
                    head: editingDept.head,
                }),
            });
            if (res.ok) {
                fetchDepartments();
                setIsEditModalOpen(false);
                setEditingDept(null);
            }
        } catch (err) {
            console.error('Error updating department:', err);
        }
    };

    const filtered = departments.filter(d =>
        d.name?.toLowerCase().includes(query.toLowerCase()) ||
        d.workspace?.name?.toLowerCase().includes(query.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Departments</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Organize projects into departments within workspaces.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-br from-[#453abc] to-[#60c3e3] text-white font-black rounded-xl shadow-lg flex items-center space-x-2 text-sm hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Create Department</span>
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/40" size={20} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder="Search by name or workspace..."
                    className="w-full bg-white border border-[#191a23]/10 rounded-2xl py-4 pl-12 pr-6 text-[#191a23] outline-none focus:ring-2 focus:ring-[#453abc]/20 transition-all font-bold shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((dept) => (
                    <div
                        key={dept._id}
                        className="bg-white p-6 rounded-[24px] shadow-sm border border-[#191a23]/5 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#60c3e3] transition-all group-hover:w-2" />
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-[#60c3e3]/10 rounded-xl">
                                    <Building2 className="text-[#60c3e3]" size={24} />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(dept)}
                                        className="p-2 text-[#191a23]/20 hover:text-[#453abc] hover:bg-[#453abc]/10 rounded-lg transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept._id)}
                                        className="p-2 text-[#191a23]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#191a23] leading-tight">{dept.name}</h3>
                                <p className="text-sm text-[#191a23]/60 mt-1">{dept.description || 'No description'}</p>
                            </div>
                            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-2 text-xs font-bold text-[#191a23]/40">
                                    <Globe size={14} />
                                    <span>{dept.workspace?.name || 'No workspace'}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs font-bold text-[#191a23]/40">
                                    <Users size={14} />
                                    <span>Head: {dept.head?.name || 'Not assigned'}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs font-bold text-[#191a23]/40">
                                    <Users size={14} />
                                    <span>{dept.members?.length || 0} members</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191a23]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 w-full max-w-[95vw] md:max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-[#191a23] tracking-tight">New Department</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-[#ffffff] rounded-full flex items-center justify-center hover:bg-[#ffffff]/70 transition-colors">
                                <X size={24} className="text-[#191a23]" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Department Name</label>
                                <input
                                    type="text"
                                    value={newDepartment.name}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                                    placeholder="e.g. Web Development"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Workspace</label>
                                <select
                                    value={newDepartment.workspace}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, workspace: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold"
                                >
                                    <option value="">Select workspace...</option>
                                    {workspaces.map(ws => (
                                        <option key={ws._id} value={ws._id}>{ws.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={newDepartment.description}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                                    placeholder="Describe this department..."
                                    rows={3}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20 resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Department Head</label>
                                <select
                                    value={newDepartment.head}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, head: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold"
                                >
                                    <option value="">Select head...</option>
                                    {allUsers.filter(u => u.role === 'PM' || u.role === 'ADMIN').map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleCreate}
                                className="w-full py-5 bg-[#453abc] text-white font-black rounded-2xl hover:shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest mt-6 shadow-lg"
                            >
                                Create Department
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191a23]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 w-full max-w-[95vw] md:max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-[#191a23] tracking-tight">Edit Department</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 bg-[#ffffff] rounded-full flex items-center justify-center hover:bg-[#ffffff]/70 transition-colors">
                                <X size={24} className="text-[#191a23]" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Department Name</label>
                                <input
                                    type="text"
                                    value={editingDept.name}
                                    onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={editingDept.description}
                                    onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Department Head</label>
                                <select
                                    value={editingDept.head}
                                    onChange={(e) => setEditingDept({ ...editingDept, head: e.target.value })}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold"
                                >
                                    <option value="">Select head...</option>
                                    {allUsers.filter(u => u.role === 'PM' || u.role === 'ADMIN').map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleUpdate}
                                className="w-full py-5 bg-[#453abc] text-white font-black rounded-2xl hover:shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest mt-6 shadow-lg"
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

export default Departments;
