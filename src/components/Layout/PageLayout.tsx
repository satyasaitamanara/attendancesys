import React from 'react';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-8 animate-fade-in">
            {title && (
              <h1 className="text-4xl font-bold text-white mb-3">
                {typeof title === 'string' ? <span className="gold-text">{title}</span> : title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-300 text-lg">{subtitle}</p>
            )}
            <div className="mt-4 h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}