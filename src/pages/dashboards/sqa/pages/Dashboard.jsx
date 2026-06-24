import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Bug,
    ShieldCheck,
    Zap,
    Terminal,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    ClipboardCheck,
    PlayCircle,
    StopCircle,
    Clock,
    MessageSquare,
    Users,
    Trophy,
    Star
} from 'lucide-react';

import { useAuth } from '../../../../context/AuthContext';
import ClockWidget from '../../../../components/ClockWidget';
const SQADashboard = () => {
    const { user: currentUser, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        if (currentUser) {
            fetchData(controller.signal);
            fetchScoreData(controller.signal);
        }
        return () => controller.abort();
    }, [currentUser]);

    const fetchData = async (signal) => {
        try {
            const res = await fetch('http://localhost:5000/api/projects', {
                signal,
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.status === 401) {
                logout();
                return;
            }
            const data = await res.json();
            setProjects(data);
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching SQA dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchScoreData = async (signal) => {
        try {
            const res = await fetch('http://localhost:5000/api/scores/me', {
                signal,
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.status === 401) {
                logout();
                return;
            }
            const data = await res.json();
            setScoreData(data);
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching score data:', error);
        }
    };

    const getSQAStats = () => {
        let assignedCount = 0;
        let completedCount = 0;
        let crucialIssues = [];

        projects.forEach(project => {
            if (project.phases) {
                project.phases.forEach(phase => {
                    const sqaId = phase.sqa?._id || phase.sqa;
                    const sqaName = phase.sqa?.name || (typeof phase.sqa === 'object' ? phase.sqa.name : '');
                    const isSQA = sqaId === currentUser._id || sqaName.toLowerCase() === currentUser.name?.toLowerCase();

                    if (isSQA) {
                        if (['Completed (Dev)', 'Under SQA', 'Error'].includes(phase.status)) {
                            assignedCount++;
                            if (phase.status === 'Error') {
                                crucialIssues.push({
                                    id: phase._id || phase.name,
                                    title: phase.name,
                                    project: project.title,
                                    projectId: project._id,
                                    status: phase.status,
                                    priority: 'Critical'
                                });
                            }
                        } else if (phase.status === 'Completed') {
                            completedCount++;
                        }
                    }
                });
            }
        });

        return { assignedCount, completedCount, crucialIssues };
    };

    const stats = getSQAStats();
    const priorityBugs = stats.crucialIssues.slice(0, 5);
    const totalBugsRemaining = stats.assignedCount;

    return (
        <div className="space-y-8 pb-10 selection:bg-[#f0e4d4] selection:text-[#191a23]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#191a23]">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">QA Dashboard</h2>
                    <p className="text-[#191a23]/60 font-medium text-xs">Monitor test results and system stability.</p>
                </div>
                <div className="flex items-center space-x-2 bg-[#f0e4d4] border border-[#f0e4d4]/10 px-4 py-2 rounded-xl shadow-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#a7aa63]"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#191a23]">System Active</span>
                </div>
            </div>

            <ClockWidget />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">


                    <div className="bg-[#f0e4d4] rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#453abc]/5 rounded-full blur-[100px] -z-10 group-hover:bg-[#453abc]/10 transition-all"></div>
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-[#191a23]">Quality Assurance Stream</h3>
                            <div className="px-6 py-3 bg-[#f0e4d4] text-[#191a23] text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center space-x-2 shadow-sm">
                                <ShieldCheck size={14} className="text-green-600" />
                                <span>Security Active</span>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="grid grid-cols-1 gap-4 mb-6">
                                <div className="p-8 bg-white rounded-3xl border border-[#f0e4d4]/10 shadow-sm flex justify-between items-center group/bug hover:border-[#453abc]/30 transition-all">
                                    <div>
                                        <p className="text-[10px] font-black text-[#191a23]/40 uppercase tracking-widest mb-2">Bug Detection</p>
                                        <h4 className="text-4xl font-black text-[#191a23]">{scoreData?.stats?.bugsFound || 0}</h4>
                                        <p className="text-[10px] text-[#453abc] font-bold mt-2 flex items-center gap-1">
                                            <Bug size={12} /> Total Bugs Found
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 bg-[#453abc]/10 text-[#453abc] rounded-2xl flex items-center justify-center group-hover/bug:scale-110 transition-transform">
                                        <AlertTriangle size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {priorityBugs.map((bug, i) => (
                                    <Link to={`/sqa/projects/${bug.projectId}`} key={i} className="block p-6 bg-white rounded-3xl border border-[#f0e4d4]/10 hover:shadow-md transition-all flex items-center justify-between group/item">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-10 h-10 bg-[#f0e4d4] text-[#191a23] rounded-xl flex items-center justify-center shadow-lg">
                                                <Bug size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#191a23] transition-all">
                                                    {bug.title}
                                                </h4>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    <span className="text-[10px] text-[#191a23]/60 font-black uppercase tracking-widest">
                                                        {bug.project}
                                                    </span>
                                                    <div className="w-1 h-1 bg-[#f0e4d4] rounded-full"></div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${bug.priority === 'Critical' ? 'text-red-500' : 'text-orange-500'}`}>
                                                        {bug.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest
                                                     ${bug.status === 'Error' ? 'bg-red-100 text-red-600' : 'bg-[#f0e4d4] text-[#191a23]'}`}>
                                                {bug.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Score Card */}
                    {scoreData && (
                        <div className="bg-gradient-to-br from-blue-600 to-gray-600 p-8 rounded-[40px] shadow-xl text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-xl font-bold">Quality Score</h4>
                                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">
                                        Performance Rating
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Trophy size={20} />
                                </div>
                            </div>
                            <div className="text-4xl font-black mb-1">{scoreData.totalPoints?.toFixed(1) || '0.0'}</div>
                            <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Quality Points</p>
                            <div className="mt-4 flex items-center text-yellow-400 gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={16} fill="currentColor" className={star <= Math.round((scoreData.totalPoints || 0) / 20) ? 'text-yellow-400' : 'text-white/30'} />
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Request Session Widget - Compact */}
                    <Link to="/sqa/requests" className="block">
                        <div className="bg-white p-6 rounded-[32px] shadow-xl text-[#191a23] hover:shadow-2xl transition-all group cursor-pointer border border-[#f0e4d4]/20">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-[#453abc]/10 text-[#453abc] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Zap size={16} />
                                    </div>
                                    <h4 className="text-sm font-black">Request Session</h4>
                                </div>
                                <ArrowRight className="text-[#191a23] group-hover:translate-x-1 transition-transform" size={16} />
                            </div>
                            <p className="text-[10px] text-[#191a23]/60 font-bold uppercase tracking-widest">
                                Submit resource requests
                            </p>
                        </div>
                    </Link>

                </div>
            </div>
        </div >
    );
};

export default SQADashboard;

