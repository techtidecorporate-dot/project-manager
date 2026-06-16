import React, { useState, useEffect } from 'react';
import {
    PlayCircle,
    CheckCircle,
    Clock,
    Layout,
    User,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import clsx from 'clsx';

const AssignedTasks = () => {
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

    // Get all phases assigned to this developer across all projects
    // Match by developer ID or name
    const getAssignedPhases = () => {
        const assignedPhases = [];

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
                            // It's a string ID
                            devId = phase.developer;
                        }
                    }

                    // Convert IDs to strings for comparison
                    const currentUserId = String(currentUser._id);
                    const phaseDevId = String(devId);

                    // Match by ID or by name (case insensitive)
                    const isIdMatch = phaseDevId === currentUserId;
                    const isNameMatch = devName.toLowerCase().trim() === String(currentUser.name || '').toLowerCase().trim();

                    if ((isIdMatch || isNameMatch) && ['Pending', 'Working', 'Error'].includes(phase.status)) {
                        assignedPhases.push({
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

        return assignedPhases;
    };

    // Get regular tasks assigned to this developer
    const getAssignedTasks = () => {
        return tasks.filter(task => task.status !== 'Completed');
    };

    // Handle phase status update
    // When developer completes, it goes to SQA for review (status: 'Review')
    const handleUpdatePhaseStatus = async (projectId, phaseName, newStatus) => {
        try {
            const project = projects.find(p => p._id === projectId);
            if (!project) return;

            const updatedPhases = project.phases.map(phase => {
                if (phase.name === phaseName) {
                    // When developer completes, send to SQA review
                    const status = newStatus === 'Completed' ? 'Review' : newStatus;
                    return { ...phase, status };
                }
                return phase;
            });

            const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ phases: updatedPhases })
            });

            if (res.ok) {
                // Refresh data
                fetchData();
            }
        } catch (error) {
            console.error('Error updating phase status:', error);
        }
    };

    const handleStartTask = async (taskId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ status: 'In Progress' })
            });
            if (res.ok) {
                setTasks(tasks.map(task =>
                    task._id === taskId ? { ...task, status: 'In Progress' } : task
                ));
            }
        } catch (error) {
            console.error('Error starting task:', error);
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ status: 'Completed' })
            });
            if (res.ok) {
                setTasks(tasks.map(task =>
                    task._id === taskId ? { ...task, status: 'Completed' } : task
                ));
            }
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const assignedPhases = getAssignedPhases();
    const assignedTasks = getAssignedTasks();

    const sortedTasks = [...assignedTasks].sort((a, b) => {
        const priorityA = { 'High': 0, 'Medium': 1, 'Low': 2 };
        return priorityA[a.priority] - priorityA[b.priority];
    });

    // Sort phases by priority primarily, then status
    const sortedPhases = [...assignedPhases].sort((a, b) => {
        const priorityOrderMap = { 'High': 0, 'Medium': 1, 'Low': 2 };
        const statusOrderMap = { 'Error': 0, 'Working': 1, 'Pending': 2 };

        const pA = priorityOrderMap[a.priority] ?? 1;
        const pB = priorityOrderMap[b.priority] ?? 1;

        if (pA !== pB) return pA - pB;
        return (statusOrderMap[a.status] ?? 3) - (statusOrderMap[b.status] ?? 3);
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-[#fa2742] bg-[#fa2742]/10';
            case 'Medium': return 'text-blue-500 bg-blue-50';
            case 'Low': return 'text-gray-400 bg-gray-100';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    const groupTasksByPriority = (items) => {
        const groups = { High: [], Medium: [], Low: [] };
        items.forEach(item => {
            const priority = item.priority || 'Medium';
            if (groups[priority]) {
                groups[priority].push(item);
            } else {
                groups.Medium.push(item);
            }
        });
        return groups;
    };

    const getPhaseStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Completed (Dev)': return 'bg-emerald-100 text-emerald-700';
            case 'Working': return 'bg-blue-100 text-blue-700';
            case 'Under SQA': return 'bg-purple-100 text-purple-700';
            case 'Error': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const renderPrioritySection = (title, items, type) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 mb-2">
                    <div className={clsx(
                        "w-2 h-6 rounded-full",
                        title === 'High' ? "bg-[#fa2742]" : title === 'Medium' ? "bg-blue-500" : "bg-gray-400"
                    )} />
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#373833]/60 italic">
                        {title} Priority {type === 'Phase' ? 'Phases' : 'Tasks'}
                    </h3>
                </div>
                <div className="grid gap-4">
                    {items.map((phase, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Layout size={16} className="text-[#373833]/40" />
                                        <span className="text-sm font-bold text-[#373833]/60">
                                            {phase.project?.title || 'Unknown Project'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#373833]">{phase.name}</h3>
                                    {phase.description && (
                                        <p className="text-gray-600 mt-2">{phase.description}</p>
                                    )}

                                    {/* Error Section */}
                                    {phase.status === 'Error' && phase.errors && phase.errors.length > 0 && (
                                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                            <h4 className="text-sm font-black text-red-600 uppercase tracking-wider mb-2">Fix Following Errors:</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {phase.errors.map((error, eIdx) => (
                                                    <li key={eIdx} className="text-sm text-red-700 font-medium">
                                                        {error.message}
                                                        {error.evidence && (
                                                            <a href={error.evidence} target="_blank" rel="noopener noreferrer" className="ml-2 text-[10px] bg-red-200 px-2 py-0.5 rounded hover:bg-red-300 transition-colors">VIEW EVIDENCE</a>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3 mt-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getPhaseStatusColor(phase.status)}`}>
                                            {phase.status === 'Completed (Dev)' ? 'Waiting for SQA' : phase.status}
                                        </span>
                                        {phase.deadline && (
                                            <span className="flex items-center space-x-1 text-xs text-gray-500">
                                                <Calendar size={12} />
                                                <span>Deadline: {phase.deadline}</span>
                                            </span>
                                        )}
                                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                                            <CheckCircle2 size={12} />
                                            <span>SQA: {phase.sqa?.name || 'Assigned'}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    {phase.status === 'Pending' && (
                                        <button
                                            onClick={() => handleUpdatePhaseStatus(phase.project._id, phase.name, 'Working')}
                                            className="flex items-center space-x-2 px-6 py-2.5 bg-[#373833] text-white rounded-xl hover:bg-[#fa2742] transition-all active:scale-95 shadow-lg"
                                        >
                                            <PlayCircle size={18} />
                                            <span className="font-bold text-xs uppercase tracking-widest">Start</span>
                                        </button>
                                    )}
                                    {phase.status === 'Error' && (
                                        <button
                                            onClick={() => handleUpdatePhaseStatus(phase.project._id, phase.name, 'Working')}
                                            className="flex items-center space-x-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all active:scale-95 shadow-lg"
                                        >
                                            <PlayCircle size={18} />
                                            <span className="font-bold text-xs uppercase tracking-widest">Start Fixing</span>
                                        </button>
                                    )}
                                    {phase.status === 'Working' && (
                                        <button
                                            onClick={() => handleUpdatePhaseStatus(phase.project._id, phase.name, 'Completed (Dev)')}
                                            className="flex items-center space-x-2 px-6 py-2.5 bg-[#fa2742] text-white rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg"
                                        >
                                            <CheckCircle size={18} />
                                            <span className="font-bold text-xs uppercase tracking-widest">Complete</span>
                                        </button>
                                    )}
                                    {phase.status === 'Completed (Dev)' && (
                                        <span className="px-5 py-2.5 bg-neutral-100 text-neutral-500 rounded-xl font-bold text-xs uppercase tracking-widest border border-neutral-200">
                                            Under SQA Review
                                        </span>
                                    )}
                                    {phase.status === 'Under SQA' && (
                                        <span className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest border border-blue-100">
                                            SQA Debugging...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPrioritySectionForTasks = (title, items) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 mb-2">
                    <div className={clsx(
                        "w-2 h-6 rounded-full",
                        title === 'High' ? "bg-[#fa2742]" : title === 'Medium' ? "bg-blue-500" : "bg-gray-400"
                    )} />
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#373833]/60 italic">
                        {title} Priority Regular Tasks
                    </h3>
                </div>
                <div className="space-y-4">
                    {items.map(task => (
                        <div key={task._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Layout size={16} className="text-[#373833]/40" />
                                        <span className="text-sm font-bold text-[#373833]/60">
                                            {task.project?.title || 'No Project'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-bold text-[#373833]">{task.title}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-2">{task.description}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="flex items-center space-x-1">
                                            <Clock size={14} />
                                            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    {task.status === 'Todo' && (
                                        <button
                                            onClick={() => handleStartTask(task._id)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                                        >
                                            <PlayCircle size={18} />
                                            <span className="font-bold text-sm">Start</span>
                                        </button>
                                    )}
                                    {(task.status === 'In Progress' || task.status === 'In Review') && (
                                        <button
                                            onClick={() => handleCompleteTask(task._id)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                                        >
                                            <CheckCircle size={18} />
                                            <span className="font-bold text-sm">Complete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-[#373833]">Assigned Tasks</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-[#373833]/60">
                        {sortedPhases.length} project phases
                    </span>
                    <span className="text-sm text-[#373833]/60">
                        {sortedTasks.length} regular tasks
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-[#373833]/40 font-medium italic">
                    Loading...
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Project Phases Section */}
                    {sortedPhases.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-[#373833] mb-6 flex items-center space-x-2 pb-2 border-b-2 border-[#373833]/5">
                                <Layout size={20} />
                                <span>Project Phases</span>
                            </h2>
                            {(() => {
                                const groupedPhases = groupTasksByPriority(sortedPhases);
                                return (
                                    <>
                                        {renderPrioritySection('High', groupedPhases.High, 'Phase')}
                                        {renderPrioritySection('Medium', groupedPhases.Medium, 'Phase')}
                                        {renderPrioritySection('Low', groupedPhases.Low, 'Phase')}
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* Regular Tasks Section */}
                    {sortedTasks.length > 0 && (
                        <div className="pt-8">
                            <h2 className="text-xl font-bold text-[#373833] mb-6 flex items-center space-x-2 pb-2 border-b-2 border-[#373833]/5">
                                <CheckCircle2 size={20} />
                                <span>Regular Tasks</span>
                            </h2>
                            {(() => {
                                const groupedTasks = groupTasksByPriority(sortedTasks);
                                return (
                                    <>
                                        {renderPrioritySectionForTasks('High', groupedTasks.High)}
                                        {renderPrioritySectionForTasks('Medium', groupedTasks.Medium)}
                                        {renderPrioritySectionForTasks('Low', groupedTasks.Low)}
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* Empty State */}
                    {sortedPhases.length === 0 && sortedTasks.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <CheckCircle size={48} className="text-green-500" />
                                <p className="text-[#373833]/60 font-medium">No assigned tasks. Great job!</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignedTasks;
