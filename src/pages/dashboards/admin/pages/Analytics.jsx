import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    BarChart3,
    TrendingUp,
    Users,
    FolderKanban,
    DollarSign,
    Activity,
    Award,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

const Analytics = () => {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        projects: [],
        users: [],
        attendance: [],
        invoices: [],
        scores: []
    });

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${currentUser.token}` };

            const [projRes, userRes, attRes, invRes, scoreRes] = await Promise.all([
                fetch('http://localhost:5000/api/projects', { headers }),
                fetch('http://localhost:5000/api/auth/users', { headers }),
                fetch('http://localhost:5000/api/attendance/all', { headers }),
                fetch('http://localhost:5000/api/invoices', { headers }),
                fetch('http://localhost:5000/api/scores/all', { headers })
            ]);

            const [projects, users, attendance, invoices, scores] = await Promise.all([
                projRes.json(), userRes.json(), attRes.json(), invRes.json(), scoreRes.json()
            ]);

            setData({ projects, users, attendance, invoices, scores });
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived stats
    const totalProjects = data.projects.length;
    const completedProjects = data.projects.filter(p => p.status === 'Completed').length;
    const inProgressProjects = data.projects.filter(p => p.status === 'In Progress').length;
    const planningProjects = data.projects.filter(p => p.status === 'Planning').length;

    const totalUsers = data.users.length;
    const roleCounts = data.users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
    }, {});

    const totalInvoices = data.invoices.length;
    const paidInvoices = data.invoices.filter(i => i.status === 'Paid').length;
    const unpaidInvoices = data.invoices.filter(i => i.status === 'Unpaid').length;
    const totalRevenue = data.invoices
        .filter(i => i.status === 'Paid')
        .reduce((sum, i) => sum + (i.amount || 0), 0);

    const avgScore = data.scores.length > 0
        ? (data.scores.reduce((sum, s) => sum + (s.totalPoints || 0), 0) / data.scores.length).toFixed(1)
        : '0';

    const topPerformer = data.scores.length > 0
        ? data.scores.reduce((best, curr) => (curr.totalPoints || 0) > (best.totalPoints || 0) ? curr : best, data.scores[0])
        : null;

    const projectStatusColors = { Planning: '#60a5fa', 'In Progress': '#453abc', Completed: '#22c55e' };
    const roles = ['ADMIN', 'PM', 'DEVELOPER', 'SQA', 'CLIENT'];
    const roleColors = { ADMIN: '#ef4444', PM: '#f59e0b', DEVELOPER: '#453abc', SQA: '#22c55e', CLIENT: '#06b6d4' };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 selection:bg-[#453abc] selection:text-white">
            <div>
                <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Analytics</h2>
                <p className="text-[#191a23]/60 font-medium text-sm">Comprehensive analytics and insights across your organization.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <FolderKanban size={24} className="text-blue-500" />
                        </div>
                        <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">{totalProjects}</span>
                    </div>
                    <p className="text-xs text-[#191a23]/60 font-black uppercase tracking-widest">Total Projects</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-black text-[#191a23]">{totalProjects}</span>
                        <span className="text-xs text-green-600 flex items-center">
                            <ArrowUp size={12} /> {completedProjects} done
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#453abc]/20 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-[#453abc]" />
                        </div>
                        <span className="text-xs font-black text-[#453abc] bg-[#453abc]/10 px-2 py-1 rounded-lg">{totalUsers}</span>
                    </div>
                    <p className="text-xs text-[#191a23]/60 font-black uppercase tracking-widest">Team Members</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-black text-[#191a23]">{totalUsers}</span>
                        <span className="text-xs text-[#191a23]/40">Across 5 roles</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <DollarSign size={24} className="text-green-500" />
                        </div>
                        <span className="text-xs font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">{paidInvoices}/{totalInvoices}</span>
                    </div>
                    <p className="text-xs text-[#191a23]/60 font-black uppercase tracking-widest">Revenue</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-black text-[#191a23]">${totalRevenue.toLocaleString()}</span>
                        <span className="text-xs text-green-600 flex items-center"><ArrowUp size={12} /> Paid</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Award size={24} className="text-amber-500" />
                        </div>
                        <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">{avgScore}</span>
                    </div>
                    <p className="text-xs text-[#191a23]/60 font-black uppercase tracking-widest">Avg Score</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-black text-[#191a23] truncate">{topPerformer?.name || '---'}</span>
                        <span className="text-xs text-green-600 flex items-center"><ArrowUp size={12} /> Top</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Status Distribution - Donut Chart */}
                <div className="bg-white rounded-[20px] p-8 shadow-2xl">
                    <h3 className="text-lg font-bold text-[#191a23] mb-6">Project Status Distribution</h3>
                    {totalProjects > 0 ? (
                        <div className="flex items-center gap-8">
                            <div className="relative w-48 h-48">
                                <svg viewBox="0 0 36 36" className="w-48 h-48 -rotate-90">
                                    {(() => {
                                        const segments = [
                                            { label: 'Planning', value: planningProjects, color: '#60a5fa' },
                                            { label: 'In Progress', value: inProgressProjects, color: '#453abc' },
                                            { label: 'Completed', value: completedProjects, color: '#22c55e' }
                                        ].filter(s => s.value > 0);
                                        const total = segments.reduce((s, seg) => s + seg.value, 0);
                                        let offset = 0;
                                        return segments.map((seg, i) => {
                                            const pct = seg.value / total;
                                            const dashLen = pct * 100;
                                            const dashOffset = -offset;
                                            offset += dashLen;
                                            return (
                                                <circle
                                                    key={i}
                                                    cx="18" cy="18" r="15.915"
                                                    fill="none"
                                                    stroke={seg.color}
                                                    strokeWidth="3"
                                                    strokeDasharray={`${dashLen} ${100 - dashLen}`}
                                                    strokeDashoffset={dashOffset}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-700"
                                                />
                                            );
                                        });
                                    })()}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-[#191a23]">{totalProjects}</p>
                                        <p className="text-[10px] text-[#191a23]/40 font-black uppercase tracking-widest">Total</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Planning', value: planningProjects, color: '#60a5fa' },
                                    { label: 'In Progress', value: inProgressProjects, color: '#453abc' },
                                    { label: 'Completed', value: completedProjects, color: '#22c55e' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm font-bold text-[#191a23]">{item.label}</span>
                                        <span className="text-sm font-black text-[#191a23]/60 ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[#191a23]/40 italic font-medium">No project data available</div>
                    )}
                </div>

                {/* User Role Distribution - Bar Chart */}
                <div className="bg-white rounded-[20px] p-8 shadow-2xl">
                    <h3 className="text-lg font-bold text-[#191a23] mb-6">Team Composition</h3>
                    {totalUsers > 0 ? (
                        <div className="space-y-4">
                            {roles.map(role => {
                                const count = roleCounts[role] || 0;
                                const maxCount = Math.max(...roles.map(r => roleCounts[r] || 0), 1);
                                const pct = (count / maxCount) * 100;
                                return (
                                    <div key={role}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-[#191a23] uppercase tracking-wider">{role}</span>
                                            <span className="text-xs font-black text-[#191a23]/60">{count}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%`, backgroundColor: roleColors[role] || '#453abc' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[#191a23]/40 italic font-medium">No user data available</div>
                    )}
                </div>

                {/* Invoice Status */}
                <div className="bg-white rounded-[20px] p-8 shadow-2xl">
                    <h3 className="text-lg font-bold text-[#191a23] mb-6">Invoice Overview</h3>
                    {totalInvoices > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Paid', value: paidInvoices, color: '#22c55e', pct: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0 },
                                { label: 'Unpaid', value: unpaidInvoices, color: '#f59e0b', pct: totalInvoices > 0 ? (unpaidInvoices / totalInvoices) * 100 : 0 },
                                { label: 'Overdue', value: data.invoices.filter(i => i.status === 'Overdue').length, color: '#ef4444', pct: totalInvoices > 0 ? (data.invoices.filter(i => i.status === 'Overdue').length / totalInvoices) * 100 : 0 },
                                { label: 'Sent', value: data.invoices.filter(i => i.status === 'Sent').length, color: '#453abc', pct: totalInvoices > 0 ? (data.invoices.filter(i => i.status === 'Sent').length / totalInvoices) * 100 : 0 }
                            ].map((item, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#191a23]">{item.label}</span>
                                        <span className="text-lg font-black text-[#191a23]">{item.value}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                                    </div>
                                    <p className="text-[10px] text-[#191a23]/40 font-bold mt-1">{item.pct.toFixed(0)}% of total</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[#191a23]/40 italic font-medium">No invoice data available</div>
                    )}
                </div>

                {/* Score Distribution */}
                <div className="bg-white rounded-[20px] p-8 shadow-2xl">
                    <h3 className="text-lg font-bold text-[#191a23] mb-6">Performance Scores</h3>
                    {data.scores.length > 0 ? (
                        <div className="space-y-3">
                            {data.scores.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, 8).map((s, i) => (
                                <div key={s._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <span className="w-6 text-center text-xs font-black text-[#191a23]/40">#{i + 1}</span>
                                    <div className="w-8 h-8 bg-[#191a23]/10 rounded-lg flex items-center justify-center text-xs font-black">
                                        {s.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#191a23] truncate">{s.name}</p>
                                        <p className="text-[10px] text-[#191a23]/40 font-bold uppercase">{s.role}</p>
                                    </div>
                                    <span className={`text-sm font-black px-2 py-1 rounded ${(s.totalPoints || 0) >= 20 ? 'bg-green-500/20 text-green-600' : (s.totalPoints || 0) >= 0 ? 'bg-yellow-500/20 text-yellow-600' : 'bg-red-500/20 text-red-600'}`}>
                                        {(s.totalPoints || 0) > 0 ? '+' : ''}{s.totalPoints || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[#191a23]/40 italic font-medium">No score data available</div>
                    )}
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#453abc] to-[#60c3e3] rounded-[20px] p-8 shadow-2xl text-white">
                    <Activity size={32} className="mb-4 opacity-80" />
                    <p className="text-3xl font-black">{inProgressProjects}</p>
                    <p className="text-sm font-bold opacity-80 mt-1">Projects In Progress</p>
                </div>
                <div className="bg-gray-900 rounded-[20px] p-8 shadow-2xl text-white">
                    <Clock size={32} className="mb-4 opacity-80" />
                    <p className="text-3xl font-black">{data.attendance.length}</p>
                    <p className="text-sm font-bold opacity-80 mt-1">Attendance Records</p>
                </div>
                <div className="bg-white rounded-[20px] p-8 shadow-2xl">
                    <CheckCircle2 size={32} className="mb-4 text-green-500" />
                    <p className="text-3xl font-black text-[#191a23]">{completedProjects}</p>
                    <p className="text-sm font-bold text-[#191a23]/60 mt-1">Completed Projects</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
