import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminNavbar } from './AdminNavbar';
import { AdminFooter } from './AdminFooter';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <AdminFooter />
    </div>
  );
}