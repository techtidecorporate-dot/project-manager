import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { CheckCircle, Clock, Sparkles, ArrowRight, Briefcase, Flag, MessageCircleQuestion } from 'lucide-react';

const ClientDashboard = () => {
    const { user } = useAuth();
    const clientName = user?.name || 'Valued Client';
    const [projects, setProjects] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        if (user) {
            fetchData(controller.signal);
        }
        return () => controller.abort();
    }, [user]);

    const fetchData = async (signal) => {
        try {
            const [projRes, reqRes] = await Promise.all([
                fetch('http://localhost:5000/api/projects', {
                    signal,
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }),
                fetch('http://localhost:5000/api/requests', {
                    signal,
                    headers: { 'Authorization': `Bearer ${user.token}` }
                })
            ]);
            const projectsData = await projRes.json();
            const requestsData = await reqRes.json();
            setProjects(projectsData);
            setRequests(requestsData);
            setLoading(false);
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const totalPhases = projects.reduce((sum, p) => sum + (p.phases?.length || 0), 0);
    const completedPhases = projects.reduce((sum, p) => sum + (p.phases?.filter(ph => ph.status === 'Completed').length || 0), 0);
    const pendingApprovals = projects.reduce((sum, p) => sum + (p.phases?.filter(ph => ph.status === 'Completed' && !ph.clientApproved).length || 0), 0);
    const openTickets = requests.filter(r => r.status === 'Pending' || r.status === 'Open').length;
    const onTrackProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Completed').length;

    // Latest completed phase
    let latestPhase = null;
    projects.forEach(p => {
        if (p.phases) {
            p.phases.forEach(ph => {
                if (ph.status === 'Completed' && (!latestPhase || new Date(ph.updatedAt || 0) > new Date(latestPhase.updatedAt || 0))) {
                    latestPhase = { ...ph, project: p.title, projectId: p._id };
                }
            });
        }
    });

    const nextMilestone = projects.reduce((earliest, p) => {
        if (p.phases) {
            const upcoming = p.phases.filter(ph => ph.status !== 'Completed' && ph.deadline);
            if (upcoming.length > 0) {
                const nearest = upcoming.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
                if (!earliest || new Date(nearest.deadline) < new Date(earliest.deadline)) {
                    return { date: nearest.deadline, project: p.title };
                }
            }
        }
        return earliest;
    }, null);

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-10">
            {/* Welcoming Header */}
            <div className="bg-gradient-to-r from-[#453abc] to-[#60c3e3] rounded-[40px] p-10 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Welcome back, <br />
                        <span className="text-white font-bold">{clientName}!</span>
                    </h1>
                    <p className="text-white/90 text-lg font-medium max-w-xl">
                        We're making great progress on your projects. Here is the latest update from our team.
                    </p>
                </div>
            </div>

            {/* Latest Accomplishment */}
            {latestPhase && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-[#453abc]" size={24} />
                        <h2 className="text-2xl font-bold text-[#191a23]">Latest Accomplishment</h2>
                    </div>
                    <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 flex items-start justify-between group hover:shadow-2xl transition-all">
                        <div className="flex items-start space-x-4">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={28} />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                                    <Clock size={12} />
                                    <span>{latestPhase.updatedAt ? new Date(latestPhase.updatedAt).toLocaleDateString() : 'Recently'}</span>
                                    <span>•</span>
                                    <span className="text-[#453abc]">{latestPhase.project}</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#191a23] group-hover:text-[#453abc] transition-colors">
                                    {latestPhase.name}
                                </h3>
                                <p className="text-gray-500 mt-2">{latestPhase.description || 'Phase completed successfully.'}</p>
                            </div>
                        </div>
                        <Link
                            to={latestPhase.projectId ? `/client/projects/${latestPhase.projectId}` : "/client/projects"}
                            className="flex items-center gap-2 text-[#453abc] font-bold text-sm hover:gap-3 transition-all ml-4 shrink-0"
                        >
                            View Details <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/client/projects" className="bg-[#f0e4d4]/30 p-6 rounded-2xl border border-[#f0e4d4] text-center hover:shadow-md transition-all">
                    <Briefcase size={20} className="text-[#453abc] mx-auto mb-2" />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Projects</p>
                    <p className="text-xl font-black text-[#191a23]">{projects.length} Active</p>
                </Link>
                <Link to="/client/milestones" className="bg-[#f0e4d4]/30 p-6 rounded-2xl border border-[#f0e4d4] text-center hover:shadow-md transition-all">
                    <Flag size={20} className="text-[#453abc] mx-auto mb-2" />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Next Milestone</p>
                    <p className="text-xl font-black text-[#191a23]">{nextMilestone?.date || 'TBA'}</p>
                </Link>
                <Link to="/client/tickets" className="bg-[#f0e4d4]/30 p-6 rounded-2xl border border-[#f0e4d4] text-center hover:shadow-md transition-all">
                    <MessageCircleQuestion size={20} className="text-[#453abc] mx-auto mb-2" />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Open Tickets</p>
                    <p className="text-xl font-black text-[#191a23]">{openTickets}</p>
                </Link>
                <Link to="/client/approvals" className="bg-[#f0e4d4]/30 p-6 rounded-2xl border border-[#f0e4d4] text-center hover:shadow-md transition-all">
                    <CheckCircle size={20} className="text-[#453abc] mx-auto mb-2" />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Pending Approvals</p>
                    <p className="text-xl font-black text-[#191a23]">{pendingApprovals}</p>
                </Link>
            </div>
        </div>
    );
};

export default ClientDashboard;
