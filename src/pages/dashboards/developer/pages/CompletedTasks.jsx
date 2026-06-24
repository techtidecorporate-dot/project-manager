import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    Calendar,
    Clock,
    Layout,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const CompletedTasks = () => {
    const { user: currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            const [tasksRes, projectsRes] = await Promise.all([
                fetch(`http://localhost:5000/api/tasks?assignedTo=${currentUser._id}`, {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                }),
                fetch('http://localhost:5000/api/projects', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                })
            ]);

            const tasksData = await tasksRes.json();
            const projectsData = await projectsRes.json();

            setTasks(tasksData);
            setProjects(projectsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    // Get all completed phases assigned to this developer
    const getCompletedPhases = () => {
        const completedPhases = [];

        projects.forEach(project => {
            if (project.phases && project.phases.length > 0) {
                project.phases.forEach((phase) => {
                    // Handle different developer field formats
                    let devId = null;
                    let devName = '';

                    if (phase.developer) {
                        if (typeof phase.developer === 'object') {
                            devId = phase.developer._id;
                            devName = phase.developer.name || '';
                        } else {
                            devId = phase.developer;
                        }
                    }

                    // Convert IDs to strings for comparison
                    const currentUserId = String(currentUser._id);
                    const phaseDevId = String(devId);

                    // Match by ID or by name (case insensitive)
                    const isIdMatch = phaseDevId === currentUserId;
                    const isNameMatch = devName.toLowerCase().trim() === String(currentUser.name || '').toLowerCase().trim();

                    // Show phases that are Completed (Dev), Under SQA, or fully Completed
                    if ((isIdMatch || isNameMatch) && ['Completed (Dev)', 'Under SQA', 'Completed'].includes(phase.status)) {
                        completedPhases.push({
                            ...phase,
                            project: {
                                _id: project._id,
                                title: project.title,
                                client: project.client
                            }
                        });
                    }
                });
            }
        });
        return completedPhases;
    };

    // Get completed regular tasks
    const getCompletedTasks = () => {
        return tasks.filter(t => t.status === 'Completed');
    };

    const getPhaseStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Completed (Dev)': return 'bg-emerald-100 text-emerald-700';
            case 'Under SQA': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const completedPhases = getCompletedPhases();
    const completedTasks = getCompletedTasks();

    // Sort by completion date (newest first)
    const sortedPhases = [...completedPhases].sort((a, b) => {
        return new Date(b.updatedAt || b.deadline) - new Date(a.updatedAt || a.deadline);
    });

    const sortedTasks = [...completedTasks].sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-[#191a23]">Completed Tasks</h1>
                <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1 text-sm text-green-600">
                        <CheckCircle size={16} />
                        <span>{sortedPhases.length} phases completed</span>
                    </span>
                    <span className="flex items-center space-x-1 text-sm text-[#191a23]/60">
                        <CheckCircle2 size={16} />
                        <span>{sortedTasks.length} tasks completed</span>
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-[#191a23]/40 font-medium italic">
                    Loading completed tasks...
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Completed Phases Section */}
                    {sortedPhases.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-[#191a23] mb-4 flex items-center space-x-2">
                                <Layout size={20} />
                                <span>Completed Project Phases</span>
                            </h2>
                            <div className="grid gap-4">
                                {sortedPhases.map((phase, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-90 hover:opacity-100 transition-opacity">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Layout size={16} className="text-[#191a23]/40" />
                                                    <span className="text-sm font-bold text-[#191a23]/60">
                                                        {phase.project?.title || 'Unknown Project'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className={`text-lg font-bold text-[#191a23] ${phase.status === 'Completed' ? 'line-through' : ''}`}>{phase.name}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPhaseStatusColor(phase.status)}`}>
                                                        {phase.status === 'Completed (Dev)' ? 'Waiting for SQA' : phase.status}
                                                    </span>
                                                </div>
                                                {phase.description && (
                                                    <p className="text-gray-500 mb-3">{phase.description}</p>
                                                )}
                                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                    <span className="flex items-center space-x-1">
                                                        <Calendar size={14} />
                                                        <span>Target: {phase.deadline || 'N/A'}</span>
                                                    </span>
                                                    <span>â€¢</span>
                                                    <span className="flex items-center space-x-1">
                                                        <CheckCircle2 size={14} />
                                                        <span>SQA: {phase.sqa?.name || 'Assigned'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle size={24} className="text-green-500" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Regular Tasks Section */}
                    {sortedTasks.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-[#191a23] mb-4 flex items-center space-x-2">
                                <CheckCircle2 size={20} />
                                <span>Completed Regular Tasks</span>
                            </h2>
                            <div className="grid gap-4">
                                {sortedTasks.map(task => (
                                    <div key={task._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-90 hover:opacity-100 transition-opacity">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Layout size={16} className="text-[#191a23]/40" />
                                                    <span className="text-sm font-bold text-[#191a23]/60">
                                                        {task.project?.title || 'No Project'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-bold text-[#191a23] line-through">{task.title}</h3>
                                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        Completed
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 mb-3">{task.description}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                    <span className="flex items-center space-x-1">
                                                        <Calendar size={14} />
                                                        <span>Completed: {new Date(task.updatedAt).toLocaleDateString()}</span>
                                                    </span>
                                                    <span>â€¢</span>
                                                    <span className="flex items-center space-x-1">
                                                        <Clock size={14} />
                                                        <span>{getTimeAgo(task.updatedAt)}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle size={24} className="text-green-500" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {sortedPhases.length === 0 && sortedTasks.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <CheckCircle size={48} className="text-gray-300" />
                                <p className="text-[#191a23]/40 font-medium">No completed tasks yet.</p>
                                <p className="text-sm text-[#191a23]/30">Complete phases from Assigned Tasks to see them here.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompletedTasks;

