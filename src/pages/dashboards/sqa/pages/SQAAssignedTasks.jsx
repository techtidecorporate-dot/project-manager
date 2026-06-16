import React, { useState, useEffect } from 'react';
import {
    PlayCircle,
    CheckCircle,
    Clock,
    Layout,
    CheckCircle2,
    Calendar,
    X,
    AlertCircle,
    Plus,
    Trash2,
    Upload
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../../../context/AuthContext';

const SQAAssignedTasks = () => {
    const { user: currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Error Reporting Modal state
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [selectedPhase, setSelectedPhase] = useState(null);
    const [errorList, setErrorList] = useState([{ message: '', evidence: '' }]);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            const projectsRes = await fetch('http://localhost:5000/api/projects', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const projectsData = await projectsRes.json();
            setProjects(projectsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    // Get all phases assigned to this SQA
    const getAssignedPhases = () => {
        const assignedPhases = [];
        projects.forEach(project => {
            if (project.phases && project.phases.length > 0) {
                project.phases.forEach(phase => {
                    const sqaId = phase.sqa?._id || phase.sqa;
                    const sqaName = phase.sqa?.name || (typeof phase.sqa === 'object' ? phase.sqa.name : '');
                    const isMatch = sqaId === currentUser._id || sqaName.toLowerCase() === currentUser.name?.toLowerCase();

                    // Show phases that are ready for SQA (Completed (Dev), Under SQA)
                    // Once marked as 'Error', it moves out of Assigned to Completed (for SQA)
                    if (isMatch && ['Completed (Dev)', 'Under SQA'].includes(phase.status)) {
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

    const handleUpdatePhaseStatus = async (projectId, phaseName, newStatus, errors = null) => {
        try {
            const project = projects.find(p => p._id === projectId);
            if (!project) return;

            const updatedPhases = project.phases.map(phase => {
                if (phase.name === phaseName) {
                    const updatedPhase = { ...phase, status: newStatus };
                    if (errors !== null) {
                        updatedPhase.errors = errors;
                    }
                    return updatedPhase;
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
                fetchData();
                setIsErrorModalOpen(false);
                setSelectedPhase(null);
                setErrorList([{ message: '', evidence: '' }]);
            }
        } catch (error) {
            console.error('Error updating phase status:', error);
        }
    };

    const openErrorModal = (phase) => {
        setSelectedPhase(phase);
        setErrorList(phase.errors && phase.errors.length > 0
            ? phase.errors.map(err => ({
                name: err.name || '',
                message: err.message || '',
                evidence: err.evidence || ''
            }))
            : [{ name: '', message: '', evidence: '' }]);
        setIsErrorModalOpen(true);
    };

    const addErrorField = () => {
        setErrorList([...errorList, { name: '', message: '', evidence: '' }]);
    };

    const removeErrorField = (index) => {
        const newList = [...errorList];
        newList.splice(index, 1);
        setErrorList(newList);
    };

    const handleErrorChange = (index, field, value) => {
        const newList = [...errorList];
        newList[index][field] = value;
        setErrorList(newList);
    };

    const assignedPhases = getAssignedPhases();

    const sortedPhases = [...assignedPhases].sort((a, b) => {
        const priorityOrderMap = { 'High': 0, 'Medium': 1, 'Low': 2 };
        const statusOrderMap = { 'Under SQA': 0, 'Completed (Dev)': 1 };

        const pA = priorityOrderMap[a.priority] ?? 1;
        const pB = priorityOrderMap[b.priority] ?? 1;

        if (pA !== pB) return pA - pB;
        return (statusOrderMap[a.status] ?? 2) - (statusOrderMap[b.status] ?? 2);
    });

    const getPhaseStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Completed (Dev)': return 'bg-emerald-100 text-emerald-700';
            case 'Under SQA': return 'bg-blue-100 text-blue-700';
            case 'Error': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const groupPhasesByPriority = (items) => {
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

    const renderPrioritySection = (title, items) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="space-y-6 mb-12">
                <div className="flex items-center space-x-3 mb-4">
                    <div className={clsx(
                        "w-2 h-8 rounded-full",
                        title === 'High' ? "bg-[#fa2742]" : title === 'Medium' ? "bg-blue-500" : "bg-gray-400"
                    )} />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#373833]/60 italic">
                        {title} Priority Review Queue
                    </h3>
                </div>
                <div className="space-y-6">
                    {items.map((phase, idx) => (
                        <div key={idx} className="bg-white overflow-hidden rounded-[32px] shadow-xl border border-[#373833]/5 transition-all hover:shadow-2xl">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-[#fa2742]">
                                            <Layout size={14} />
                                            <span>{phase.project?.title}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-[#373833]">{phase.name}</h3>
                                        <div className="flex items-center space-x-4 mt-2">
                                            <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-lg ${getPhaseStatusColor(phase.status)}`}>
                                                {phase.status === 'Completed (Dev)' ? 'Ready for SQA' : phase.status}
                                            </span>
                                            <div className="flex items-center space-x-1 text-xs text-[#373833]/60 font-bold">
                                                <Calendar size={14} />
                                                <span>Target: {phase.deadline}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs text-[#373833]/60 font-bold">
                                                <CheckCircle2 size={14} />
                                                <span>Dev: {phase.developer?.name || 'Assigned'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        {phase.status === 'Completed (Dev)' && (
                                            <button
                                                onClick={() => handleUpdatePhaseStatus(phase.project._id, phase.name, 'Under SQA')}
                                                className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#373833] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#fa2742] transition-all active:scale-95 shadow-lg"
                                            >
                                                <PlayCircle size={18} />
                                                <span>Start Debugging</span>
                                            </button>
                                        )}
                                        {phase.status === 'Under SQA' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdatePhaseStatus(phase.project._id, phase.name, 'Completed')}
                                                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-600 transition-all active:scale-95 shadow-lg"
                                                >
                                                    <CheckCircle size={18} />
                                                    <span>Approve Phase</span>
                                                </button>
                                                <button
                                                    onClick={() => openErrorModal(phase)}
                                                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-lg"
                                                >
                                                    <AlertCircle size={18} />
                                                    <span>Reject Work</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {phase.description && (
                                    <p className="text-[#373833]/70 bg-[#f5f5f5] p-4 rounded-2xl text-sm italic border border-[#373833]/5 mb-6">
                                        "{phase.description}"
                                    </p>
                                )}

                                {phase.status === 'Error' && phase.errors && phase.errors.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black uppercase text-red-500 tracking-widest">Reported Issues:</h4>
                                        <div className="grid gap-2">
                                            {phase.errors.map((err, eIdx) => (
                                                <div key={eIdx} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                        <span className="text-sm font-medium text-red-700">{err.message}</span>
                                                    </div>
                                                    {err.evidence && (
                                                        <a href={err.evidence} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-red-200 px-2 py-1 rounded text-red-800 font-black hover:bg-red-300">
                                                            EVIDENCE
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#373833]">SQA Review Center</h1>
                    <p className="text-[#373833]/60 font-medium">Debug and approve completed developer work.</p>
                </div>
                <div className="bg-[#373833]/5 px-4 py-2 rounded-xl">
                    <span className="text-sm font-bold text-[#373833]">
                        {sortedPhases.length} Phases Pending Review
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-[#373833]/20 italic font-medium">Loading review tasks...</div>
            ) : sortedPhases.length > 0 ? (
                <div>
                    {(() => {
                        const grouped = groupPhasesByPriority(sortedPhases);
                        return (
                            <>
                                {renderPrioritySection('High', grouped.High)}
                                {renderPrioritySection('Medium', grouped.Medium)}
                                {renderPrioritySection('Low', grouped.Low)}
                            </>
                        );
                    })()}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-[#373833]/10">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <CheckCircle size={64} className="text-[#373833]/10" />
                        <h3 className="text-xl font-bold text-[#373833]/40 tracking-tight">Queue is Empty</h3>
                        <p className="text-sm text-[#373833]/30 max-w-xs mx-auto font-medium">Work will appear here when developers complete their assigned phases.</p>
                    </div>
                </div>
            )}

            {/* Error Reporting Modal */}
            {isErrorModalOpen && (
                <div className="fixed inset-0 bg-[#373833]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-[#373833]">Report Errors</h3>
                                <p className="text-sm text-[#373833]/50 font-medium">Phase: {selectedPhase?.name}</p>
                            </div>
                            <button
                                onClick={() => setIsErrorModalOpen(false)}
                                className="p-2 bg-[#f5f5f5] rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                            {errorList.map((error, index) => (
                                <div key={index} className="p-6 bg-[#f9fafb] rounded-[32px] border border-[#373833]/5 relative group">
                                    <div className="grid gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#373833]/40 ml-1">Error Name</label>
                                            <input
                                                type="text"
                                                value={error.name}
                                                onChange={(e) => handleErrorChange(index, 'name', e.target.value)}
                                                className="w-full bg-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-[#373833] text-sm border border-transparent shadow-sm"
                                                placeholder="e.g. Broken Login Button"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#373833]/40 ml-1">Description</label>
                                            <textarea
                                                value={error.message}
                                                onChange={(e) => handleErrorChange(index, 'message', e.target.value)}
                                                className="w-full bg-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-medium text-[#373833] text-sm resize-none border border-transparent shadow-sm"
                                                rows="2"
                                                placeholder="Describe what's wrong..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#373833]/40 ml-1">Evidence URL / Image Path</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={error.evidence}
                                                    onChange={(e) => handleErrorChange(index, 'evidence', e.target.value)}
                                                    className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-medium text-[#373833] text-sm border border-transparent shadow-sm"
                                                    placeholder="Link to image/video evidence..."
                                                />
                                                <Upload className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#373833]/30" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    {errorList.length > 1 && (
                                        <button
                                            onClick={() => removeErrorField(index)}
                                            className="absolute -top-2 -right-2 p-2 bg-white text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addErrorField}
                            className="mt-6 w-full py-4 border-2 border-dashed border-[#373833]/10 rounded-2xl flex items-center justify-center space-x-2 text-[#373833]/40 font-bold hover:border-[#fa2742] hover:text-[#fa2742] transition-all group"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            <span>Add Another Error Item</span>
                        </button>

                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsErrorModalOpen(false)}
                                className="py-4 bg-[#f5f5f5] text-[#373833] font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-[#e5e5e5] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdatePhaseStatus(selectedPhase.project._id, selectedPhase.name, 'Error', errorList.filter(e => e.name.trim() || e.message.trim()))}
                                className="py-4 bg-[#fa2742] text-[#373833] font-black rounded-2xl uppercase tracking-widest text-xs hover:opacity-90 shadow-xl transition-all active:scale-95"
                            >
                                Confirm & Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SQAAssignedTasks;
