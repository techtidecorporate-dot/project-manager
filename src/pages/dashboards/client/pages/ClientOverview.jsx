import React from 'react';
import { Briefcase, Receipt, Clock, ArrowRight, MessageCircle } from 'lucide-react';

const ClientOverview = () => {
    // Mock data for client dashboard
    const stats = [
        { label: 'Active Projects', value: '2', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Pending Invoices', value: '$4,500', icon: Receipt, color: 'text-red-600', bg: 'bg-red-100' },
        { label: 'Hours Used', value: '142/200', icon: Clock, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    const activeProject = {
        name: 'E-Commerce Platform Redesign',
        progress: 75,
        status: 'In Development',
        nextMilestone: 'Beta Release - Nov 15th'
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#373833]">Welcome back, Future Corp!</h1>
                    <p className="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
                </div>
                <button className="px-6 py-3 bg-[#fa2742] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <MessageCircle size={20} />
                    <span>Contact Project Manager</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-2xl font-black text-[#373833]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Main Active Project Status */}
                <div className="bg-white p-8 rounded-[32px] shadow-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#373833]">Current Project Status</h2>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-[#373833] mb-2">{activeProject.name}</h3>
                        <p className="text-gray-500 text-sm">Next Milestone: <span className="font-bold text-[#fa2742]">{activeProject.nextMilestone}</span></p>
                    </div>

                    <div className="space-y-2 mb-8">
                        <div className="flex justify-between text-sm font-bold text-gray-600">
                            <span>Progress</span>
                            <span>{activeProject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                            <div className="bg-[#fa2742] h-full rounded-full transition-all duration-1000" style={{ width: `${activeProject.progress}%` }}></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold">Phase</p>
                            <p className="font-bold text-[#373833]">Development</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold">Estimated Delivery</p>
                            <p className="font-bold text-[#373833]">Dec 20, 2023</p>
                        </div>
                    </div>
                </div>

                {/* Notifications / Recent Activity */}
                <div className="bg-[#373833] p-8 rounded-[32px] shadow-lg text-[#e8eae3]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-[#fa2742]" />
                        Recent Updates
                    </h2>

                    <div className="space-y-6">
                        {[
                            { time: '2 hours ago', text: 'New design mockups uploaded for review.', type: 'Design' },
                            { time: 'Yesterday', text: 'Weekly progress report available.', type: 'Report' },
                            { time: '2 days ago', text: 'Invoice #INV-2023-001 created.', type: 'Billing' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 group cursor-pointer">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-[#fa2742]"></div>
                                    <div className="w-0.5 h-full bg-[#fa2742]/20 my-1 group-last:hidden"></div>
                                </div>
                                <div>
                                    <p className="text-xs text-[#fa2742] font-bold uppercase tracking-wider mb-1">{item.type} • {item.time}</p>
                                    <p className="font-medium text-gray-300 group-hover:text-white transition-colors">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-8 w-full py-4 rounded-xl border border-[#fa2742]/30 hover:bg-[#fa2742]/10 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                        View All Activity <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientOverview;
