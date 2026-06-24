import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, Plus, X, Edit2, Check } from 'lucide-react';
import { useAuth, ROLES } from '@/context/AuthContext';

const AddUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'DEVELOPER',
        companyName: '',
        position: '',
    });

    const roles = ['ADMIN', 'CLIENT', 'PM', 'DEVELOPER', 'SQA'];

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/users', {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingUser
            ? `http://localhost:5000/api/auth/users/${editingUser._id}`
            : 'http://localhost:5000/api/auth/register';
        const method = editingUser ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                fetchUsers();
                handleCloseModal();
            } else {
                alert(data.message || 'Action failed');
            }
        } catch (error) {
            console.error('Error submitting user:', error);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/auth/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const togglePasswordVisibility = (id) => {
        setShowPassword(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Keep empty for security during edit
                role: user.role,
                companyName: user.companyName || '',
                position: user.position || '',
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'DEVELOPER',
                companyName: '',
                position: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 selection:bg-white selection:text-[#191a23]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">User Management</h2>
                    <p className="text-[#191a23]/60 font-medium text-xs">Manage, edit, and add users to the system</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-br from-[#453abc] to-[#60c3e3]  text-white px-6 py-3 rounded-xl font-black text-sm inline-flex items-center space-x-2 hover:shadow-lg transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add User</span>
                </button>
            </div>

            {/* Users List */}
            {users.length > 0 && (
                <div className="bg-white rounded-[20px] p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-[#191a23] mb-6">System Users</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-[#191a23]/10">
                                    <th className="text-left py-4 px-4 font-bold text-[#191a23] text-sm">Name</th>
                                    <th className="text-left py-4 px-4 font-bold text-[#191a23] text-sm">Email</th>
                                    <th className="text-left py-4 px-4 font-bold text-[#191a23] text-sm">Role</th>
                                    <th className="text-left py-4 px-4 font-bold text-[#191a23] text-sm">Company/Detail</th>
                                    <th className="text-left py-4 px-4 font-bold text-[#191a23] text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="border-b border-[#191a23]/10 hover:bg-[#191a23]/5 transition-colors">
                                        <td className="py-4 px-4 text-sm text-[#191a23] font-semibold">{user.name}</td>
                                        <td className="py-4 px-4 text-sm text-[#191a23]/70">{user.email}</td>
                                        <td className="py-4 px-4">
                                            <span className="inline-block px-3 py-1 bg-[#453abc]/10 text-[#453abc] rounded-lg text-xs font-bold capitalize">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-[#191a23]/60 italic font-medium">
                                            {user.role === 'CLIENT' ? (user.companyName || 'â€”') : (user.position || 'â€”')}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="text-[#191a23]/60 hover:text-blue-500 transition-colors p-2 hover:bg-blue-500/10 rounded-lg"
                                                    title="Edit user"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="text-[#191a23]/60 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-[#191a23]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-4 md:p-6 lg:p-8 shadow-2xl max-w-[95vw] md:max-w-2xl w-full animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#191a23] tracking-tight">
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="w-10 h-10 bg-[#ffffff] rounded-full flex items-center justify-center hover:bg-[#ffffff]/70 transition-colors"
                            >
                                <X size={20} className="text-[#191a23]" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Full Name"
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Work Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email Address"
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">
                                        {editingUser ? 'New Password (Optional)' : 'Security Password'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="********"
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold"
                                        required={!editingUser}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Access Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold capitalize"
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.role === 'CLIENT' ? (
                                    <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            placeholder="Client's Company"
                                            className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Level / Position</label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Senior Backend Dev"
                                            className="w-full bg-[#f5f5f5] border-2 border-transparent focus:bg-white focus:border-[#453abc] rounded-xl py-3 px-4 text-[#191a23] outline-none transition-all font-bold"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="w-full sm:flex-1 bg-[#453abc] text-[#191a23] py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    {editingUser ? <Check size={18} /> : <Plus size={18} />}
                                    <span>{editingUser ? 'Save Changes' : 'Execute Creation'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="w-full sm:w-auto px-8 bg-[#191a23]/10 text-[#191a23] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#191a23]/20 transition-all active:scale-95"
                                >
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

export default AddUsers;

