import React from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationBannerProps {
  toast: { id: string; title: string; message: string; type?: string } | null;
  onClose: () => void;
  onClick: () => void;
}

export function NotificationBanner({ toast, onClose, onClick }: NotificationBannerProps) {
  React.useEffect(() => {
    if (toast) {
      // Try play a subtle audio beep if browser allows
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, context.currentTime); // D5 note
        gainNode.gain.setValueAtTime(0.05, context.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.15);
      } catch (e) {
        // Audio context may be blocked by policy, ignore safely
      }

      const timer = setTimeout(() => {
        onClose();
      }, 5500);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div 
      className="absolute top-12 left-4 right-4 z-50 animate-bounce-subtle cursor-pointer select-none"
      onClick={onClick}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 relative transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
        {/* App Icon Bubble */}
        <div className="p-2.5 rounded-xl bg-blue-600 text-white flex-shrink-0 shadow-md">
          <Bell size={18} className="animate-swing" />
        </div>

        {/* Content */}
        <div className="flex-1 pr-4">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600">Finanzas</span>
            <span className="text-[9px] text-slate-400 font-medium">ahora</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
            {toast.title}
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2 font-medium">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
