import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminNavbar } from './AdminNavbar';
import { AdminFooter } from './AdminFooter';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-6">
          <Outlet />
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}