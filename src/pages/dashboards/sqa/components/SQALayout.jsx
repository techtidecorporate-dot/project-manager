import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SQASidebar from './SQASidebar';
import SQATopbar from './SQATopbar';

const SQALayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#ffffff] overflow-hidden">
            <SQASidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <SQATopbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#ffffff]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SQALayout;
