import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Download,
    Activity,
    Shield,
    AlertCircle,
    Globe,
    Server,
    Database,
    Zap,
    Users,
    Award,
    TrendingDown,
    CheckCircle,
    XCircle
} from 'lucide-react';

const Reports = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPosition, setSelectedPosition] = useState('All');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDurationType, setExportDurationType] = useState('all');
    const [exportMonth, setExportMonth] = useState('');
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');
    const [userReportDurationType, setUserReportDurationType] = useState('all');
    const [userReportMonth, setUserReportMonth] = useState('');
    const [userReportStartDate, setUserReportStartDate] = useState('');
    const [userReportEndDate, setUserReportEndDate] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [userReportDurationType, userReportMonth, userReportStartDate, userReportEndDate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:5000/api/scores/all';
            const params = new URLSearchParams();

            if (userReportDurationType === 'month' && userReportMonth) {
                params.append('month', userReportMonth);
            } else if (userReportDurationType === 'custom' && userReportStartDate && userReportEndDate) {
                params.append('startDate', userReportStartDate);
                params.append('endDate', userReportEndDate);
            }

            if (params.toString()) url += `?${params.toString()}`;

            const { data } = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users reports:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique positions
    const positions = ['All', 'DEVELOPER', 'SQA'];

    // Filter users by position
    const filteredUsers = selectedPosition && selectedPosition !== 'All'
        ? users.filter(u => u.role === selectedPosition)
        : users;

    // Calculate stats
    const totalUsersCount = users.length;
    const bestPerformer = users.length > 0 ? users.reduce((prev, current) => (prev.totalPoints > current.totalPoints) ? prev : current) : null;
    const worstPerformer = users.length > 0 ? users.reduce((prev, current) => (prev.totalPoints < current.totalPoints) ? prev : current) : null;

    const selectedUserData = selectedUser ? users.find(u => u._id === selectedUser) : null;

    return (
        <div className="space-y-8 pb-10 selection:bg-[#fa2742] selection:text-[#373833]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#373833] tracking-tight">User Reports</h2>
                    <p className="text-[#373833]/60 font-medium text-sm">Generate and analyze employee performance reports.</p>
                </div>
                <button
                    onClick={() => setShowExportModal(true)}
                    className="px-6 py-3 bg-[#fa2742] text-[#373833] font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center space-x-2 text-xs uppercase tracking-widest"
                >
                    <Download size={18} />
                    <span>Export Report</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Users */}
                <div className="bg-white p-8 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#fa2742]/20 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-[#fa2742]" />
                        </div>
                    </div>
                    <p className="text-xs text-[#373833]/60 font-black uppercase tracking-widest mb-2">Total Users</p>
                    <h3 className="text-3xl font-black text-[#373833]">{totalUsersCount}</h3>
                    <p className="text-xs text-[#373833]/60 mt-2">(Developers, SQAs)</p>
                </div>

                {/* Best Performer */}
                <div className="bg-white p-8 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <Award size={24} className="text-green-500" />
                        </div>
                        <span className="text-xs font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-lg">Best</span>
                    </div>
                    <p className="text-xs text-[#373833]/60 font-black uppercase tracking-widest mb-2">Top Performer</p>
                    <h3 className="text-lg font-black text-[#373833]">{bestPerformer?.name || '---'}</h3>
                    <p className="text-xs text-[#373833]/60 mt-2">{bestPerformer?.role || ''} {bestPerformer ? `• ${bestPerformer.totalPoints} pts` : ''}</p>
                </div>

                {/* Worst Performer */}
                <div className="bg-white p-8 rounded-[20px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <TrendingDown size={24} className="text-red-500" />
                        </div>
                        <span className="text-xs font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-lg">Needs Help</span>
                    </div>
                    <p className="text-xs text-[#373833]/60 font-black uppercase tracking-widest mb-2">Least Performer</p>
                    <h3 className="text-lg font-black text-[#373833]">{worstPerformer?.name || '---'}</h3>
                    <p className="text-xs text-[#373833]/60 mt-2">{worstPerformer?.role || ''} {worstPerformer ? `• ${worstPerformer.totalPoints} pts` : ''}</p>
                </div>
            </div>

            {/* User Selection and Report */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-max">
                {/* User Selection Panel */}
                <div className="bg-white rounded-[20px] p-8 shadow-2xl self-start">
                    <h3 className="text-lg font-bold text-[#373833] mb-6">Select User</h3>

                    {/* Duration Selection Filter Form */}
                    <div className="mb-6 bg-[#373833]/5 rounded-xl p-4 border-2 border-[#373833]/10">
                        <h4 className="text-sm font-black text-[#373833] mb-4 uppercase tracking-widest">Filter Report</h4>

                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setUserReportDurationType('all')}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${userReportDurationType === 'all'
                                        ? 'bg-[#fa2742] text-[#373833] shadow-lg'
                                        : 'bg-white text-[#373833] border border-[#373833]/20 hover:border-[#fa2742]'
                                        }`}
                                >
                                    All Time
                                </button>
                                <button
                                    onClick={() => setUserReportDurationType('month')}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${userReportDurationType === 'month'
                                        ? 'bg-[#fa2742] text-[#373833] shadow-lg'
                                        : 'bg-white text-[#373833] border border-[#373833]/20 hover:border-[#fa2742]'
                                        }`}
                                >
                                    Month
                                </button>
                                <button
                                    onClick={() => setUserReportDurationType('custom')}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${userReportDurationType === 'custom'
                                        ? 'bg-[#fa2742] text-[#373833] shadow-lg'
                                        : 'bg-white text-[#373833] border border-[#373833]/20 hover:border-[#fa2742]'
                                        }`}
                                >
                                    Custom
                                </button>
                            </div>

                            {userReportDurationType === 'month' && (
                                <div>
                                    <label className="text-xs font-bold text-[#373833] block mb-2">Select Month</label>
                                    <input
                                        type="month"
                                        value={userReportMonth}
                                        onChange={(e) => setUserReportMonth(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-[#373833]/20 rounded-lg text-sm focus:outline-none focus:border-[#fa2742] transition-colors"
                                    />
                                </div>
                            )}

                            {userReportDurationType === 'custom' && (
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-xs font-bold text-[#373833] block mb-1">From</label>
                                        <input
                                            type="date"
                                            value={userReportStartDate}
                                            onChange={(e) => setUserReportStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-[#373833]/20 rounded-lg text-sm focus:outline-none focus:border-[#fa2742] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#373833] block mb-1">To</label>
                                        <input
                                            type="date"
                                            value={userReportEndDate}
                                            onChange={(e) => setUserReportEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-[#373833]/20 rounded-lg text-sm focus:outline-none focus:border-[#fa2742] transition-colors"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Position Dropdown */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-[#373833] mb-3">Position</label>
                        <select
                            value={selectedPosition}
                            onChange={(e) => {
                                setSelectedPosition(e.target.value);
                                setSelectedUser(null);
                            }}
                            className="w-full px-4 py-3 border-2 border-[#373833]/20 rounded-xl focus:outline-none focus:border-[#fa2742] transition-colors"
                        >
                            <option value="">Select Position</option>
                            {positions.map((position) => (
                                <option key={position} value={position}>
                                    {position}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selected Users List Display */}
                    {selectedPosition && (
                        <div>
                            <h4 className="text-sm font-bold text-[#373833] mb-4">Select User</h4>
                            <div className="max-h-96 overflow-y-auto">
                                <div className="space-y-3">
                                    {filteredUsers.map((user) => (
                                        <button
                                            key={user._id}
                                            onClick={() => setSelectedUser(user._id)}
                                            className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-all text-left ${selectedUser === user._id ? 'bg-[#fa2742]/10 border border-[#fa2742]/30' : 'bg-[#373833]/5 hover:bg-[#373833]/10'} text-[#373833]`}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#373833]/10 flex items-center justify-center overflow-hidden">
                                                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <Users size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{user.name}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedUser === user._id ? 'text-[#fa2742]' : 'opacity-60'}`}>{user.role}</p>
                                            </div>
                                            <span className={`text-xs font-black px-2 py-1 rounded ${user.totalPoints >= 20 ? 'bg-green-500/20 text-green-600' :
                                                user.totalPoints >= 0 ? 'bg-yellow-500/20 text-yellow-600' :
                                                    'bg-red-500/20 text-red-600'
                                                }`}>
                                                {user.totalPoints > 0 ? '+' : ''}{user.totalPoints}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Details */}
                <div className="lg:col-span-2">
                    {selectedUserData ? (
                        <div className="bg-white rounded-[20px] p-8 shadow-2xl">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-lg bg-[#373833]/10 flex items-center justify-center overflow-hidden">
                                        {selectedUserData.avatar ? <img src={selectedUserData.avatar} alt={selectedUserData.name} className="w-full h-full object-cover" /> : <Users size={32} />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#373833]">{selectedUserData.name}</h3>
                                        <p className="text-sm text-[#373833]/60">{selectedUserData.role} • {selectedUserData.email}</p>
                                        <div className="mt-2 flex gap-2">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-black ${selectedUserData.totalPoints >= 20 ? 'bg-green-500/20 text-green-600' :
                                                selectedUserData.totalPoints >= 0 ? 'bg-yellow-500/20 text-yellow-600' :
                                                    'bg-red-500/20 text-red-600'
                                                }`}>
                                                Total Score: {selectedUserData.totalPoints > 0 ? '+' : ''}{selectedUserData.totalPoints}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 bg-[#373833]/5 rounded-xl border border-[#373833]/10">
                                    <p className="text-[10px] font-black text-[#373833]/40 uppercase tracking-widest mb-1">Tasks Done</p>
                                    <h5 className="text-xl font-black text-[#373833]">{selectedUserData.stats.tasksCompleted}</h5>
                                </div>
                                <div className="p-4 bg-[#373833]/5 rounded-xl border border-[#373833]/10">
                                    <p className="text-[10px] font-black text-[#373833]/40 uppercase tracking-widest mb-1">On Time</p>
                                    <h5 className="text-xl font-black text-green-600">{selectedUserData.stats.tasksOnTime}</h5>
                                </div>
                                <div className="p-4 bg-[#373833]/5 rounded-xl border border-[#373833]/10">
                                    <p className="text-[10px] font-black text-[#373833]/40 uppercase tracking-widest mb-1">Attendance</p>
                                    <h5 className="text-xl font-black text-[#373833]">{selectedUserData.stats.totalAttendanceDays}d</h5>
                                </div>
                                <div className="p-4 bg-[#373833]/5 rounded-xl border border-[#373833]/10">
                                    <p className="text-[10px] font-black text-[#373833]/40 uppercase tracking-widest mb-1">Bugs Found</p>
                                    <h5 className="text-xl font-black text-orange-600">{selectedUserData.stats.bugsFound}</h5>
                                </div>
                            </div>

                            <div className="text-center py-6 border-2 border-dashed border-[#373833]/10 rounded-2xl">
                                <Activity size={32} className="mx-auto text-[#373833]/20 mb-2" />
                                <p className="text-sm text-[#373833]/60 font-medium italic">Detailed activity log integration coming soon...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[20px] p-12 shadow-2xl text-center">
                            <AlertCircle size={48} className="mx-auto text-[#373833]/30 mb-4" />
                            <p className="text-[#373833]/60 font-medium">Select a user to view their detailed report</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-[#373833]">Export All Reports</h3>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="text-[#373833]/60 hover:text-[#373833] transition-colors p-2"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Duration Selection */}
                        <div className="mb-8 p-6 bg-[#373833]/5 rounded-lg">
                            <h4 className="text-lg font-bold text-[#373833] mb-4">Select Report Duration</h4>

                            <div className="space-y-4">
                                {/* All Reports Option */}
                                <label className="flex items-center space-x-3 p-4 border-2 border-[#373833]/20 rounded-lg cursor-pointer hover:bg-[#373833]/5 transition-all"
                                    style={{ borderColor: exportDurationType === 'all' ? '#fa2742' : undefined, backgroundColor: exportDurationType === 'all' ? '#fa2742/10' : '' }}>
                                    <input
                                        type="radio"
                                        name="duration"
                                        value="all"
                                        checked={exportDurationType === 'all'}
                                        onChange={(e) => setExportDurationType(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <div>
                                        <p className="font-bold text-[#373833]">All Reports</p>
                                        <p className="text-xs text-[#373833]/60">Show complete report history</p>
                                    </div>
                                </label>

                                {/* By Month Option */}
                                <label className="flex items-center space-x-3 p-4 border-2 border-[#373833]/20 rounded-lg cursor-pointer hover:bg-[#373833]/5 transition-all"
                                    style={{ borderColor: exportDurationType === 'month' ? '#fa2742' : undefined, backgroundColor: exportDurationType === 'month' ? '#fa2742/10' : '' }}>
                                    <input
                                        type="radio"
                                        name="duration"
                                        value="month"
                                        checked={exportDurationType === 'month'}
                                        onChange={(e) => setExportDurationType(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-[#373833]">By Month</p>
                                        <p className="text-xs text-[#373833]/60 mb-2">Select a specific month</p>
                                        {exportDurationType === 'month' && (
                                            <input
                                                type="month"
                                                value={exportMonth}
                                                onChange={(e) => setExportMonth(e.target.value)}
                                                className="px-3 py-2 border-2 border-[#373833]/20 rounded-lg text-sm focus:outline-none focus:border-[#fa2742]"
                                            />
                                        )}
                                    </div>
                                </label>

                                {/* Custom Duration Option */}
                                <label className="flex items-start space-x-3 p-4 border-2 border-[#373833]/20 rounded-lg cursor-pointer hover:bg-[#373833]/5 transition-all"
                                    style={{ borderColor: exportDurationType === 'custom' ? '#fa2742' : undefined, backgroundColor: exportDurationType === 'custom' ? '#fa2742/10' : '' }}>
                                    <input
                                        type="radio"
                                        name="duration"
                                        value="custom"
                                        checked={exportDurationType === 'custom'}
                                        onChange={(e) => setExportDurationType(e.target.value)}
                                        className="w-4 h-4 mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-[#373833]">Custom Duration</p>
                                        <p className="text-xs text-[#373833]/60 mb-3">Select from and to dates</p>
                                        {exportDurationType === 'custom' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-bold text-[#373833] block mb-1">From Date</label>
                                                    <input
                                                        type="date"
                                                        value={exportStartDate}
                                                        onChange={(e) => setExportStartDate(e.target.value)}
                                                        className="w-full px-3 py-2 border-2 border-[#373833]/20 rounded-lg text-sm focus:outline-none focus:border-[#fa2742]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-[#373833] block mb-1">To Date</label>
                                                    <input
                                                        type="date"
                                                        value={exportEndDate}
                                                        onChange={(e) => setExportEndDate(e.target.value)}
                                                        className="w-full px-3 py-2 border-2 border-[#373833]/20 rounded-lg text-sm focus:outline-none focus:border-[#fa2742]"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Selected Duration Summary */}
                        <div className="mb-8 p-4 bg-[#fa2742]/10 border border-[#fa2742]/30 rounded-lg">
                            <p className="text-sm font-bold text-[#373833]">Selected Duration:</p>
                            <p className="text-sm text-[#373833]/70 mt-1">
                                {exportDurationType === 'all' && 'Complete Report History (All Time)'}
                                {exportDurationType === 'month' && `Month of ${exportMonth}`}
                                {exportDurationType === 'custom' && `${exportStartDate} to ${exportEndDate}`}
                            </p>
                        </div>

                        {/* Export Options */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-[#373833] mb-3">Export Format</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="px-4 py-3 bg-[#373833]/10 hover:bg-[#373833]/20 rounded-lg font-bold text-sm transition-all">
                                    📊 Export as PDF
                                </button>
                                <button className="px-4 py-3 bg-[#373833]/10 hover:bg-[#373833]/20 rounded-lg font-bold text-sm transition-all">
                                    📋 Export as CSV
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 px-6 py-3 bg-[#fa2742] text-[#373833] rounded-xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                            >
                                Export Report
                            </button>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 px-6 py-3 bg-[#373833]/10 text-[#373833] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#373833]/20 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;


