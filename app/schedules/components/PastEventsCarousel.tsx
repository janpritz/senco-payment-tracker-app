// components/graduation/PastEventsCarousel.tsx
'use client';
import { GraduationSchedule } from '@/types/graduation';
import { formatEventDate, formatEventTime } from '@/app/schedules/utils/graduation';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  pastEvents: GraduationSchedule[];
  activeEventId: number | null;
  showPastEvents: boolean;
  setShowPastEvents: React.Dispatch<React.SetStateAction<boolean>>;
  onHover: (id: number | null) => void;
  onToggle: (id: number | null) => void;
};

export default function PastEventsCarousel({
  pastEvents,
  activeEventId,
  showPastEvents,
  setShowPastEvents,
  onHover,
  onToggle,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  return (
    <div className="py-6 font-sans">

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-neutral-100" />
        <button
          onClick={() => setShowPastEvents(p => !p)}
          aria-expanded={showPastEvents}
          className="flex items-center gap-1.5 border border-neutral-200 rounded-full px-3.5 py-1.5 hover:bg-neutral-50 transition-colors shrink-0"
        >
          <ChevronDown
            size={14}
            className={cn(
              'text-neutral-400 transition-transform duration-200',
              showPastEvents && 'rotate-180'
            )}
          />
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-neutral-500">
            {showPastEvents ? 'hide past' : 'past events'}
          </span>
          <span className="font-mono text-[10px] text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
            {pastEvents.length}
          </span>
        </button>
        <div className="flex-1 h-px bg-neutral-100" />
      </div>

      <div className={cn(
        'overflow-hidden transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
        showPastEvents ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
      )}>
        {pastEvents.length === 0 ? (
          <p className="text-center font-mono text-[11px] text-neutral-400 py-6">
            no past events
          </p>
        ) : (
          <div className="relative">
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft size={14} className="text-neutral-500" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ChevronRight size={14} className="text-neutral-500" />
            </button>

            <div
              ref={trackRef}
              className="flex gap-2.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-9 pb-3 pt-1"
            >
              {pastEvents.map((ev, i) => {
                if (ev.id === undefined) return null;

                const isActive = activeEventId === ev.id;
                return (
                  <div
                    key={ev.id}
                    role="button"
                    aria-pressed={isActive}
                    onClick={() => onToggle(ev.id!)}
                    onMouseEnter={() => onHover(ev.id!)}
                    onMouseLeave={() => onHover(null)}
                    className={cn(
                      'min-w-[220px] max-w-[220px] shrink-0 rounded-xl border p-3.5 cursor-pointer transition-colors',
                      isActive
                        ? 'border-neutral-300 bg-neutral-50'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-mono text-[10px] text-neutral-400">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[10px] font-medium text-neutral-400 border border-neutral-200 rounded-full px-2 py-0.5">
                        done
                      </span>
                    </div>

                    <p className="text-[13px] font-medium text-neutral-900 leading-snug mb-2">
                      {ev.title}
                    </p>

                    <p className="font-mono text-[11px] text-neutral-400 flex items-center gap-1 mb-1">
                      <Calendar size={11} />
                      {formatEventDate(ev.start_date, ev.end_date)}
                    </p>
                    <p className="font-mono text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock size={11} />
                      {formatEventTime(ev.start_date, ev.end_date)}
                    </p>

                    {isActive && (
                      <div className="mt-2.5 pt-2.5 border-t border-neutral-100 text-[12px] text-neutral-500 leading-relaxed">
                        {ev.notice_text ?? 'No additional notice.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
