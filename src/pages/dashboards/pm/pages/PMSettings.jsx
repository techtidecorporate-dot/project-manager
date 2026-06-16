import React, { useState, useEffect } from 'react';
import {
    User,
    Lock,
    Save,
    Eye,
    EyeOff,
    Edit2,
    Briefcase,
    Mail
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const PMSettings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || "Project Manager",
        position: user?.role || "Project Lead",
        email: user?.email || "pm@techtide.io",
        password: "••••••••••••"
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                position: user.role,
                email: user.email,
                password: "••••••••••••"
            });
        }
    }, [user]);

    const [showPassword, setShowPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSave = () => {
        setSaveMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSaveMessage(''), 3000);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-[#373833] tracking-tight">Profile Settings</h2>
                    <p className="text-[#373833]/60 font-medium text-sm">Manage your project manager profile.</p>
                </div>
            </div>

            <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-[#373833]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#fa2742]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-[#373833] rounded-3xl flex items-center justify-center text-[#fa2742] text-3xl font-black shadow-xl">
                                {formData.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#fa2742] p-2 rounded-xl text-[#373833] border-4 border-white">
                                <User size={20} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#373833]">{formData.name}</h3>
                            <p className="text-[#373833]/60 font-medium">{formData.position}</p>
                        </div>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-[#373833]/5 hover:bg-[#373833]/10 text-[#373833] px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2"
                        >
                            <Edit2 size={18} />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>

                <form className="space-y-6 relative z-10">
                    {/* Name */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#373833]/40" size={18} />
                                <input
                                    disabled={!isEditing}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#f5f5f5] disabled:opacity-60 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl py-3 pl-12 pr-4 text-[#373833] outline-none transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Position</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#373833]/40" size={18} />
                                <input
                                    disabled={!isEditing}
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full bg-[#f5f5f5] disabled:opacity-60 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl py-3 pl-12 pr-4 text-[#373833] outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Work Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#373833]/40" size={18} />
                            <input
                                disabled={!isEditing}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-[#f5f5f5] disabled:opacity-60 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl py-3 pl-12 pr-4 text-[#373833] outline-none transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#373833]/40" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                disabled={!isEditing}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-[#f5f5f5] disabled:opacity-60 border-2 border-transparent focus:bg-white focus:border-[#fa2742] rounded-xl py-3 pl-12 pr-12 text-[#373833] outline-none transition-all font-bold"
                            />
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#373833]/40 hover:text-[#373833]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="pt-6 flex gap-4">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex-1 py-4 bg-[#fa2742] text-[#373833] font-black rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setSaveMessage(''); }}
                                className="flex-1 py-4 bg-[#e8eae3] text-[#373833] font-black rounded-xl hover:bg-[#d8dad3] transition-all uppercase tracking-widest text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {saveMessage && (
                        <div className="p-4 bg-green-100 text-green-700 rounded-xl font-bold text-center animate-in fade-in slide-in-from-bottom-2">
                            {saveMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PMSettings;
