import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    MessageCircleQuestion,
    Receipt,
    Settings,
    LogOut,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import clsx from 'clsx';

const ClientSidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const [isScrolled, setIsScrolled] = React.useState(false);

    const handleScroll = (e) => {
        setIsScrolled(e.target.scrollTop > 0);
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/client' },
        { icon: Briefcase, label: 'My Projects', path: '/client/projects' },
        { icon: MessageCircleQuestion, label: 'Support Tickets', path: '/client/tickets' },
        { icon: Receipt, label: 'Invoices', path: '/client/invoices' },
        { icon: Settings, label: 'Settings', path: '/client/settings' }
    ];

    return (
        <aside className="w-64 bg-[#373833] border-r border-[#fa2742] flex flex-col h-screen overflow-hidden">
            <div className={clsx(
                "p-6 border-b flex items-center space-x-3 transition-all duration-300",
                isScrolled ? "border-[#fa2742] shadow-sm" : "border-transparent"
            )}>
                <div className="w-10 h-10 bg-[#fa2742] rounded-xl flex items-center justify-center shadow-lg shadow-[#fa2742]">
                    <ShieldCheck className="text-[#373833]" size={24} />
                </div>
                <span className="text-xl font-bold text-[#e8eae3] tracking-tight">TechTide</span>
            </div>

            <nav
                className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
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
                            className={clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                                isActive
                                    ? "bg-[#fa2742] text-white shadow-lg"
                                    : "text-[#e8eae3] hover:text-[#373833] hover:bg-[#e8eae3]"
                            )}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#fa2742]">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-[#e8eae3] hover:text-white hover:bg-[#fa2742] w-full font-bold text-sm"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default ClientSidebar;
