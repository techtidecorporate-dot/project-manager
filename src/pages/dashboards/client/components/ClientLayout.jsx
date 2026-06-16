import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import ClientTopbar from './ClientTopbar';

const ClientLayout = () => {
    return (
        <div className="flex h-screen bg-[#e8eae3]">
            <ClientSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <ClientTopbar />
                <main className="flex-1 overflow-y-auto p-8 bg-[#e8eae3]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ClientLayout;
