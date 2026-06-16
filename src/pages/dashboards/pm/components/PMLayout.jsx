import React from 'react';
import { Outlet } from 'react-router-dom';
import PMSidebar from './PMSidebar';
import PMTopbar from './PMTopbar';

const PMLayout = () => {
    return (
        <div className="flex h-screen bg-[#e8eae3]">
            <PMSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PMTopbar />
                <main className="flex-1 overflow-y-auto p-8 bg-[#e8eae3]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PMLayout;
