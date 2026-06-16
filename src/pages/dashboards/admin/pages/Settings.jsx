import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    User,
    Lock,
    Bell,
    Shield,
    Save,
    Eye,
    EyeOff,
    Edit2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Settings = () => {
    const { user: currentUser } = useAuth();
    // Admin user state
    const [adminData, setAdminData] = useState({
        name: currentUser?.name || "Admin User",
        position: currentUser?.role || "Project Manager",
        email: currentUser?.email || "admin@techtide.io",
        password: "••••••••••••"
    });

    useEffect(() => {
        if (currentUser) {
            setAdminData({
                name: currentUser.name,
                position: currentUser.role,
                email: currentUser.email,
                password: "••••••••••••"
            });
        }
    }, [currentUser]);

    const [showPassword, setShowPassword] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (field, value) => {
        setAdminData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        setSaveMessage('Changes saved successfully!');
        setIsEditing(false);
        setTimeout(() => setSaveMessage(''), 3000);
    };

    return (
        <div className="space-y-8 pb-10 selection:bg-[#fa2742] selection:text-[#373833]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#373833] tracking-tight">Settings</h2>
                    <p className="text-[#373833]/60 font-medium text-sm">Manage your admin profile and security settings.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[20px] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-[#fa2742]/20 text-[#fa2742] rounded-xl flex items-center justify-center shadow-lg">
                                    <User size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#373833]">Admin Profile</h3>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 hover:bg-[#373833]/10 rounded-lg transition-all text-[#373833]/60 hover:text-[#373833]"
                                >
                                    <Edit2 size={20} />
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form className="space-y-5 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Admin Name</label>
                                    <input
                                        type="text"
                                        value={adminData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full bg-[#373833]/5 border-2 border-[#373833]/20 rounded-xl py-3 px-4 text-base text-[#373833] outline-none focus:ring-4 focus:ring-[#fa2742]/20 focus:border-[#fa2742] transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Position</label>
                                    <input
                                        type="text"
                                        value={adminData.position}
                                        onChange={(e) => handleInputChange('position', e.target.value)}
                                        className="w-full bg-[#373833]/5 border-2 border-[#373833]/20 rounded-xl py-3 px-4 text-base text-[#373833] outline-none focus:ring-4 focus:ring-[#fa2742]/20 focus:border-[#fa2742] transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Work Email</label>
                                    <input
                                        type="email"
                                        value={adminData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full bg-[#373833]/5 border-2 border-[#373833]/20 rounded-xl py-3 px-4 text-base text-[#373833] outline-none focus:ring-4 focus:ring-[#fa2742]/20 focus:border-[#fa2742] transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={adminData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            className="w-full bg-[#373833]/5 border-2 border-[#373833]/20 rounded-xl py-3 px-4 pr-12 text-base text-[#373833] outline-none focus:ring-4 focus:ring-[#fa2742]/20 focus:border-[#fa2742] transition-all font-bold"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#373833]/60 hover:text-[#373833] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="flex-1 px-6 py-3 bg-[#fa2742] text-[#373833] font-black rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                                    >
                                        <Save size={18} />
                                        <span>Save</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-6 py-3 bg-[#373833]/10 text-[#373833] font-black rounded-xl hover:bg-[#373833]/20 transition-all text-xs uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {saveMessage && (
                                    <p className="text-sm font-bold text-green-600">✓ {saveMessage}</p>
                                )}
                            </form>
                        ) : (
                            <div className="space-y-5 relative z-10">
                                <div>
                                    <p className="text-xs text-[#373833]/60 font-bold uppercase">Name</p>
                                    <p className="text-lg font-bold text-[#373833] mt-2">{adminData.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#373833]/60 font-bold uppercase">Position</p>
                                    <p className="text-lg font-bold text-[#373833] mt-2">{adminData.position}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#373833]/60 font-bold uppercase">Email</p>
                                    <p className="text-lg font-bold text-[#373833] mt-2">{adminData.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[20px] p-6 shadow-2xl border border-[#373833]/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fa2742]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                        <h4 className="text-xs font-black text-[#373833] uppercase tracking-[0.3em] mb-4 relative z-10">Recent Activity</h4>
                        <div className="space-y-3 relative z-10">
                            {[
                                { event: 'Profile Settings Updated', time: 'Today 3:15 PM', action: 'Profile' },
                                { event: 'Added New User - Sarah Dev', time: 'Today 2:45 PM', action: 'User Management' },
                                { event: 'Viewed Reports Dashboard', time: 'Today 1:30 PM', action: 'Reports' }
                            ].map((log, i) => (
                                <div key={i} className="p-3 bg-[#373833]/5 rounded-lg hover:bg-[#373833]/10 transition-all cursor-pointer border-l-4 border-[#fa2742]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-[#373833] text-xs">{log.event}</p>
                                            <p className="text-xs text-[#373833]/60 mt-1">{log.action}</p>
                                        </div>
                                        <span className="text-xs font-black text-[#fa2742] uppercase whitespace-nowrap ml-2">{log.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;


