import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Toolbar } from './Toolbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--color-neutral-bg)] font-sans">
      <Navbar />
      <Toolbar />
      <main className="flex-1 overflow-y-auto relative border-t border-[var(--color-card-border)]">
        <Outlet />
      </main>
    </div>
  );
};
