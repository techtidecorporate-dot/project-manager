[{
	"resource": "/e:/Techtide/Project_Manager-main/Project_Manager-main/src/pages/dashboards/admin/pages/AddUsers.jsx",
	"owner": "eslint2",
	"code": {
		"value": "no-unused-vars",
		"target": {
			"$mid": 1,
			"path": "/docs/latest/rules/no-unused-vars",
			"scheme": "https",
			"authority": "eslint.org"
		}
	},
	"severity": 8,
	"message": "'showPassword' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u.",
	"source": "eslint",
	"startLineNumber": 9,
	"startColumn": 12,
	"endLineNumber": 9,
	"endColumn": 24,
	"modelVersionId": 9,
	"tags": [
		1
	],
	"origin": "extHost1"
},{
	"resource": "/e:/Techtide/Project_Manager-main/Project_Manager-main/src/pages/dashboards/admin/pages/AddUsers.jsx",
	"owner": "eslint2",
	"code": "react-hooks/immutability",
	"severity": 8,
	"message": "Error: Cannot access variable before it is declared\n\n`fetchUsers` is accessed before it is declared, which prevents the earlier access from updating when this value changes over time.\n\n  23 |     useEffect(() => {\n  24 |         if (currentUser) {\n> 25 |             fetchUsers();\n     |             ^^^^^^^^^^ `fetchUsers` accessed before it is declared\n  26 |         }\n  27 |     }, [currentUser]);\n  28 |\n\n  27 |     }, [currentUser]);\n  28 |\n> 29 |     const fetchUsers = async () => {\n     |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 30 |         try {\n     | ^^^^^^^^^^^^^\n> 31 |             const response = await fetch('http://localhost:5000/api/auth/users', {\n     …\n     | ^^^^^^^^^^^^^\n> 44 |         }\n     | ^^^^^^^^^^^^^\n> 45 |     };\n     | ^^^^^^^ `fetchUsers` is declared here\n  46 |\n  47 |     const handleInputChange = (e) => {\n  48 |         const { name, value } = e.target;",
	"source": "eslint",
	"startLineNumber": 25,
	"startColumn": 13,
	"endLineNumber": 25,
	"endColumn": 23,
	"modelVersionId": 9,
	"origin": "extHost1"
},{
	"resource": "/e:/Techtide/Project_Manager-main/Project_Manager-main/src/pages/dashboards/admin/pages/AddUsers.jsx",
	"owner": "eslint2",
	"code": {
		"value": "no-unused-vars",
		"target": {
			"$mid": 1,
			"path": "/docs/latest/rules/no-unused-vars",
			"scheme": "https",
			"authority": "eslint.org"
		}
	},
	"severity": 8,
	"message": "'togglePasswordVisibility' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u.",
	"source": "eslint",
	"startLineNumber": 100,
	"startColumn": 11,
	"endLineNumber": 100,
	"endColumn": 35,
	"modelVersionId": 9,
	"tags": [
		1
	],
	"origin": "extHost1"
},{
	"resource": "/e:/Techtide/Project_Manager-main/Project_Manager-main/src/pages/dashboards/admin/pages/AddUsers.jsx",
	"owner": "eslint2",
	"code": {
		"value": "react-hooks/exhaustive-deps",
		"target": {
			"$mid": 1,
			"path": "/facebook/react/issues/14920",
			"scheme": "https",
			"authority": "github.com"
		}
	},
	"severity": 4,
	"message": "React Hook useEffect has a missing dependency: 'fetchUsers'. Either include it or remove the dependency array.",
	"source": "eslint",
	"startLineNumber": 27,
	"startColumn": 8,
	"endLineNumber": 27,
	"endColumn": 21,
	"modelVersionId": 9,
	"origin": "extHost1"
}]
import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, FileText, Send, Clock, Inbox } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const NotificationBell = () => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        if (user && user.token) {
            fetchNotifications(controller.signal);
            const interval = setInterval(() => fetchNotifications(controller.signal), 60000);
            return () => {
                controller.abort();
                clearInterval(interval);
            };
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async (signal) => {
        try {
            if (!user?.token) return;

            const response = await fetch('http://localhost:5000/api/notifications', {
                signal,
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            if (response.status === 401) {
                console.warn('Unauthorized access to notifications. Logging out...');
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(`Notification fetch failed with status: ${response.status}`);
            }

            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('http://localhost:5000/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        if (notification.link) {
            navigate(notification.link);
        }
        setIsOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type) => {
        switch (type) {
            case 'INVOICE': return <FileText size={14} className="text-blue-500" />;
            case 'REQUEST': return <Send size={14} className="text-[#453abc]" />;
            case 'TASK': return <Clock size={14} className="text-orange-500" />;
            default: return <Inbox size={14} className="text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-[#60c3e3] hover:text-[#453abc] hover:bg-white/5 rounded-xl transition-all"
            >
                <Bell size={22} className={clsx(unreadCount > 0 && "animate-pulse")} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-[#453abc] text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#191a23]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#191a23]">Core Notifications</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-[9px] font-black text-[#453abc] uppercase tracking-tighter hover:underline"
                            >
                                Mark All Read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={clsx(
                                            "p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-4",
                                            !n.isRead && "bg-blue-50/20"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[11px] font-black text-[#191a23] uppercase leading-tight">{n.title}</p>
                                            <p className="text-[10px] text-[#191a23]/60 font-bold line-clamp-2">{n.message}</p>
                                            <p className="text-[8px] text-[#191a23]/30 font-black uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={8} />
                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 bg-[#453abc] rounded-full mt-2"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Inbox size={32} className="mx-auto text-gray-200 mb-3" />
                                <p className="text-[10px] font-black text-[#191a23]/30 uppercase tracking-[0.2em]">Silence Detected</p>
                                <p className="text-[9px] text-[#191a23]/20 font-bold mt-1">No new events in this sector</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
                        <button className="text-[9px] font-black text-[#191a23]/40 uppercase tracking-widest hover:text-[#453abc] transition-colors">
                            Archive History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
