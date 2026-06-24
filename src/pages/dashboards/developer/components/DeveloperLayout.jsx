import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DeveloperSidebar from './DeveloperSidebar';
import DeveloperTopbar from './DeveloperTopbar';

const DeveloperLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#ffffff] overflow-hidden">
            <DeveloperSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DeveloperTopbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#ffffff]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DeveloperLayout;
