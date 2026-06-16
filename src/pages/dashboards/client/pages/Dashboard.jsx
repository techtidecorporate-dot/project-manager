import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { CheckCircle, Clock, Sparkles, ArrowRight } from 'lucide-react';

const ClientDashboard = () => {
    const { user } = useAuth();
    const clientName = user?.name || 'Valued Client';

    // Mock data for the latest completed task
    const latestTask = {
        title: 'Homepage Hero Section Animation',
        completedDate: 'Today, 10:30 AM',
        project: 'E-Commerce Redesign',
        description: 'Implemented the new GSAP animation for the hero banner. Mobile responsiveness verified.',
        developer: 'Alex Dev',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-10">
            {/* Welcoming Header */}
            <div className="bg-gradient-to-r from-[#fa2742] to-[#ff6b6b] rounded-[40px] p-10 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Welcome back, <br />
                        <span className="text-[#373833]">{clientName}!</span>
                    </h1>
                    <p className="text-white/90 text-lg font-medium max-w-xl">
                        We're making great progress on your projects. Here is the latest update from our team.
                    </p>
                </div>
            </div>

            {/* Latest Task Done Section */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-[#fa2742]" size={24} />
                    <h2 className="text-2xl font-bold text-[#373833]">Latest Accomplishment</h2>
                </div>

                <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row group hover:shadow-2xl transition-all duration-300">
                    {/* Visual Preview */}
                    <div className="md:w-1/3 bg-gray-100 relative min-h-[200px] overflow-hidden">
                        <img
                            src={latestTask.thumbnail}
                            alt="Task Preview"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <CheckCircle size={12} /> Completed
                            </span>
                        </div>
                    </div>

                    {/* Task Details */}
                    <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
                            <Clock size={12} />
                            <span>{latestTask.completedDate}</span>
                            <span>•</span>
                            <span className="text-[#fa2742]">{latestTask.project}</span>
                        </div>

                        <h3 className="text-2xl font-bold text-[#373833] mb-4 group-hover:text-[#fa2742] transition-colors">
                            {latestTask.title}
                        </h3>

                        <p className="text-gray-500 leading-relaxed mb-8">
                            {latestTask.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-md overflow-hidden">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${latestTask.developer}&background=373833&color=fff`}
                                        alt={latestTask.developer}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-bold uppercase">Completed by</span>
                                    <span className="text-sm font-bold text-[#373833]">{latestTask.developer}</span>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 text-[#fa2742] font-bold text-sm group/btn hover:gap-3 transition-all">
                                View Full History <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#f0e4d4]/30 p-6 rounded-2xl border border-[#f0e4d4] text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Project Status</p>
                    <p className="text-xl font-black text-green-600">On Track</p>
                </div>
                <div className="bg-[#f0e4d4]/30 p-6 rounded-2xl border border-[#f0e4d4] text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Next Milestone</p>
                    <p className="text-xl font-black text-[#373833]">Nov 15</p>
                </div>
                <div className="bg-[#f0e4d4]/30 p-6 rounded-2xl border border-[#f0e4d4] text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Open Tickets</p>
                    <p className="text-xl font-black text-[#373833]">0</p>
                </div>
                <div className="bg-[#f0e4d4]/30 p-6 rounded-2xl border border-[#f0e4d4] text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-xl font-black text-[#373833]">$12.5k</p>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
