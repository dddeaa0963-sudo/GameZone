import React from 'react';

interface MarqueeProps {
  text: string;
}

const Marquee: React.FC<MarqueeProps> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="bg-gray-200/50 dark:bg-[#0a0a0a] shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),_0_2px_0_rgba(255,255,255,1)] dark:shadow-[inset_0_3px_8px_rgba(0,0,0,0.5),_0_1px_0_rgba(255,255,255,0.05)] border border-gray-300 dark:border-gray-800 rounded-xl overflow-hidden flex items-center p-2 relative mb-2">
      <div className="overflow-hidden flex-1 relative h-6 rounded">
        <div className="absolute whitespace-nowrap animate-marquee-reverse flex items-center h-full text-gray-800 dark:text-gray-200 font-bold tracking-wide text-sm drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;
