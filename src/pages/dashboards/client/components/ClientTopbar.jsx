import React from 'react';
import { Search, ChevronDown, Menu } from 'lucide-react';
import NotificationBell from '@/components/layout/NotificationBell';
import { useAuth } from '../../../../context/AuthContext';
import clsx from 'clsx';

const ClientTopbar = ({ onToggleSidebar }) => {
    const { user } = useAuth();
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={clsx(
            "h-16 lg:h-20 bg-gray-900 flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-20 transition-all duration-300 shrink-0",
            isScrolled ? "shadow-md border-b border-gray-600" : "border-b border-transparent"
        )}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={22} />
                </button>

                <div className="relative flex-1 max-w-full md:max-w-md lg:max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191a23] group-focus-within:text-[#191a23] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects, invoices..."
                        className="w-full bg-white border border-[#191a23] rounded-2xl py-2.5 lg:py-3 pl-11 pr-5 outline-none focus:ring-2 focus:ring-[#453abc] focus:border-[#453abc] transition-all text-sm text-[#191a23] placeholder:text-[#191a23]/70 font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-5 lg:space-x-6 shrink-0">
                <NotificationBell />

                <div className="flex items-center space-x-2 md:space-x-3 pl-3 md:pl-5 border-l border-[#453abc]/20">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs lg:text-sm font-extrabold text-white leading-none mb-0.5 lg:mb-1 truncate max-w-[120px]">{user?.name || 'Valued Client'}</p>
                        <p className="text-[8px] lg:text-[9px] font-semibold text-white/70 uppercase tracking-[0.2em] leading-none">{user?.role || 'Client'}</p>
                    </div>
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.name || 'Client'}&background=453abc&color=ffffff`}
                        alt={user?.name}
                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl object-cover shrink-0"
                    />
                    <ChevronDown size={14} className="text-[#191a23]/60 hidden sm:block" />
                </div>
            </div>
        </header>
    );
};

export default ClientTopbar;
