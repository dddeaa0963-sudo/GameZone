import React from 'react';
import { X, MoreVertical, MessageCircle, Users, Facebook, Instagram, Youtube, ArrowRight } from 'lucide-react';

interface FloatingActionButtonProps {
  currentView: string;
  selectedProductId: number | null;
  isFabOpen: boolean;
  setIsFabOpen: (isOpen: boolean) => void;
  fabOptions: any[];
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ currentView, selectedProductId, isFabOpen, setIsFabOpen, fabOptions }) => {
  if (currentView !== 'home' || selectedProductId !== null) return null;

  return (
    <div className="fixed bottom-[104px] sm:bottom-[120px] left-4 sm:left-6 z-40 flex flex-col-reverse items-center gap-3">
      <button
        onClick={() => setIsFabOpen(!isFabOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-blue-700 to-black dark:from-red-600 dark:to-red-900 border-2 border-white/10 dark:border-gray-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/30 dark:shadow-red-900/30 transition-transform duration-300 hover:scale-105 active:scale-95 z-50 ${isFabOpen ? 'rotate-90' : 'rotate-0'}`}
        aria-label="خيارات التواصل"
      >
        {isFabOpen ? <X className="w-6 h-6 drop-shadow-sm" /> : <MoreVertical className="w-6 h-6 drop-shadow-sm" />}
      </button>
      
      <div className={`flex flex-col-reverse items-center gap-3 transition-all duration-300 origin-bottom ${isFabOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10 pointer-events-none'}`}>
        {fabOptions.map((link: any, index: number) => {
          let icon = <MessageCircle className="w-5 h-5 drop-shadow-sm" />;
          let color = 'bg-blue-500 hover:bg-blue-600';
          if (link.type === 'whatsapp') { icon = <MessageCircle className="w-5 h-5 drop-shadow-sm" />; color = 'bg-green-500 hover:bg-green-600'; }
          else if (link.type === 'whatsapp_group') { icon = <Users className="w-5 h-5 drop-shadow-sm" />; color = 'bg-emerald-500 hover:bg-emerald-600'; }
          else if (link.type === 'telegram') { icon = <MessageCircle className="w-5 h-5 drop-shadow-sm" />; color = 'bg-blue-500 hover:bg-blue-600'; }
          else if (link.type === 'facebook') { icon = <Facebook className="w-5 h-5 drop-shadow-sm" />; color = 'bg-blue-600 hover:bg-blue-700'; }
          else if (link.type === 'instagram') { icon = <Instagram className="w-5 h-5 drop-shadow-sm" />; color = 'bg-gradient-to-tr from-yellow-500 via-pink-600 to-blue-800 hover:opacity-90'; }
          else if (link.type === 'youtube') { icon = <Youtube className="w-5 h-5 drop-shadow-sm" />; color = 'bg-red-600 hover:bg-red-700'; }
          else { icon = <ArrowRight className="w-5 h-5 drop-shadow-sm" />; color = 'bg-gray-700 hover:bg-gray-800'; }
          let finalUrl = link.url || '#';
          if (link.type === 'whatsapp' && finalUrl && !finalUrl.includes('wa.me') && !finalUrl.includes('whatsapp.com')) {
            const cleaned = finalUrl.replace(/[^\d+]/g, '');
            if (cleaned.length >= 8) {
              finalUrl = `https://wa.me/${cleaned.startsWith('+') ? cleaned.substring(1) : cleaned}`;
            } else if (!finalUrl.startsWith('http') && finalUrl !== '#') {
              finalUrl = `https://${finalUrl}`;
            }
          } else if (finalUrl !== '#' && !finalUrl.startsWith('http') && !finalUrl.startsWith('mailto:')) {
            finalUrl = `https://${finalUrl}`;
          }
          return (
            <div key={link.id + '-' + index} className="relative flex items-center group">
              <span className={`absolute left-full ml-3 text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap opacity-100 transition-opacity ${isFabOpen ? 'translate-x-0' : '-translate-x-2'}`} style={{ transitionDelay: `${isFabOpen ? index * 50 : 0}ms` }}>
                {link.name}
              </span>
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-110 ${color}`}
                style={{ transitionDelay: `${isFabOpen ? index * 50 : 0}ms` }}
              >
                {icon}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingActionButton;
