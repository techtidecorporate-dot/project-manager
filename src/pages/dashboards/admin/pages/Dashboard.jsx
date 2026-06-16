import React, { useState, useEffect } from 'react';
import { ChevronRight, Briefcase, Activity, Users, FolderKanban } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState([
        { label: 'Active Projects', value: 0, icon: FolderKanban },
        { label: 'In Progress', value: 0, icon: Activity },
        { label: 'Team Members', value: 0, icon: Users },
    ]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        if (user) {
            fetchDashboardData(controller.signal);
        }
        return () => controller.abort();
    }, [user]);

    const fetchDashboardData = async (signal) => {
        try {
            const [projRes, userRes] = await Promise.all([
                fetch('http://localhost:5000/api/projects', {
                    signal,
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }),
                fetch('http://localhost:5000/api/auth/users', {
                    signal,
                    headers: { 'Authorization': `Bearer ${user.token}` }
                })
            ]);

            if (projRes.status === 401 || userRes.status === 401) {
                logout();
                return;
            }

            const projects = await projRes.json();
            const users = await userRes.json();

            if (projRes.ok && userRes.ok) {
                setStats([
                    { label: 'Active Projects', value: projects.length, icon: FolderKanban },
                    { label: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length, icon: Activity },
                    { label: 'Team Members', value: users.length, icon: Users },
                ]);
                setRecentProjects(projects.slice(0, 3));
            }
            setLoading(false);
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fa2742]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 selection:bg-white selection:text-[#373833]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-[#373833] tracking-tight">Dashboard Overview</h2>
                    <p className="text-[#373833]/60 font-bold text-sm">Real-time updates for your projects.</p>
                </div>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                        <div key={idx} className="bg-white p-8 rounded-[32px] shadow-sm border border-[#373833]/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Icon size={80} />
                            </div>
                            <p className="text-[10px] text-[#373833]/40 uppercase tracking-[0.2em] font-black">{s.label}</p>
                            <h3 className="text-4xl font-black text-[#373833] mt-4">{s.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Recent Projects */}
                <div className="w-full lg:w-[65%] bg-white rounded-[32px] p-8 shadow-sm border border-[#373833]/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-xl font-black text-[#373833]">Recent Projects</h4>
                            <p className="text-sm text-[#373833]/40 font-bold">Most recent projects</p>
                        </div>
                        <Link to="/admin/projects" className="px-5 py-2.5 bg-[#fa2742] text-[#373833] rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg transition-all">
                            View All Projects
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentProjects.length > 0 ? recentProjects.map((p, i) => (
                            <div key={i} className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-transparent hover:border-[#fa2742]/20 group/item">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Briefcase size={20} className="text-[#fa2742]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#373833]">{p.title}</p>
                                            <p className="text-[10px] text-[#373833]/50 font-bold uppercase tracking-wider">{p.client}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter
                                            ${p.status === 'Planning' ? 'bg-blue-100 text-blue-700' :
                                                p.status === 'In Progress' ? 'bg-[#fa2742]/10 text-[#fa2742]' :
                                                    p.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black text-[#373833]/30 uppercase tracking-[0.2em]">
                                        <span>Build Status</span>
                                        <span>{p.progress}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-[#373833]/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#fa2742] transition-all duration-700"
                                            style={{ width: `${p.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-[#373833]/40 font-bold italic">No active projects detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Widget */}
                <div className="w-full lg:w-[35%] bg-[#373833] rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#fa2742] rounded-full -mr-16 -mt-16 blur-3xl opacity-20" />

                    <div className="flex items-center space-x-5">
                        <div className="relative">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name}&background=fa2742&color=373833&size=128&bold=true`}
                                alt={user?.name}
                                className="w-20 h-20 rounded-[24px] border-4 border-white/10 shadow-xl object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#fa2742] rounded-full border-4 border-[#373833] flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-black text-white leading-tight">{user?.name || 'System Admin'}</p>
                            <p className="text-xs text-white/40 font-black uppercase tracking-widest mt-1">Authorized {user?.role || 'Admin'}</p>
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-white/50 font-medium leading-relaxed">
                            You are logged in as an Admin. You have full access to manage users and projects.
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                        <span>Environment</span>
                        <span className="text-[#fa2742]">Production</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
