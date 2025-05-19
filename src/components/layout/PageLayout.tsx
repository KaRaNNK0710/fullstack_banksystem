import React, { ReactNode } from 'react';
import Navigation from './Navigation';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;