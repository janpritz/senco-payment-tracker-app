// components/graduation/UpcomingEventsList.tsx
'use client';
import { GraduationSchedule } from '@/types/graduation';
import { formatEventTime } from '@/app/schedules/utils/graduation';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getManilaTime } from '@/app/schedules/utils/timezone';

type Props = {
  futureEvents: GraduationSchedule[];
  activeEventId: number | null;
  onHover: (id: number | null) => void;
  onToggle: (id: number | null) => void;
};

function parseDayMonth(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    mon: d.toLocaleString('en-US', { month: 'short', timeZone: 'Asia/Manila' }),
  };
}

function isMultiDay(ev: GraduationSchedule): boolean {
  if (!ev.end_date) return false;
  const s = new Date(ev.start_date);
  const e = new Date(ev.end_date);
  return s.toDateString() !== e.toDateString();
}

function fmtDateRange(startStr: string, endStr: string) {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' });
  return `${fmt(startStr)} – ${fmt(endStr)}`;
}

export default function UpcomingEventsList({
  futureEvents,
  activeEventId,
  onHover,
  onToggle,
}: Props) {
  const now = getManilaTime();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const filteredEvents = futureEvents.filter(ev => {
    const start = new Date(ev.start_date);
    const end = ev.end_date ? new Date(ev.end_date) : start;
    return start > todayEnd || end < now;
  });

  return (
    <div className="max-w-2xl mx-auto py-6 font-sans">

      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-[15px] font-medium text-neutral-900">
          Upcoming events
        </h2>
        <span className="font-mono text-[10px] text-neutral-400 tracking-wider">
          {filteredEvents.length} events
        </span>
      </div>

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
            const multi = isMultiDay(ev);
            const { day, mon } = parseDayMonth(ev.start_date);

            return (
                <div
                key={ev.id ?? ''}
                onMouseEnter={() => onHover(ev.id ?? null)}
                onMouseLeave={() => onHover(null)}
              >
                <button
                  onClick={() => onToggle(ev.id ?? null)}
                  aria-expanded={isActive}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex flex-col items-center min-w-[34px] shrink-0">
                    <span className="font-mono text-[17px] font-semibold text-neutral-900 leading-none">
                      {day}
                    </span>
                    <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-neutral-400 mt-0.5">
                      {mon}
                    </span>
                  </div>

                  <div className="w-px h-9 shrink-0 bg-[#ebebeb]" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-medium text-neutral-900 truncate">
                        {ev.title}
                      </p>
                      {multi && (
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5 shrink-0">
                          multi-day
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      {multi && ev.end_date
                        ? fmtDateRange(ev.start_date, ev.end_date)
                        : formatEventTime(ev.start_date, ev.end_date)
                      }
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-neutral-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-neutral-300 transition-transform duration-200',
                        isActive && 'rotate-180'
                      )}
                    />
                  </div>
                </button>

                <div className={cn(
                  'overflow-hidden transition-all duration-[260ms] ease-[cubic-bezier(.4,0,.2,1)]',
                  isActive ? 'max-h-64' : 'max-h-0'
                )}>
                  <div className="pb-4 pl-[66px] pr-5">
                    {multi && ev.daily_schedule && ev.daily_schedule.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-3">
                        {ev.daily_schedule.map((row, j) => (
                          <div key={j} className="flex items-baseline gap-2 text-[11px]">
                            <span className="font-mono text-neutral-500 min-w-[80px] shrink-0">
                              {row.date}
                            </span>
                            <span className="font-mono text-neutral-400">{row.time}</span>
                            {row.label && (
                              <span className="text-neutral-400">— {row.label}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {ev.notice_text ? (
                      <div className="border-l-2 border-neutral-200 pl-3 text-[12px] text-neutral-500 leading-relaxed">
                        {ev.notice_text}
                      </div>
                    ) : !multi || !ev.daily_schedule ? (
                      <span className="text-[12px] text-neutral-400 italic">
                        No additional notice.
                      </span>
                    ) : null}
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
