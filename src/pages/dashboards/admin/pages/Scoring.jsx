import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Award,
    TrendingUp,
    TrendingDown,
    Users,
    Save,
    Settings,
    Sliders,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Plus,
    Minus,
    Search
} from 'lucide-react';

const Scoring = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [adjustPoints, setAdjustPoints] = useState(0);
    const [adjustReason, setAdjustReason] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showConfig, setShowConfig] = useState(false);

    // Scoring configuration
    const [scoringConfig, setScoringConfig] = useState({
        onTimeTaskPoints: 2,
        lateTaskPoints: -1,
        fullAttendancePoints: 1,
        halfAttendancePoints: 0.5,
        bugFoundPoints: 2,
        bugReportedPenalty: -1
    });

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${currentUser.token}` };

            const [userRes, scoreRes] = await Promise.all([
                fetch('http://localhost:5000/api/auth/users', { headers }),
                fetch('http://localhost:5000/api/scores/all', { headers })
            ]);

            const usersData = await userRes.json();
            const scoresData = await scoreRes.json();

            setUsers(usersData.filter(u => u.role === 'DEVELOPER' || u.role === 'SQA'));
            setScores(scoresData);
        } catch (error) {
            console.error('Error fetching scoring data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustScore = async () => {
        if (!selectedUser || adjustPoints === 0) return;
        try {
            const res = await fetch('http://localhost:5000/api/scores/adjust', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    points: adjustPoints,
                    reason: adjustReason
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || `Score adjusted by ${adjustPoints > 0 ? '+' : ''}${adjustPoints} for ${selectedUser.name}` });
                setAdjustPoints(0);
                setAdjustReason('');
                fetchData();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to adjust score' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to adjust score' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const filteredScores = scores.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    const totalPoints = scores.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
    const avgScore = scores.length > 0 ? (totalPoints / scores.length).toFixed(1) : '0';
    const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.totalPoints || 0)) : 0;
    const worstScore = scores.length > 0 ? Math.min(...scores.map(s => s.totalPoints || 0)) : 0;

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
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Scoring System</h2>
                    <p className="text-[#191a23]/60 font-medium text-sm">Manage scoring rules and view employee performance scores.</p>
                </div>
                <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="px-6 py-3 bg-white border-2 border-[#453abc]/20 text-[#453abc] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#453abc]/10 transition-all flex items-center gap-2"
                >
                    <Sliders size={16} />
                    Scoring Rules
                </button>
            </div>

            {message.text && (
                <div className={`px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto"><X size={16} /></button>
                </div>
            )}

            {/* Scoring Config Panel */}
            {showConfig && (
                <div className="bg-gray-900 rounded-[32px] p-8 shadow-2xl border border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#453abc] rounded-2xl flex items-center justify-center">
                            <Settings className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Scoring Configuration</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Configure points and scoring rules</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { key: 'onTimeTaskPoints', label: 'On-Time Task Completion', desc: 'Points awarded when task is completed before due date', value: scoringConfig.onTimeTaskPoints, color: 'text-green-400' },
                            { key: 'lateTaskPoints', label: 'Late Task Penalty', desc: 'Points deducted when task is completed after due date', value: scoringConfig.lateTaskPoints, color: 'text-red-400' },
                            { key: 'fullAttendancePoints', label: 'Full Attendance Day', desc: 'Points per full day attendance (≥85% hours)', value: scoringConfig.fullAttendancePoints, color: 'text-green-400' },
                            { key: 'halfAttendancePoints', label: 'Half Attendance Day', desc: 'Points per half day attendance (≥45% hours)', value: scoringConfig.halfAttendancePoints, color: 'text-yellow-400' },
                            { key: 'bugFoundPoints', label: 'Bug Found (SQA)', desc: 'Points awarded to SQA for finding bugs', value: scoringConfig.bugFoundPoints, color: 'text-purple-400' },
                            { key: 'bugReportedPenalty', label: 'Bug Reported Penalty', desc: 'Points deducted from developer for bug in task', value: scoringConfig.bugReportedPenalty, color: 'text-red-400' }
                        ].map((item) => (
                            <div key={item.key} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <label className={`text-lg font-black ${item.color} block mb-1`}>{item.value > 0 ? `+${item.value}` : item.value}</label>
                                <p className="text-sm font-bold text-white mb-1">{item.label}</p>
                                <p className="text-[10px] text-white/40 font-medium">{item.desc}</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <button
                                        onClick={() => setScoringConfig(prev => ({ ...prev, [item.key]: Math.max(-10, prev[item.key] - 0.5) }))}
                                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all"
                                    >
                                        <Minus size={14} className="text-white" />
                                    </button>
                                    <span className="text-white font-black text-sm w-8 text-center">{item.value}</span>
                                    <button
                                        onClick={() => setScoringConfig(prev => ({ ...prev, [item.key]: Math.min(10, prev[item.key] + 0.5) }))}
                                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all"
                                    >
                                        <Plus size={14} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-8 px-8 py-4 bg-[#453abc] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center gap-3 shadow-xl mx-auto">
                        <Save size={18} />
                        Save Configuration
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#453abc]/20 rounded-xl flex items-center justify-center">
                            <Award size={24} className="text-[#453abc]" />
                        </div>
                    </div>
                    <p className="text-xs text-[#191a23]/60 font-black uppercase tracking-widest">Avg Score</p>
                    <p className="text-3xl font-black text-[#191a23] mt-1">{avgScore}</p>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-green-500" />
                        </div>
                    </div>
                    <p className="text-xs text-[#191a23]/60 font-black uppercase tracking-widest">Highest Score</p>
                    <p className="text-3xl font-black text-green-600 mt-1">+{bestScore}</p>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <TrendingDown size={24} className="text-red-500" />
                        </div>
                    </div>
                    <p className="text-xs text-[#191a23]/60 font-black uppercase tracking-widest">Lowest Score</p>
                    <p className="text-3xl font-black text-red-600 mt-1">{worstScore}</p>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-amber-500" />
                        </div>
                    </div>
                    <p className="text-xs text-[#191a23]/60 font-black uppercase tracking-widest">Total Users</p>
                    <p className="text-3xl font-black text-[#191a23] mt-1">{scores.length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23]/20" size={18} />
                <input
                    type="text"
                    placeholder="Search by name, role, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] transition-all font-bold placeholder:text-[#191a23]/20"
                />
            </div>

            {/* Score Table */}
            <div className="bg-white rounded-[20px] shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">#</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Name</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Role</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Tasks</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Attendance</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Bugs</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredScores.length > 0 ? filteredScores.map((s, i) => (
                                <tr key={s._id} className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedUser?._id === s._id ? 'bg-[#453abc]/5' : ''}`} onClick={() => setSelectedUser(s)}>
                                    <td className="py-4 px-6 text-sm font-black text-[#191a23]/40">{i + 1}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-[#191a23]/10 rounded-xl flex items-center justify-center font-black text-sm">
                                                {s.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#191a23]">{s.name}</p>
                                                <p className="text-[10px] text-[#191a23]/40 font-medium">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="px-3 py-1 bg-[#453abc]/10 text-[#453abc] rounded-lg text-xs font-black">{s.role}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm font-bold text-[#191a23]">{s.stats?.tasksCompleted || 0}</span>
                                        <span className="text-[10px] text-[#191a23]/40 ml-1">({s.stats?.tasksOnTime || 0} on time)</span>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-[#191a23]">{s.stats?.totalAttendanceDays || 0}d</td>
                                    <td className="py-4 px-6 text-sm font-bold text-orange-600">{s.stats?.bugsFound || 0}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-black ${(s.totalPoints || 0) >= 20 ? 'bg-green-500/20 text-green-600' : (s.totalPoints || 0) >= 0 ? 'bg-yellow-500/20 text-yellow-600' : 'bg-red-500/20 text-red-600'}`}>
                                            {(s.totalPoints || 0) > 0 ? '+' : ''}{s.totalPoints || 0}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center text-[#191a23]/30 italic font-bold uppercase tracking-widest text-xs">
                                        No score data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Selected User Detail & Manual Adjustment */}
            {selectedUser && (
                <div className="bg-white rounded-[20px] p-8 shadow-2xl border-2 border-[#453abc]/10">
                    <h3 className="text-lg font-bold text-[#191a23] mb-6">Score Detail: {selectedUser.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 bg-[#453abc]/5 rounded-xl">
                            <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-widest">Attendance Points</p>
                            <p className="text-xl font-black text-[#191a23]">{selectedUser.attendancePoints || 0}</p>
                        </div>
                        <div className="p-4 bg-[#453abc]/5 rounded-xl">
                            <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-widest">Dev Task Points</p>
                            <p className="text-xl font-black text-blue-600">{selectedUser.developerTaskPoints || 0}</p>
                        </div>
                        <div className="p-4 bg-[#453abc]/5 rounded-xl">
                            <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-widest">SQA Points</p>
                            <p className="text-xl font-black text-green-600">{selectedUser.sqaTaskPoints || 0}</p>
                        </div>
                        <div className="p-4 bg-[#453abc]/5 rounded-xl">
                            <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-widest">Total</p>
                            <p className="text-xl font-black text-[#453abc]">{selectedUser.totalPoints || 0}</p>
                        </div>
                    </div>

                    {/* Manual Adjustment */}
                    <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-[#453abc]/20">
                        <h4 className="text-sm font-black text-[#191a23] uppercase tracking-widest mb-4">Manual Score Adjustment</h4>
                        <div className="flex flex-wrap items-end gap-4">
                            <div>
                                <label className="text-[10px] font-black text-[#191a23]/60 uppercase tracking-widest block mb-1">Points</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setAdjustPoints(prev => Math.max(-100, prev - 1))}
                                        className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-200 transition-all font-black"
                                    >
                                        -1
                                    </button>
                                    <input
                                        type="number"
                                        value={adjustPoints}
                                        onChange={(e) => setAdjustPoints(parseInt(e.target.value) || 0)}
                                        className="w-24 text-center bg-white border-2 border-[#191a23]/10 rounded-xl py-2 px-3 text-lg font-black text-[#191a23] outline-none focus:border-[#453abc]"
                                    />
                                    <button
                                        onClick={() => setAdjustPoints(prev => Math.min(100, prev + 1))}
                                        className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-200 transition-all font-black"
                                    >
                                        +1
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black text-[#191a23]/60 uppercase tracking-widest block mb-1">Reason</label>
                                <input
                                    type="text"
                                    value={adjustReason}
                                    onChange={(e) => setAdjustReason(e.target.value)}
                                    placeholder="e.g., Bonus for extra work"
                                    className="w-full bg-white border-2 border-[#191a23]/10 rounded-xl py-2.5 px-4 text-sm text-[#191a23] outline-none focus:border-[#453abc] font-bold placeholder:text-[#191a23]/20"
                                />
                            </div>
                            <button
                                onClick={handleAdjustScore}
                                disabled={adjustPoints === 0}
                                className="px-6 py-2.5 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save size={16} />
                                Apply Adjustment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scoring;
