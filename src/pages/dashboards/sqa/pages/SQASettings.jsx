import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { User, Mail, Shield, Lock, Bug } from 'lucide-react';

const SQASettings = () => {
    const { user } = useAuth();

    // Default values if user context is missing
    const userData = {
        name: user?.name || 'Sarah Tester',
        position: user?.role || 'QA Lead',
        email: user?.email || 'sarah.qa@techtide.com',
        password: '••••••••••••'
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-[#373833] mb-8">QA Profile Settings</h1>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-6 mb-8 border-b border-gray-100 pb-8">
                    <img
                        src={`https://ui-avatars.com/api/?name=${userData.name}&background=fa2742&color=fff&size=128`}
                        alt={userData.name}
                        className="w-24 h-24 rounded-full border-4 border-[#e8eae3] shadow-lg"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-[#373833]">{userData.name}</h2>
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Bug size={16} />
                            <span>{userData.position}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-bold text-[#373833] mb-2 flex items-center gap-2">
                            <User size={16} className="text-[#fa2742]" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={userData.name}
                            readOnly
                            className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    {/* Position Field */}
                    <div>
                        <label className="block text-sm font-bold text-[#373833] mb-2 flex items-center gap-2">
                            <Shield size={16} className="text-[#fa2742]" />
                            Position
                        </label>
                        <input
                            type="text"
                            value={userData.position}
                            readOnly
                            className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    {/* Work Email Field */}
                    <div>
                        <label className="block text-sm font-bold text-[#373833] mb-2 flex items-center gap-2">
                            <Mail size={16} className="text-[#fa2742]" />
                            Work Email
                        </label>
                        <input
                            type="email"
                            value={userData.email}
                            readOnly
                            className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-bold text-[#373833] mb-2 flex items-center gap-2">
                            <Lock size={16} className="text-[#fa2742]" />
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={userData.password}
                                readOnly
                                className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 italic">
                            * Contact administrator to request changes to your profile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SQASettings;
