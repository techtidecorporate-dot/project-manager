import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Code2,
    GitBranch,
    Zap,
    Terminal,
    ChevronRight,
    MessageSquare,
    PlayCircle,
    StopCircle,
    AlertCircle,
    ArrowRight,
    Users
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import ClockWidget from '../../../../components/ClockWidget';

const DevDashboard = () => {
    const { user: currentUser, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        if (currentUser) {
            fetchData(controller.signal);
        }
        return () => controller.abort();
    }, [currentUser]);

    const fetchData = async (signal) => {
        try {
            const [tasksRes, projectsRes] = await Promise.all([
                fetch(`http://localhost:5000/api/tasks?assignedTo=${currentUser._id}`, {
                    signal,
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                }),
                fetch('http://localhost:5000/api/projects', {
                    signal,
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                })
            ]);

            if (tasksRes.status === 401 || projectsRes.status === 401) {
                logout();
                return;
            }

            const tasksData = await tasksRes.json();
            const projectsData = await projectsRes.json();
            setTasks(tasksData);
            setProjects(projectsData);
            setLoading(false);
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    // Calculate Counts
    const getDeveloperStats = () => {
        let assignedCount = tasks.filter(t => t.status !== 'Completed').length;
        let completedCount = tasks.filter(t => t.status === 'Completed').length;

        projects.forEach(project => {
            if (project.phases) {
                project.phases.forEach(phase => {
                    const devId = phase.developer?._id || phase.developer;
                    const isDev = devId === currentUser._id;
                    if (isDev) {
                        if (['Pending', 'Working', 'Error'].includes(phase.status)) {
                            assignedCount++;
                        } else if (['Completed (Dev)', 'Under SQA', 'Completed'].includes(phase.status)) {
                            completedCount++;
                        }
                    }
                });
            }
        });

        return { assignedCount, completedCount };
    };

    const stats = getDeveloperStats();

    // Sort tasks by priority: Urgent > High > Medium > Low
    const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const incompleteTasks = tasks.filter(t => t.status !== 'Completed').sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const highPriorityTasks = incompleteTasks.filter(t => t.priority === 'Urgent' || t.priority === 'High');
    const mediumTasks = incompleteTasks.filter(t => t.priority === 'Medium');
    const lowTasks = incompleteTasks.filter(t => t.priority === 'Low');

    return (
        <div className="space-y-8 pb-10 selection:bg-[#f0e4d4] selection:text-[#373833]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#373833] tracking-tight">Developer Dashboard</h2>
                    <p className="text-[#373833]/60 font-medium text-xs">Manage your tasks and code updates.</p>
                </div>
                <div className="flex items-center space-x-2 bg-[#f0e4d4] border border-[#f0e4d4]/10 px-4 py-2 rounded-xl shadow-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#a7aa63]"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#373833]">System Active</span>
                </div>
            </div>

            <ClockWidget />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">


                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Quick Action: Request Session */}
                        <Link to="/developer/requests" className="group">
                            <div className="bg-[#f0e4d4] p-8 rounded-[40px] shadow-xl hover:shadow-2xl transition-all border border-[#f0e4d4]/10 relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fa2742]/5 rounded-full blur-[40px] -z-10 group-hover:bg-[#fa2742]/10 transition-all"></div>
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-[#fa2742] text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                                            <Zap size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black text-[#373833] mb-2">Request Session</h3>
                                        <p className="text-sm text-[#373833]/60 font-medium">Need assets or guidance? Submit a request to the PM.</p>
                                    </div>
                                    <div className="mt-8 flex items-center text-[#fa2742] font-black text-xs uppercase tracking-widest">
                                        <span>New Request</span>
                                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Quick Action: Assigned Tasks */}
                        <Link to="/developer/assigned-tasks" className="group">
                            <div className="bg-[#373833] p-8 rounded-[40px] shadow-xl hover:shadow-2xl transition-all border border-[#373833]/10 relative overflow-hidden h-full text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -z-10"></div>
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform backdrop-blur-md">
                                            <Code2 size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black mb-2">My Task Board</h3>
                                        <p className="text-white/60 text-sm font-medium">You have {stats.assignedCount} tasks waiting for your input.</p>
                                    </div>
                                    <div className="mt-8 flex items-center text-[#fa2742] font-black text-xs uppercase tracking-widest">
                                        <span>View All Tasks</span>
                                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Active Phases Overview */}
                    <div className="bg-white rounded-[40px] p-8 shadow-xl border border-[#373833]/5">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <GitBranch className="text-[#373833]/40" size={24} />
                                <h3 className="text-xl font-black text-[#373833]">Active Project Phases</h3>
                            </div>
                            <Link to="/developer/assigned-tasks" className="text-[10px] font-black uppercase tracking-widest text-[#fa2742] hover:underline">See Details</Link>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-6 text-[#373833]/40">Loading phases...</div>
                            ) : (() => {
                                const activePhases = [];
                                projects.forEach(project => {
                                    if (project.phases) {
                                        project.phases.forEach(phase => {
                                            const devId = phase.developer?._id || phase.developer;
                                            if (devId === currentUser._id && ['Pending', 'Working', 'Error'].includes(phase.status)) {
                                                activePhases.push({ ...phase, projectTitle: project.title });
                                            }
                                        });
                                    }
                                });

                                return activePhases.length > 0 ? (
                                    activePhases.slice(0, 3).map((phase, i) => (
                                        <div key={`phase-${i}`} className="flex items-center justify-between p-4 bg-[#f5f5f5] rounded-2xl hover:bg-[#f0e4d4]/30 transition-colors group">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-2 h-10 rounded-full ${phase.status === 'Error' ? 'bg-[#fa2742]' : 'bg-blue-500'}`}></div>
                                                <div>
                                                    <h4 className="font-bold text-[#373833] text-sm">{phase.name}</h4>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#373833]/40">{phase.projectTitle}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-right">
                                                <div className="hidden sm:block">
                                                    <p className="text-[10px] font-black uppercase text-[#373833]/40">Status</p>
                                                    <p className={`text-[10px] font-black uppercase ${phase.status === 'Error' ? 'text-red-500' : 'text-blue-500'}`}>{phase.status}</p>
                                                </div>
                                                <ChevronRight size={16} className="text-[#373833]/20 group-hover:text-[#fa2742] transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-[#373833]/40 font-medium italic">No active project phases assigned.</div>
                                );
                            })()}
                        </div>
                    </div>


                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">



                    {/* Active Developers Card */}
                    <div className="bg-white p-8 rounded-[40px] shadow-xl text-[#373833]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-xl font-bold text-[#373833]">Active Developers</h4>
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 8 Online Now
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-[#f0e4d4] rounded-full flex items-center justify-center text-[#373833]">
                                <Users size={20} />
                            </div>
                        </div>
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200 shadow-sm relative z-10 hover:z-20 hover:scale-110 transition-transform">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=Dev+${i}&background=random`}
                                        alt={`Dev ${i}`}
                                        className="w-full h-full rounded-full"
                                    />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-4 border-white bg-[#373833] text-white flex items-center justify-center text-xs font-bold relative z-0">
                                +3
                            </div>
                        </div>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default DevDashboard;
