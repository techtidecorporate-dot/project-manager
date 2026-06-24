import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    MessageCircleQuestion,
    Receipt,
    Settings,
    LogOut,
    ShieldCheck,
    Flag,
    Package,
    MessageSquare,
    X
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import clsx from 'clsx';

const ClientSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const [isScrolled, setIsScrolled] = React.useState(false);

    const handleScroll = (e) => {
        setIsScrolled(e.target.scrollTop > 0);
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/client' },
        { icon: Briefcase, label: 'My Projects', path: '/client/projects' },
        { icon: Flag, label: 'Milestones', path: '/client/milestones' },
        { icon: Package, label: 'Deliverables', path: '/client/deliverables' },
        { icon: MessageSquare, label: 'Discussions', path: '/client/discussions' },
        { icon: MessageCircleQuestion, label: 'Support Tickets', path: '/client/tickets' },
        { icon: Receipt, label: 'Invoices', path: '/client/invoices' },
        { icon: Settings, label: 'Settings', path: '/client/settings' }
    ];

    const sidebarContent = (
        <>
            <div className={clsx(
                "p-4 md:p-6 border-b flex items-center space-x-3 transition-all duration-300 shrink-0",
                isScrolled ? "border-[#453abc] shadow-sm" : "border-transparent"
            )}>
                <div className="w-10 h-10 bg-[#453abc] rounded-xl flex items-center justify-center shadow-lg shadow-[#453abc] shrink-0">
                    <ShieldCheck className="text-[#191a23]" size={24} />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">TechTide</span>
            </div>

            <nav
                className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 scrollbar-hide"
                onScroll={handleScroll}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {navItems.map((item) => {
                    const isActive = item.path === '/client'
                        ? location.pathname === item.path
                        : location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                            className={clsx(
                                "flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all font-bold text-sm",
                                isActive
                                    ? "bg-gradient-to-br from-[#453abc] to-[#60c3e3] text-white shadow-lg"
                                    : "text-white hover:text-[#191a23] hover:bg-white"
                            )}
                        >
                            <Icon size={20} className="shrink-0" />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 md:p-4 border-t border-gray-600 shrink-0">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all text-red-400 hover:text-white hover:bg-red-600 w-full font-bold text-sm"
                >
                    <LogOut size={20} className="shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}
            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-600 flex flex-col h-screen overflow-hidden transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="lg:hidden absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        <X size={20} />
                    </button>
                </div>
                {sidebarContent}
            </aside>
        </>
    );
};

export default ClientSidebar;
