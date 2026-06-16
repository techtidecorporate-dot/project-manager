import React from 'react';
import { Outlet } from 'react-router-dom';
import SQASidebar from './SQASidebar';
import SQATopbar from './SQATopbar';

const SQALayout = () => {
    return (
        <div className="flex h-screen bg-[#e8eae3]">
            <SQASidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <SQATopbar />
                <main className="flex-1 overflow-y-auto p-8 bg-[#e8eae3]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SQALayout;
