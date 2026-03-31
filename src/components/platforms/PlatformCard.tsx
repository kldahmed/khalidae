import React from 'react';

interface PlatformCardProps {
  title: string;
  description: string;
  href: string;
  status: 'live' | 'offline';
  onClick?: () => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ title, description, href, status, onClick }) => {
  return (
    <div
      className="relative bg-zinc-900 rounded-2xl shadow-lg p-8 flex flex-col items-start transition-transform hover:scale-105 hover:shadow-2xl border border-zinc-800 min-h-[260px] w-full max-w-xl mx-auto mb-8"
    >
      <div className="flex items-center gap-3 mb-4 w-full">
        <h2 className="text-2xl font-bold text-white flex-1">{title}</h2>
        {status === 'live' && (
          <span className="bg-green-600 text-xs text-white px-3 py-1 rounded-full font-semibold animate-pulse">LIVE</span>
        )}
      </div>
      <p className="text-zinc-300 mb-6 text-base flex-1">{description}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-md transition-colors w-full text-center"
      >
        دخول المنصة
      </a>
    </div>
  );
};
