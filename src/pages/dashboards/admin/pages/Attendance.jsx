import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Download,
    User,
    Users,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    FileSpreadsheet,
    Settings,
    Save,
    CalendarDays
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const AdminAttendance = () => {
    const { user: currentUser } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterType, setFilterType] = useState('month'); // 'month' or 'custom'
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState({
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        offDays: [0, 6],
        attendanceStartFrom: '2024-01-01'
    });

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, filterType, selectedMonth, startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Settings
            const settingsRes = await fetch('http://localhost:5000/api/attendance/settings', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const settingsData = await settingsRes.json();
            if (settingsData) {
                setSettings({
                    ...settingsData,
                    attendanceStartFrom: settingsData.attendanceStartFrom ? settingsData.attendanceStartFrom.split('T')[0] : '2024-01-01'
                });
            }

            // Fetch Users (Include PM, DEV, SQA)
            const usersRes = await fetch('http://localhost:5000/api/auth/users', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const usersData = await usersRes.json();
            const staffUsers = usersData.filter(u => u.role === 'DEVELOPER' || u.role === 'SQA');
            setUsers(staffUsers);

            // Build Attendance URL
            let url = 'http://localhost:5000/api/attendance/all';
            const params = new URLSearchParams();
            if (filterType === 'month') {
                params.append('month', selectedMonth);
            } else if (filterType === 'custom' && startDate && endDate) {
                params.append('startDate', startDate);
                params.append('endDate', endDate);
            }
            if (params.toString()) url += `?${params.toString()}`;

            const attendanceRes = await fetch(url, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const attendanceData = await attendanceRes.json();
            const filteredAttendance = attendanceData.filter(record =>
                record.user && (record.user.role === 'DEVELOPER' || record.user.role === 'SQA')
            );
            setAttendance(filteredAttendance);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/attendance/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert('Attendance settings updated successfully!');
                setIsSettingsOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    const getDaysInMonth = (monthStr) => {
        const [year, month] = monthStr.split('-').map(Number);
        return new Date(year, month, 0).getDate();
    };

    const calculateUserStats = (userId) => {
        const userRecords = attendance.filter(a => a.user?._id === userId);

        let fullDays = 0;
        let halfDays = 0;
        let leaves = 0;
        let totalMins = 0;

        // Number of days in the range
        let daysToCount = [];
        if (filterType === 'month') {
            const daysCount = getDaysInMonth(selectedMonth);
            for (let i = 1; i <= daysCount; i++) {
                daysToCount.push(`${selectedMonth}-${String(i).padStart(2, '0')}`);
            }
        } else if (filterType === 'custom' && startDate && endDate) {
            let current = new Date(startDate);
            let last = new Date(endDate);
            while (current <= last) {
                daysToCount.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        }

        daysToCount.forEach(dateStr => {
            const record = userRecords.find(r => r.date === dateStr);
            if (record) {
                // Determine day type based on points (hours worked)
                // Assuming standard day is workingHoursEnd - workingHoursStart
                const [sH, sM] = settings.workingHoursStart.split(':').map(Number);
                const [eH, eM] = settings.workingHoursEnd.split(':').map(Number);
                const standardHours = (eH + eM / 60) - (sH + sM / 60);

                // Full Day: worked >= 85% of standard hours
                // Half Day: worked >= 45% of standard hours
                if (record.points >= standardHours * 0.85) fullDays++;
                else if (record.points >= standardHours * 0.45) halfDays++;

                if (record.points) {
                    totalMins += record.points * 60;
                } else if (record.clockIn && record.clockOut) {
                    // Fallback if points not set but clock times exist
                    const diff = (new Date(record.clockOut) - new Date(record.clockIn)) / 60000;
                    totalMins += Math.max(0, diff - (record.totalBreakMinutes || 0));
                }
            } else {
                // Check if date is not in future and after start date
                const today = new Date().toISOString().split('T')[0];
                if (dateStr <= today && dateStr >= settings.attendanceStartFrom) {
                    const day = new Date(dateStr).getDay();
                    if (!settings.offDays.includes(day)) {
                        leaves++;
                    }
                }
            }
        });

        return { fullDays, halfDays, leaves, totalHours: (totalMins / 60).toFixed(1) };
    };

    const downloadCSV = () => {
        const headers = ['User', 'Role', 'Email', 'Full Days', 'Half Days', 'Leaves', 'Total Hours'];
        const rows = users.map(user => {
            const stats = calculateUserStats(user._id);
            return [
                user.name,
                user.role,
                user.email,
                stats.fullDays,
                stats.halfDays,
                stats.leaves,
                stats.totalHours
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_${filterType === 'month' ? selectedMonth : 'Custom'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredAttendanceList = attendance.filter(record =>
        record.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.user?.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10 selection:bg-[#fa2742]/10 selection:text-[#fa2742]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-[#373833] tracking-tight">Personnel Attendance</h2>
                    <p className="text-[#373833]/60 font-bold text-sm italic uppercase tracking-widest">Time Tracking & Performance Metrics</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="px-6 py-3 bg-[#e8eae3] text-[#373833] rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-[#373833] hover:text-white transition-all flex items-center gap-2"
                    >
                        <Settings size={16} />
                        <span>Config Matrix</span>
                    </button>
                    <button
                        onClick={downloadCSV}
                        className="px-6 py-3 bg-[#373833] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#fa2742] transition-all flex items-center gap-2"
                    >
                        <FileSpreadsheet size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Settings Expansion Panel */}
            {isSettingsOpen && (
                <div className="bg-[#373833] rounded-[32px] p-8 shadow-2xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#fa2742] rounded-full -mr-32 -mt-32 blur-[100px] opacity-10"></div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#fa2742] rounded-2xl flex items-center justify-center">
                            <Settings className="text-[#373833]" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Attendance Parameters</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Adjust working logic and constraints</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateSettings} className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Clock-in Time</label>
                            <input
                                type="time"
                                value={settings.workingHoursStart}
                                onChange={e => setSettings({ ...settings, workingHoursStart: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-[#fa2742] transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Clock-out Time</label>
                            <input
                                type="time"
                                value={settings.workingHoursEnd}
                                onChange={e => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-[#fa2742] transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Monitor Starts From</label>
                            <input
                                type="date"
                                value={settings.attendanceStartFrom}
                                onChange={e => setSettings({ ...settings, attendanceStartFrom: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-[#fa2742] transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Standard Off Days</label>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            const newOffDays = settings.offDays.includes(idx)
                                                ? settings.offDays.filter(d => d !== idx)
                                                : [...settings.offDays, idx];
                                            setSettings({ ...settings, offDays: newOffDays });
                                        }}
                                        className={clsx(
                                            "w-9 h-9 rounded-lg text-[10px] font-black transition-all border",
                                            settings.offDays.includes(idx)
                                                ? "bg-[#fa2742] text-[#373833] border-[#fa2742]"
                                                : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-start-4 flex items-end">
                            <button
                                type="submit"
                                className="w-full py-4 bg-[#fa2742] text-[#373833] rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-[#fa2742]/10"
                            >
                                <Save size={18} />
                                Synchronize Rules
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 flex flex-wrap items-center gap-6">
                <div className="flex bg-[#e8eae3] p-1.5 rounded-2xl">
                    <button
                        onClick={() => setFilterType('month')}
                        className={clsx(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            filterType === 'month' ? "bg-white text-[#fa2742] shadow-sm" : "text-[#373833]/40 hover:text-[#373833]"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setFilterType('custom')}
                        className={clsx(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            filterType === 'custom' ? "bg-white text-[#fa2742] shadow-sm" : "text-[#373833]/40 hover:text-[#373833]"
                        )}
                    >
                        Custom Range
                    </button>
                </div>

                {filterType === 'month' ? (
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#fa2742]" size={16} />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-[#f0e4d4]/20 border-2 border-transparent focus:border-[#fa2742] rounded-xl py-2 pl-12 pr-4 text-[#373833] font-bold outline-none"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-[#f0e4d4]/20 border-2 border-transparent focus:border-[#fa2742] rounded-xl py-2 px-4 text-[#373833] font-bold outline-none"
                        />
                        <span className="text-[#373833]/40 font-black">TO</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-[#f0e4d4]/20 border-2 border-transparent focus:border-[#fa2742] rounded-xl py-2 px-4 text-[#373833] font-bold outline-none"
                        />
                    </div>
                )}

                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#373833]/20" size={18} />
                    <input
                        type="text"
                        placeholder="Search personnel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#f0e4d4]/20 border-2 border-transparent focus:border-[#fa2742] rounded-xl py-2 pl-12 pr-4 text-[#373833] font-bold outline-none placeholder:text-[#373833]/20"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fa2742] mx-auto"></div>
                    <p className="mt-4 text-[#373833]/40 font-black uppercase tracking-widest text-[10px]">Synchronizing Matrix...</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Detailed Daily Table Section */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-[#373833] uppercase tracking-widest flex items-center gap-3">
                                <Clock size={24} className="text-[#fa2742]" />
                                Daily Temporal Log
                            </h3>
                            <div className="h-px flex-1 bg-gray-100 mx-8"></div>
                        </div>

                        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#373833]/40">Date</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#373833]/40">Personnel</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#373833]/40">Clock In</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#373833]/40">Clock Out</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#373833]/40">Break (Mins)</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#373833]/40">Status</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#373833]/40 text-center">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredAttendanceList.length > 0 ? filteredAttendanceList.map((record) => (
                                            <tr key={record._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="p-6 text-sm font-bold text-[#373833]">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-[#373833] text-[#fa2742] rounded-lg flex items-center justify-center text-xs font-black group-hover:bg-[#fa2742] group-hover:text-white transition-colors">
                                                            {record.user?.name?.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-black text-[#373833]">{record.user?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 font-mono text-xs text-blue-600 font-bold">
                                                    {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                </td>
                                                <td className="p-6 font-mono text-xs text-[#fa2742] font-bold">
                                                    {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                </td>
                                                <td className="p-6 text-xs font-bold text-gray-500">{record.totalBreakMinutes || 0}m</td>
                                                <td className="p-6">
                                                    <span className={clsx(
                                                        "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                                        record.status === 'Clocked Out' ? "bg-green-50 text-green-700 border-green-100" :
                                                            record.status === 'On Break' ? "bg-orange-50 text-orange-700 border-orange-100" :
                                                                "bg-blue-50 text-blue-700 border-blue-100"
                                                    )}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f0e4d4] text-[#373833] text-xs font-black shadow-sm">
                                                        {record.points || 0}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="p-12 text-center text-[#373833]/20 italic font-bold uppercase tracking-widest">
                                                    No historical event data found in this buffer.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAttendance;
