import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Pause, Coffee } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ClockWidget = () => {
    const { user: currentUser } = useAuth();
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        if (currentUser) {
            fetchAttendance();
        }
        return () => clearInterval(timer);
    }, [currentUser]);

    const fetchAttendance = async () => {
        try {
            const token = currentUser?.token;
            if (!token) return;
            const { data } = await axios.get('http://localhost:5000/api/attendance/today', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(data);
        } catch (error) {
            console.error('Error fetching attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            const token = currentUser?.token;
            const { data } = await axios.post('http://localhost:5000/api/attendance/clock-in', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(data);
            toast.success('Clocked in successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error clocking in');
        }
    };

    const handleClockOut = async () => {
        try {
            const token = currentUser?.token;
            const { data } = await axios.post('http://localhost:5000/api/attendance/clock-out', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(data);
            toast.success('Clocked out successfully. Points earned: ' + data.points);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error clocking out');
        }
    };

    const handleStartBreak = async () => {
        try {
            const token = currentUser?.token;
            const { data } = await axios.post('http://localhost:5000/api/attendance/start-break', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(data);
            toast.success('Break started');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error starting break');
        }
    };

    const handleEndBreak = async () => {
        try {
            const token = currentUser?.token;
            const { data } = await axios.post('http://localhost:5000/api/attendance/end-break', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(data);
            toast.success('Break ended');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error ending break');
        }
    };

    if (loading) return null;

    const status = attendance?.status || 'Clocked Out';
    const totalBreakMinutes = attendance?.totalBreakMinutes || 0;
    const canTakeBreak = status === 'Clocked In' && totalBreakMinutes < 60;

    return (
        <div className="bg-white rounded-[32px] shadow-xl border border-[#373833]/5 p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            {/* Ambient Background Element */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[60px] opacity-10 transition-all duration-1000 ${status === 'Clocked In' ? 'bg-green-500' : status === 'On Break' ? 'bg-yellow-500' : 'bg-[#fa2742]'}`}></div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-auto">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-[#f0e4d4] rounded-2xl flex items-center justify-center text-[#373833] shadow-inner group-hover:scale-110 transition-transform">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] text-[#373833]/40 font-black uppercase tracking-[0.2em]">Current Time</p>
                        <p className="text-2xl font-black text-[#373833] font-mono tracking-tighter">{currentTime.toLocaleTimeString()}</p>
                    </div>
                </div>

                <div className="hidden md:block h-12 w-px bg-[#373833]/10" />

                <div className="flex items-center space-x-10">
                    <div>
                        <p className="text-[10px] text-[#373833]/40 font-black uppercase tracking-[0.2em]">Session Status</p>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${status === 'Clocked In' ? 'text-green-500 bg-green-500' :
                                status === 'On Break' ? 'text-yellow-500 bg-yellow-500' : 'text-[#fa2742] bg-[#fa2742]'
                                }`} />
                            <p className="text-sm font-black text-[#373833] uppercase tracking-widest">{status}</p>
                        </div>
                    </div>

                    {attendance?.clockIn && (
                        <>
                            <div className="hidden sm:block">
                                <p className="text-[10px] text-[#373833]/40 font-black uppercase tracking-[0.2em]">Clock In</p>
                                <p className="text-sm font-black text-[#373833] mt-1">
                                    {new Date(attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#373833]/40 font-black uppercase tracking-[0.2em]">Break Usage</p>
                                <div className="flex items-center space-x-3 mt-1">
                                    <div className="w-20 h-1.5 bg-[#f0e4d4] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${totalBreakMinutes > 45 ? 'bg-red-500' : 'bg-[#373833]'}`}
                                            style={{ width: `${(totalBreakMinutes / 60) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-[#373833]">{totalBreakMinutes}m</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                {status === 'Clocked Out' ? (
                    <button
                        onClick={handleClockIn}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-3 px-10 py-4 bg-[#373833] hover:bg-[#fa2742] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 group/btn"
                    >
                        <Play size={18} className="group-hover:translate-x-1 transition-transform" fill="currentColor" />
                        <span>Start Work</span>
                    </button>
                ) : (
                    <>
                        {status === 'On Break' ? (
                            <button
                                onClick={handleEndBreak}
                                className="flex-1 md:flex-none flex items-center justify-center space-x-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                            >
                                <Pause size={18} fill="currentColor" />
                                <span>End Break</span>
                            </button>
                        ) : (
                            canTakeBreak && (
                                <button
                                    onClick={handleStartBreak}
                                    className="flex-1 md:flex-none flex items-center justify-center space-x-3 px-8 py-4 bg-[#f0e4d4] hover:bg-[#e6d0b3] text-[#373833] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                                >
                                    <Coffee size={18} />
                                    <span>Take Break</span>
                                </button>
                            )
                        )}
                        <button
                            onClick={handleClockOut}
                            className="flex-1 md:flex-none flex items-center justify-center space-x-3 px-8 py-4 bg-[#fa2742] hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                        >
                            <Square size={18} fill="currentColor" />
                            <span>Clock Out</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClockWidget;
