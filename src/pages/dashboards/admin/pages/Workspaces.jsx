import React, { useState, useEffect } from 'react';
import {
    Building2, Plus, Search, X, Trash2, ChevronDown, ChevronRight,
    Users, Globe, Edit3, UserPlus, UserMinus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Workspaces = () => {
    const { user: currentUser } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });
    const [allUsers, setAllUsers] = useState([]);
    const [showAddMember, setShowAddMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedRole, setSelectedRole] = useState('DEVELOPER');

    useEffect(() => {
        if (currentUser) {
            fetchWorkspaces();
            fetchUsers();
        }
    }, [currentUser]);

    const fetchWorkspaces = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/workspaces', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) setWorkspaces(data);
        } catch (err) {
            console.error('Error fetching workspaces:', err);
        } finally {
            setLoading(false);
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
        if (!newWorkspace.name) return;
        try {
            const res = await fetch('http://localhost:5000/api/workspaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(newWorkspace),
            });
            if (res.ok) {
                fetchWorkspaces();
                setNewWorkspace({ name: '', description: '' });
                setIsAddModalOpen(false);
            }
        } catch (err) {
            console.error('Error creating workspace:', err);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Delete this workspace? All departments and projects within will be removed.')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/workspaces/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.ok) fetchWorkspaces();
        } catch (err) {
            console.error('Error deleting workspace:', err);
        }
    };

    const handleAddMember = async (workspaceId) => {
        if (!selectedMember) return;
        try {
            const res = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ userId: selectedMember, role: selectedRole }),
            });
            if (res.ok) {
                fetchWorkspaces();
                setShowAddMember(null);
                setSelectedMember('');
            }
        } catch (err) {
            console.error('Error adding member:', err);
        }
    };

    const handleRemoveMember = async (workspaceId, userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/members/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.ok) fetchWorkspaces();
        } catch (err) {
            console.error('Error removing member:', err);
        }
    };

    const handleCardClick = (wsId) => {
        setExpandedId(prev => prev === wsId ? null : wsId);
    };

    const nonMemberUsers = (workspace) => {
        const memberIds = workspace.members?.map(m => m.user?._id || m.user) || [];
        return allUsers.filter(u => !memberIds.includes(u._id));
    };

    const filtered = workspaces.filter(w =>
        w.name?.toLowerCase().includes(query.toLowerCase())
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
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Workspaces</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Manage your organizational workspaces.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-br from-[#453abc] to-[#60c3e3] text-white font-black rounded-xl shadow-lg flex items-center space-x-2 text-sm hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Create Workspace</span>
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/40" size={20} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder="Search workspaces..."
                    className="w-full bg-white border border-[#191a23]/10 rounded-2xl py-4 pl-12 pr-6 text-[#191a23] outline-none focus:ring-2 focus:ring-[#453abc]/20 transition-all font-bold shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((ws) => (
                    <div
                        key={ws._id}
                        className="bg-white p-6 rounded-[24px] shadow-sm border border-[#191a23]/5 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => handleCardClick(ws._id)}
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#453abc] transition-all group-hover:w-2" />
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-[#453abc]/10 rounded-xl">
                                    <Building2 className="text-[#453abc]" size={24} />
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, ws._id)}
                                    className="p-2 text-[#191a23]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#191a23] leading-tight">{ws.name}</h3>
                                <p className="text-sm text-[#191a23]/60 mt-1">{ws.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-xs font-bold text-[#191a23]/40">
                                <Users size={14} />
                                <span>{ws.members?.length || 0} members</span>
                            </div>
                        </div>

                        {expandedId === ws._id && (
                            <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black text-[#191a23] uppercase tracking-widest">Members</h4>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowAddMember(showAddMember === ws._id ? null : ws._id); }}
                                        className="text-[#453abc] text-xs font-black uppercase tracking-wider flex items-center gap-1"
                                    >
                                        <UserPlus size={14} /> Add
                                    </button>
                                </div>

                                {showAddMember === ws._id && (
                                    <div className="mb-4 p-3 bg-[#453abc]/5 rounded-xl space-y-2" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={selectedMember}
                                            onChange={(e) => setSelectedMember(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                                        >
                                            <option value="">Select user...</option>
                                            {nonMemberUsers(ws).map(u => (
                                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                            ))}
                                        </select>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                                        >
                                            <option value="ADMIN">Admin</option>
                                            <option value="PM">PM</option>
                                            <option value="DEVELOPER">Developer</option>
                                            <option value="SQA">SQA</option>
                                            <option value="CLIENT">Client</option>
                                        </select>
                                        <button
                                            onClick={() => handleAddMember(ws._id)}
                                            className="w-full py-2 bg-[#453abc] text-white font-black rounded-xl text-xs uppercase tracking-wider"
                                        >
                                            Add Member
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {ws.members?.map((m, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-[#453abc]/10 rounded-lg flex items-center justify-center">
                                                    <Users size={14} className="text-[#453abc]" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#191a23]">
                                                        {m.user?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-[10px] text-[#191a23]/40 font-medium uppercase">
                                                        {m.role}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveMember(ws._id, m.user?._id); }}
                                                className="p-1.5 text-[#191a23]/20 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <UserMinus size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191a23]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 w-full max-w-[95vw] md:max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-[#191a23] tracking-tight">New Workspace</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-[#ffffff] rounded-full flex items-center justify-center hover:bg-[#ffffff]/70 transition-colors">
                                <X size={24} className="text-[#191a23]" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Workspace Name</label>
                                <input
                                    type="text"
                                    value={newWorkspace.name}
                                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                                    placeholder="e.g. TechTide"
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={newWorkspace.description}
                                    onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                                    placeholder="Describe your workspace..."
                                    rows={3}
                                    className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-2xl py-4 px-6 text-[#191a23] outline-none transition-all font-bold placeholder:text-[#191a23]/20 resize-none"
                                />
                            </div>
                            <button
                                onClick={handleCreate}
                                className="w-full py-5 bg-[#453abc] text-white font-black rounded-2xl hover:shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest mt-6 shadow-lg"
                            >
                                Create Workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workspaces;
