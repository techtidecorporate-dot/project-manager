import React, { useState, useEffect } from 'react';
import { useAuth, ROLES } from '@/context/AuthContext';
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    Save,
    X,
    Users,
    Search,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

const Permissions = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const roles = ['ADMIN', 'CLIENT', 'PM', 'DEVELOPER', 'SQA'];
    const roleColors = {
        ADMIN: { bg: 'bg-red-500/20', text: 'text-red-600', icon: ShieldAlert },
        CLIENT: { bg: 'bg-cyan-500/20', text: 'text-cyan-600', icon: Shield },
        PM: { bg: 'bg-amber-500/20', text: 'text-amber-600', icon: ShieldCheck },
        DEVELOPER: { bg: 'bg-[#453abc]/20', text: 'text-[#453abc]', icon: Shield },
        SQA: { bg: 'bg-green-500/20', text: 'text-green-600', icon: ShieldCheck }
    };

    useEffect(() => {
        if (currentUser) fetchUsers();
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/auth/users', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            setSaving(userId);
            setMessage({ type: '', text: '' });

            const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
                setMessage({ type: 'success', text: 'Role updated successfully!' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Failed to update role' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating role' });
        } finally {
            setSaving(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Role Management</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Manage user roles and access permissions across the system.</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-[#453abc]/10 text-[#453abc] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#453abc]/20 transition-all flex items-center gap-2"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {message.text && (
                <div className={`px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Role Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {roles.map(role => {
                    const count = users.filter(u => u.role === role).length;
                    const Icon = roleColors[role]?.icon || Shield;
                    return (
                        <div key={role} className={`p-4 rounded-2xl ${roleColors[role]?.bg || 'bg-gray-100'} text-center`}>
                            <Icon size={24} className={`mx-auto mb-2 ${roleColors[role]?.text || 'text-gray-600'}`} />
                            <p className="text-2xl font-black text-[#191a23]">{count}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#191a23]/60 mt-1">{role}</p>
                        </div>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/20" size={18} />
                <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] transition-all font-bold placeholder:text-[#191a23]/20"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[20px] shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">User</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Email</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Current Role</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Change Role</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length > 0 ? filteredUsers.map((u) => {
                                const RoleIcon = roleColors[u.role]?.icon || Shield;
                                return (
                                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#191a23]/10 rounded-xl flex items-center justify-center font-black text-sm">
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-[#191a23]">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-[#191a23]/60 font-medium">{u.email}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black ${roleColors[u.role]?.bg || 'bg-gray-100'} ${roleColors[u.role]?.text || 'text-gray-600'}`}>
                                                <RoleIcon size={12} />
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <select
                                                defaultValue={u.role}
                                                onChange={(e) => {
                                                    if (e.target.value !== u.role) {
                                                        handleRoleChange(u._id, e.target.value);
                                                    }
                                                }}
                                                className="bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-[#191a23] outline-none focus:border-[#453abc] transition-all cursor-pointer"
                                                disabled={saving === u._id}
                                            >
                                                {roles.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {saving === u._id ? (
                                                <div className="inline-flex items-center gap-2 text-[#453abc] text-xs font-black">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#453abc]" />
                                                    Saving...
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[#191a23]/20 font-medium italic">Select role above</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-[#191a23]/30 italic font-bold uppercase tracking-widest text-xs">
                                        {searchQuery ? 'No users match your search' : 'No users found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Permission Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-[#453abc]/10">
                    <ShieldAlert size={24} className="text-red-500 mb-3" />
                    <h4 className="font-bold text-[#191a23] mb-1">Admin</h4>
                    <p className="text-xs text-[#191a23]/60">Full system access. Can manage users, projects, settings, and all configurations.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-amber-500/10">
                    <ShieldCheck size={24} className="text-amber-500 mb-3" />
                    <h4 className="font-bold text-[#191a23] mb-1">Project Manager</h4>
                    <p className="text-xs text-[#191a23]/60">Can create and manage projects, assign tasks, view reports, and communicate with clients.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-green-500/10">
                    <ShieldCheck size={24} className="text-green-500 mb-3" />
                    <h4 className="font-bold text-[#191a23] mb-1">Developer / SQA</h4>
                    <p className="text-xs text-[#191a23]/60">Can view assigned tasks, update progress, clock attendance, and view personal scores.</p>
                </div>
            </div>
        </div>
    );
};

export default Permissions;
