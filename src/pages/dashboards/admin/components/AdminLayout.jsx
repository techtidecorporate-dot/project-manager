import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-[#e8eae3]">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminTopbar />
                <main className="flex-1 overflow-y-auto p-8 bg-[#e8eae3]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
