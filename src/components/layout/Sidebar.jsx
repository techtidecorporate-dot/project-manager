import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    BarChart3,
    Settings,
    LogOut,
    ShieldCheck,
    UserPlus,
    MessageSquare
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = React.useState(false);

    const handleScroll = (e) => {
        setIsScrolled(e.target.scrollTop > 0);
    };

    const getNavItems = () => {
        const baseItems = [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { icon: FolderKanban, label: 'Projects', path: '/projects' },
        ];

        // For admin users, show both "Add Users" and "Tasks"
        if (user?.role === ROLES.ADMIN) {
            baseItems.push(
                { icon: UserPlus, label: 'Add Users', path: '/add-users' },
                { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
                { icon: MessageSquare, label: 'Requests', path: '/requests' }
            );
        } else {
            baseItems.push({ icon: CheckSquare, label: 'Tasks', path: '/tasks' });
        }

        baseItems.push(
            { icon: Users, label: 'Team', path: '/team' },
            { icon: BarChart3, label: 'Reports', path: '/reports' },
            { icon: Settings, label: 'Settings', path: '/settings' }
        );

        return baseItems;
    };

    const navItems = getNavItems();

    return (
        <aside className="w-64 bg-gray-900 border-r border-[#60c3e3] flex flex-col h-screen overflow-hidden">
            <div className={clsx(
                "p-6 border-b flex items-center space-x-3 transition-all duration-300",
                isScrolled ? "border-[#60c3e3] shadow-sm" : "border-transparent"
            )}>
                <div className="w-10 h-10 bg-gradient-to-br from-[#453abc] to-[#60c3e3] rounded-xl flex items-center justify-center shadow-lg shadow-[#453abc]/50">
                    <ShieldCheck className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">TechTide</span>
            </div>

            <nav
                className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
                onScroll={handleScroll}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                                isActive
                                    ? "bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white shadow-lg"
                                    : "text-[#60c3e3] hover:text-[#453abc] hover:bg-[#453abc]/10"
                            )}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#60c3e3]/20">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-[#60c3e3] hover:text-white hover:bg-[#d4183d] w-full font-bold text-sm"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

