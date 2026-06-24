import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock,
    Briefcase,
    Users,
    CheckCircle2,
    ArrowRight,
    PlayCircle,
    StopCircle,
    Calendar,
    MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const PMDashboard = () => {
    const { user: currentUser, logout } = useAuth();
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [stats, setStats] = useState({
        pendingProjects: 0,
        totalUsers: 0
    });
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (currentUser) {
            fetchDashboardData(controller.signal);
        }
        return () => controller.abort();
    }, [currentUser]);

    const fetchDashboardData = async (signal) => {
        try {
            // Fetch Projects to calculate pending
            const projectsRes = await fetch('http://localhost:5000/api/projects', {
                signal,
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            // Fetch Users for "Active Users" count (Total users for now)
            const usersRes = await fetch('http://localhost:5000/api/auth/users', {
                signal,
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            // Fetch Tasks for "Latest Work Done"
            const tasksRes = await fetch('http://localhost:5000/api/tasks?status=Completed', {
                signal,
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (projectsRes.status === 401 || usersRes.status === 401 || tasksRes.status === 401) {
                logout();
                return;
            }

            const projectsData = await projectsRes.json();
            const usersData = await usersRes.json();
            const tasksData = await tasksRes.json();

            // Pending projects: those that are not completed yet
            const pending = projectsData.filter(p => p.status !== 'Completed');
            setProjects(pending);
            setUsers(usersData);
            setCompletedTasks(tasksData.slice(0, 5));

            setStats({
                pendingProjects: pending.length,
                totalUsers: usersData.length
            });

        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error("Error fetching dashboard data", error);
        }
    };

    return (
        <div className="space-y-8 pb-10 selection:bg-[#f0e4d4] selection:text-[#191a23]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191a23] tracking-tight">Project Manager Dashboard</h2>
                    <p className="text-[#191a23]/60 font-medium text-xs">Oversee operations, manage team, and track critical paths.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-[#f0e4d4] border border-[#f0e4d4]/10 px-4 py-2 rounded-xl flex items-center space-x-3 shadow-sm">
                        <Calendar size={16} className="text-[#191a23]" />
                        <span className="text-xs font-black text-[#191a23] uppercase tracking-widest">Sprint 24.2 Active</span>
                    </div>
                </div>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Pending Projects */}
                <div className="bg-gray-900 rounded-[32px] p-8 shadow-xl relative overflow-hidden group flex flex-col justify-between h-64 text-white">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#453abc] rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-[#453abc] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#453abc]/30">
                            <Briefcase size={24} className="text-white" />
                        </div>
                        <h3 className="text-4xl font-black mb-2">{stats.pendingProjects}</h3>
                        <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Active Projects</p>
                    </div>
                </div>

                {/* Total Users */}
                <div className="bg-white rounded-[32px] p-8 shadow-xl border border-[#453abc]/10 relative overflow-hidden group flex flex-col justify-between h-64">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f0e4d4] rounded-full blur-[40px] opacity-50"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-[#f0e4d4] rounded-2xl flex items-center justify-center mb-4 text-[#191a23]">
                            <Users size={24} />
                        </div>
                        <h3 className="text-4xl font-black text-[#191a23] mb-2">{stats.totalUsers}</h3>
                        <p className="text-sm font-bold text-[#191a23]/60 uppercase tracking-widest">Active Users</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content: Pending Projects List & Latest Work Done */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Pending Projects List */}
                    <div className="bg-white rounded-[40px] p-10 shadow-xl relative overflow-hidden border border-[#453abc]/10">
                        <h3 className="text-2xl font-bold text-[#191a23] mb-6">Active Projects</h3>
                        {projects.length > 0 ? (
                            <div className="space-y-4">
                                {projects.slice(0, 3).map((project) => (
                                    <Link to={`/pm/projects/${project._id}`} key={project._id} className="block p-5 bg-gray-50 rounded-[32px] border border-gray-100 hover:shadow-md transition-all group/proj">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="font-black text-[#191a23] group-hover/proj:text-[#453abc] transition-colors">{project.title}</h4>
                                                <p className="text-[10px] text-[#191a23]/60 font-black uppercase tracking-widest">{project.client}</p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest
                                                ${project.status === 'Planning' ? 'bg-blue-100 text-blue-700' :
                                                    project.status === 'In Progress' ? 'bg-[#453abc]/10 text-[#453abc]' :
                                                        project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black text-[#191a23]/40 uppercase tracking-widest">
                                                <span>Mission Progress</span>
                                                <span className="text-[#191a23]">{project.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-[#f0e4d4] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#453abc] transition-all duration-700"
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-[#191a23]/40">
                                <p className="font-bold">No pending projects.</p>
                            </div>
                        )}
                    </div>

                    {/* Latest Work Done (Mock for now as specified) */}
                    <div className="bg-white rounded-[40px] p-10 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-[#191a23]">Latest Work Done</h3>
                                <p className="text-[#191a23]/60 text-xs font-bold uppercase tracking-widest mt-1">Recent Activity</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {completedTasks.length > 0 ? (
                                completedTasks.map((task) => (
                                    <div key={task._id} className="p-5 bg-gray-50 rounded-[24px] border border-transparent hover:border-[#453abc]/10 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#191a23] text-white shadow-sm overflow-hidden">
                                                    {task.assignedTo && task.assignedTo.avatar ? (
                                                        <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold">
                                                            {task.assignedTo && task.assignedTo.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#191a23] text-sm">{task.title}</h4>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-[10px] font-bold text-[#191a23]/60 uppercase tracking-widest">
                                                            {task.project ? task.project.title : 'No Project'}
                                                        </span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="text-[10px] font-bold text-[#191a23]/40 uppercase tracking-widest">
                                                            {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-[10px] font-black uppercase tracking-widest mb-1 text-green-600">Completed</span>
                                                <span className="text-[10px] font-bold text-[#191a23]/40">
                                                    {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-[#191a23]/40">
                                    <p className="font-bold">No recently completed tasks.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Active Users List */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-xl text-[#191a23] border border-[#f0e4d4]/20 flex flex-col h-[600px]">
                        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="w-10 h-10 bg-[#453abc]/10 text-[#453abc] rounded-xl flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#191a23]">Active Users</h4>
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {users.length} Online
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                            {users.map((u, i) => (
                                <div key={u._id || i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[#191a23] shadow-sm">
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#191a23]">{u.name}</p>
                                        <p className="text-[10px] text-[#191a23]/60 font-medium uppercase">{u.role}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PMDashboard;

