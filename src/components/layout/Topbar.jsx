import React from 'react';
import { Search, Menu, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Topbar = () => {
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
            "h-20 bg-[#030213] flex items-center justify-between px-8 sticky top-0 z-30 transition-all duration-300",
            isScrolled ? "shadow-md border-b border-[#60c3e3]" : "border-b border-transparent"
        )}>
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] group-focus-within:text-[#453abc] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-[#e9ebef] border border-[#453abc]/20 rounded-2xl py-3 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#453abc] focus:border-[#453abc] transition-all text-sm text-[#191a23] placeholder:text-[#6b7280] font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <NotificationBell />

                <div className="flex items-center space-x-4 pl-6 border-l border-[#60c3e3]/20">
                    <div className="text-right flex flex-col justify-center">
                        <p className="text-sm font-extrabold text-white leading-none mb-1">{user?.name}</p>
                        <p className="text-[9px] font-semibold text-white/70 uppercase tracking-[0.2em] leading-none">{user?.role}</p>
                    </div>
                    <img
                        src={user?.avatar && user.avatar.trim() !== '' ? user.avatar : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=453abc&color=fff&size=128`}
                        alt={user?.name || 'User'}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/10 shadow-md flex-shrink-0"
                    />
                </div>
            </div>
        </header>
    );
};

export default Topbar;

