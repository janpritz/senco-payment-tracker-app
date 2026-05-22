// components/graduation/UpcomingEventsList.tsx
'use client';
import { GraduationSchedule } from '@/types/graduation';
import { formatEventDate, formatEventTime } from '@/app/schedules/utils/graduation';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  futureEvents: GraduationSchedule[];
  activeEventId: number | null;
  onHover: (id: number | null) => void;
  onToggle: (id: number) => void;
};

function parseDayMonth(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    mon: d.toLocaleString('en-US', { month: 'short' }),
  };
}

export default function UpcomingEventsList({
  futureEvents,
  activeEventId,
  onHover,
  onToggle,
}: Props) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const filteredEvents = futureEvents.filter(ev => {
    const start = new Date(ev.start_date);
    const end = ev.end_date ? new Date(ev.end_date) : start;
    return start > todayEnd || end < todayStart;
  });

  return (
    <div className="max-w-2xl mx-auto py-6 font-sans">

      {/* Header */}
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-[16px] font-medium text-neutral-900">
          Upcoming events
        </h2>
        <span className="font-mono text-[10px] text-neutral-400 tracking-wider">
          {filteredEvents.length} events
        </span>
      </div>

      {/* List */}
      {filteredEvents.length === 0 ? (
        <div className="py-10 text-center">
          <span className="font-mono text-[11px] text-neutral-400">
            no upcoming events
          </span>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white divide-y divide-neutral-100">
          {filteredEvents.map((ev, i) => {
            const isActive = activeEventId === ev.id;
            const { day, mon } = parseDayMonth(ev.start_date);

            return (
              <div
                key={ev.id}
                className={cn(isActive && 'bg-neutral-50')}
                onMouseEnter={() => onHover(ev.id ?? null)}
                onMouseLeave={() => onHover(null)}
              >
                {/* Row */}
                <button
                  onClick={() => onToggle(ev.id!)}
                  aria-expanded={isActive}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left hover:bg-neutral-50 transition-colors"
                >
                  {/* Date column */}
                  <div className="flex flex-col items-center min-w-[36px] shrink-0">
                    <span className="font-mono text-[18px] font-semibold text-neutral-900 leading-none">
                      {day}
                    </span>
                    <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-neutral-400 mt-0.5">
                      {mon}
                    </span>
                  </div>

                  {/* Vertical rule */}
                  <div className="w-px h-9 bg-neutral-150 shrink-0" style={{ backgroundColor: '#ebebeb' }} />

                  {/* Main */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-neutral-900 truncate">
                      {ev.title}
                    </p>
                    <p className="font-mono text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      {formatEventTime(ev.start_date, ev.end_date)}
                    </p>
                  </div>

                  {/* Right — index + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-neutral-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <ChevronDown
                      size={15}
                      className={cn(
                        'text-neutral-300 transition-transform duration-200',
                        isActive && 'rotate-180'
                      )}
                    />
                  </div>
                </button>

                {/* Expandable notice */}
                <div className={cn(
                  'overflow-hidden transition-all duration-[260ms] ease-[cubic-bezier(.4,0,.2,1)]',
                  isActive ? 'max-h-32' : 'max-h-0'
                )}>
                  <div className="px-5 pb-4" style={{ paddingLeft: '68px' }}>
                    {ev.notice_text ? (
                      <div className="border-l-2 border-neutral-200 pl-3 text-[12px] text-neutral-500 leading-relaxed">
                        {ev.notice_text}
                      </div>
                    ) : (
                      <span className="text-[12px] text-neutral-400 italic">
                        No additional notice.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}