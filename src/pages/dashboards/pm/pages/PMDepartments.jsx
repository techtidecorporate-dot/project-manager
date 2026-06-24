import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building2, Plus, X, Search, Users } from 'lucide-react';

const PMDepartments = () => {
    const { user: currentUser } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (currentUser) fetchDepartments();
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

    const filtered = departments.filter(d =>
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.workspace?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Departments</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">View departments and their projects.</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/20" size={18} />
                <input type="text" placeholder="Search departments..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] transition-all font-bold placeholder:text-[#191a23]/20" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((dept) => (
                    <div key={dept._id} className="bg-white rounded-[24px] p-6 shadow-xl border border-[#191a23]/5 hover:border-[#453abc]/20 transition-all">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-[#60c3e3]/10 rounded-2xl flex items-center justify-center">
                                <Building2 size={24} className="text-[#60c3e3]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-[#191a23]">{dept.name}</h3>
                                <p className="text-xs text-[#191a23]/50 font-medium">{dept.workspace?.name || 'No workspace'}</p>
                            </div>
                        </div>

                        {dept.description && (
                            <p className="text-xs text-[#191a23]/50 italic mb-4">{dept.description}</p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-[#191a23]/50 font-bold pt-4 border-t border-gray-100">
                            <span className="flex items-center gap-1">
                                <Users size={12} />
                                {dept.members?.length || 0} members
                            </span>
                            <span className="text-[#60c3e3]">
                                Head: {dept.head?.name || 'N/A'}
                            </span>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <Building2 size={40} className="mx-auto text-[#191a23]/20 mb-4" />
                        <p className="text-[#191a23]/30 font-black uppercase tracking-widest text-xs">No departments found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PMDepartments;
