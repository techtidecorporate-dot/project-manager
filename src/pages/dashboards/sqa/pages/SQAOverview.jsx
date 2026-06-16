import React, { useState } from 'react';
import { Play, Pause, MessageSquare, Bug, ClipboardCheck, AlertTriangle } from 'lucide-react';

const SQAOverview = () => {
    const [isWorking, setIsWorking] = useState(false);
    const [startTime, setStartTime] = useState(null);

    const handleToggleWork = () => {
        if (!isWorking) {
            setStartTime(new Date());
            setIsWorking(true);
        } else {
            setIsWorking(false);
            setStartTime(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#373833]">SQA Dashboard</h1>

            {/* Attendance & Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-[#373833] mb-4">Attendance</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Current Status</p>
                            <p className={`text-lg font-bold ${isWorking ? 'text-green-600' : 'text-gray-600'}`}>
                                {isWorking ? 'Testing Active' : 'Not Working'}
                            </p>
                            {startTime && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Started at: {startTime.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleToggleWork}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isWorking
                                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                    : 'bg-[#fa2742] text-white shadow-lg shadow-red-200 hover:shadow-red-300'
                                }`}
                        >
                            {isWorking ? (
                                <>
                                    <Pause size={20} />
                                    <span>Clock Out</span>
                                </>
                            ) : (
                                <>
                                    <Play size={20} />
                                    <span>Clock In</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-[#373833] mb-4">Internal Chat</h2>
                    <div className="h-32 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200">
                        <MessageSquare size={32} className="mb-2 opacity-50" />
                        <p className="text-sm font-medium">No new messages</p>
                        <button className="mt-4 text-[#fa2742] text-sm font-bold hover:underline">
                            Open Chat
                        </button>
                    </div>
                </div>
            </div>

            {/* QA-Specific Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <Bug size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Critical Bugs</p>
                        <p className="text-2xl font-bold text-[#373833]">3</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <ClipboardCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Test Cases</p>
                        <p className="text-2xl font-bold text-[#373833]">24/28</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Review</p>
                        <p className="text-2xl font-bold text-[#373833]">5</p>
                    </div>
                </div>
            </div>

            {/* Work Given / Current Tasks */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-[#373833] mb-6">Current Testing Tasks</h2>
                <div className="space-y-4">
                    {/* Placeholder tasks */}
                    {[1, 2].map((i) => (
                        <div key={i} className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-gray-50/50">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-[#373833]">Security Kernel Stress Test</h3>
                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-lg font-bold">
                                    In Progress
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                                Run the full suite of penetration tests on the new authentication module.
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Due: Today</span>
                                <span>Priority: Critical</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SQAOverview;
