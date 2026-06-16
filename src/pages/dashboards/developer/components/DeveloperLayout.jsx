import React from 'react';
import { Outlet } from 'react-router-dom';
import DeveloperSidebar from './DeveloperSidebar';
import DeveloperTopbar from './DeveloperTopbar';

const DeveloperLayout = () => {
    return (
        <div className="flex h-screen bg-[#e8eae3]">
            <DeveloperSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DeveloperTopbar />
                <main className="flex-1 overflow-y-auto p-8 bg-[#e8eae3]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DeveloperLayout;
