import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-brand-bg overflow-hidden font-growtext">
            {/* Sidebar - Left Side */}
            <Sidebar />
            
            {/* Right Section - Navbar and Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Navbar - Top */}
                <Topbar />
                
                {/* Content Box - Main Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-brand-bg text-[#373833]">
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
