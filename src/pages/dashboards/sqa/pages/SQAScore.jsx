import React, { useState, useEffect } from 'react';
import { Star, Award, TrendingUp, Bug, Microscope, Trophy, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const SQAScore = () => {
    const { user } = useAuth();
    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScore = async () => {
            try {
                const token = user?.token;
                if (!token) return;
                const { data } = await axios.get('http://localhost:5000/api/scores/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setScoreData(data);
            } catch (error) {
                console.error('Error fetching score', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchScore();
        }
    }, [user]);

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest">Loading QA Score Data...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-[#373833] mb-6">Quality Assurance Score</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Points Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Award size={64} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold mb-1 opacity-80 uppercase tracking-wider">Quality Points</h3>
                        <div className="text-4xl font-black">{scoreData.totalPoints.toFixed(1)}</div>
                    </div>
                </div>

                {/* Attendance Points */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4 text-emerald-600">
                        <Clock size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Attendance</h3>
                    </div>
                    <div className="text-2xl font-black text-[#373833]">{scoreData.attendancePoints.toFixed(1)} <span className="text-sm font-normal text-gray-400">pts</span></div>
                    <div className="mt-2 text-xs text-gray-500 font-bold">{scoreData.stats.fullAttendanceDays} Full Days</div>
                </div>

                {/* Bug Points (Earned by SQA) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4 text-rose-600">
                        <Bug size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Bugs Found</h3>
                    </div>
                    <div className="text-2xl font-black text-[#373833]">{scoreData.sqaTaskPoints.toFixed(1)} <span className="text-sm font-normal text-gray-400">pts</span></div>
                    <div className="mt-2 text-xs text-gray-500 font-bold">{scoreData.stats.bugsFound} Bugs Reported</div>
                </div>

                {/* Review Points */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4 text-amber-600">
                        <Microscope size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Reviews Done</h3>
                    </div>
                    <div className="text-2xl font-black text-[#373833]">{scoreData.stats.tasksCompleted} <span className="text-sm font-normal text-gray-400">Tasks</span></div>
                    <div className="mt-2 text-xs text-gray-500 font-bold">Verified & Certified</div>
                </div>
            </div>

            {/* Performance Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-[#373833] mb-6 flex items-center gap-2">
                        <TrendingUp size={24} className="text-indigo-600" />
                        Quality Metrics
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2 font-bold text-sm tracking-wide uppercase">
                                <span className="text-gray-500">Bug Detection Rate</span>
                                <span className="text-[#373833]">{scoreData.stats.tasksCompleted > 0 ? ((scoreData.stats.bugsFound / scoreData.stats.tasksCompleted) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${scoreData.stats.tasksCompleted > 0 ? (scoreData.stats.bugsFound / scoreData.stats.tasksCompleted) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2 font-bold text-sm tracking-wide uppercase">
                                <span className="text-gray-500">Workday Stability</span>
                                <span className="text-[#373833]">{scoreData.stats.totalAttendanceDays > 0 ? ((scoreData.stats.fullAttendanceDays / scoreData.stats.totalAttendanceDays) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${scoreData.stats.totalAttendanceDays > 0 ? (scoreData.stats.fullAttendanceDays / scoreData.stats.totalAttendanceDays) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-900 p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                        <Trophy className="text-white" size={32} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Quality Excellence</h3>
                    <p className="text-indigo-200 text-sm mb-6 max-w-xs">Your contribution is vital for the stability and success of every production release.</p>
                    <div className="flex items-center text-yellow-400 gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} fill="currentColor" size={20} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SQAScore;
