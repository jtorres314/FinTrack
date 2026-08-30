import React, { ReactNode } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateDisplay, getTodayDateString } from '../utils/finance';

interface MobileFrameProps {
  children: ReactNode;
  simulatedTime?: string;
  activeTab: string;
}

export function MobileFrame({ children, simulatedTime, activeTab }: MobileFrameProps) {
  const [todayDateStr, setTodayDateStr] = React.useState(getTodayDateString());

  React.useEffect(() => {
    // Keep date up to date with user's local day
    const updateToday = () => {
      setTodayDateStr(getTodayDateString());
    };

    updateToday();
    window.addEventListener('focus', updateToday);
    const interval = setInterval(updateToday, 30000); // check every 30s
    return () => {
      window.removeEventListener('focus', updateToday);
      clearInterval(interval);
    };
  }, []);

  // Display date: use simulatedTime if provided, otherwise standard today date
  const activeDate = simulatedTime || todayDateStr;
  const displayFormatted = formatDateDisplay(activeDate);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-4 px-2 md:py-8 select-none font-sans antialiased text-slate-800">
      {/* Container simulating a phone layout */}
      <div className="relative w-full max-w-[420px] h-full min-h-[750px] md:h-[860px] bg-white md:rounded-[44px] md:shadow-2xl md:border-[10px] md:border-slate-900 flex flex-col overflow-hidden transition-all duration-300">
        
        {/* iPhone Dynamic Island / Notch Mockup (Hidden on mobile browsers, only visible in desktop frame) */}
        <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-32 bg-slate-900 rounded-b-2xl z-50"></div>

        {/* Top Header/Status Bar */}
        <div className="w-full h-11 px-6 pt-2 bg-white flex justify-between items-center text-xs font-semibold select-none z-40 text-slate-700">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <Calendar size={13} className="text-blue-600 shrink-0" />
            <span>{displayFormatted}</span>
          </div>
          <div className="text-slate-400 font-bold text-[11px] tracking-wide">
            FinTrack
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-slate-50/50 pb-20 scrollbar-thin">
          {children}
        </div>

        {/* Bottom indicator bar for iOS (Only visible in frame on desktop) */}
        <div className="hidden md:block absolute bottom-1.5 left-1/2 transform -translate-x-1/2 h-1.5 w-32 bg-slate-300 rounded-full z-40"></div>
      </div>
    </div>
  );
}
