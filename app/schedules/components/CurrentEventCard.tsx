// components/graduation/CurrentEventCard.tsx
'use client';
import { GraduationSchedule } from '@/types/graduation';
import { formatEventDate, formatEventTime, isEventNow, isEventPast } from '@/app/schedules/utils/graduation';
import { ChevronDown, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getManilaTime } from '@/app/schedules/utils/timezone';

type Props = {
  events: GraduationSchedule[];
  now: Date;
};

type Status = 'now' | 'past' | 'next';

function getStatus(event: GraduationSchedule, now: Date): Status {
  if (isEventNow(event, now)) return 'now';
  if (isEventPast(event, now)) return 'past';
  return 'next';
}

const STATUS_LABEL: Record<Status, string> = {
  now:  'ongoing',
  past: 'done',
  next: 'upcoming',
};

const STATUS_CLASS: Record<Status, string> = {
  now:  'bg-emerald-50 text-emerald-800',
  past: 'bg-neutral-100 text-neutral-400',
  next: 'bg-blue-50 text-blue-800',
};

const SECTION_ORDER: Status[] = ['now', 'next', 'past'];
const SECTION_LABEL: Record<Status, string> = {
  now:  'ongoing',
  next: 'upcoming',
  past: 'completed',
};

export default function CurrentEventCard({ events, now }: Props) {
  const [clock, setClock] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setClock(getManilaTime().toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Manila',
    }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const toggle = (id: number | null) => setOpenId(prev => prev === id ? null : id);

  const ongoingCount = events.filter(ev => isEventNow(ev, now)).length;

  const grouped = SECTION_ORDER
    .map(status => ({
      status,
      items: events.filter(ev => getStatus(ev, now) === status),
    }))
    .filter(g => g.items.length > 0);

  return (
    <div className="flex justify-center mb-16">
      <div 
        className={cn(
          "relative w-full max-w-2xl p-[1px] rounded-xl overflow-hidden bg-neutral-200 transition-all duration-500",
          ongoingCount > 0 
            ? "shadow-[0_25px_50px_-12px_rgba(16,185,129,0.15)] shadow-emerald-100/80" 
            : "shadow-2xl shadow-neutral-200/80"
        )}
      >
        {ongoingCount > 0 && (
          <div className="absolute inset-0 -m-[100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_40%,#10b981_70%,transparent_100%)]" />
        )}

        <div className="relative w-full rounded-[11px] overflow-hidden bg-white font-sans z-10">

          <div className="flex items-center justify-between px-5 py-2.5 bg-neutral-50 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
                <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-emerald-600" />
              </span>
              <span className="font-mono text-[10px] font-semibold tracking-widest text-emerald-700 uppercase">
                today
              </span>
            </div>
            <div className="flex items-center gap-3">
              {ongoingCount > 0 && (
                <span className="font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">
                  {ongoingCount} ongoing
                </span>
              )}
              <span className="font-mono text-[11px] text-neutral-400 tabular-nums">{clock}</span>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-10 px-6">
              <span className="inline-block font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-400 border border-neutral-200 rounded-full px-3 py-1 mb-4">
                no events
              </span>
              <p className="text-lg font-medium text-neutral-400 mb-1">No events scheduled today</p>
              <p className="text-[13px] text-neutral-400">Check the upcoming events below</p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {grouped.map(({ status, items }) => (
                <div key={`group-${status}`}>
                  <li className="border-b border-neutral-100">
                    <div className="flex items-center gap-3 px-5 py-2 bg-white">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        {SECTION_LABEL[status]}
                      </span>
                      <div className="flex-1 h-px bg-neutral-100" />
                    </div>
                  </li>

                  {items.map((ev, i) => {
                    if (ev.id === undefined) return null;
                    
                    const isOpen = openId === ev.id;
                    const globalIdx = events.indexOf(ev) + 1;
                    return (
                      <li key={ev.id ?? ''} className="border-b border-neutral-100 last:border-0 bg-white">
                        <button
                          onClick={() => toggle(ev.id ?? null)}
                          aria-expanded={isOpen}
                          className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-neutral-50 transition-colors"
                        >
                          <span className="font-mono text-[11px] text-neutral-400 min-w-[18px] shrink-0">
                            {String(globalIdx).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-neutral-900 truncate">
                              {ev.title}
                            </p>
                            <p className="font-mono text-[11px] text-emerald-600 mt-0.5">
                              {formatEventTime(ev.start_date, ev.end_date)}
                            </p>
                          </div>
                          <span className={cn(
                            'font-mono text-[10px] font-medium rounded-full px-2 py-0.5 shrink-0',
                            STATUS_CLASS[status]
                          )}>
                            {STATUS_LABEL[status]}
                          </span>
                          <ChevronDown
                            size={15}
                            className={cn(
                              'text-neutral-400 shrink-0 transition-transform duration-200',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </button>

                        <div className={cn(
                          'overflow-hidden transition-all duration-[260ms] ease-[cubic-bezier(.4,0,.2,1)]',
                          isOpen ? 'max-h-52' : 'max-h-0'
                        )}>
                          <div className="px-5 pb-4 pl-[50px]">
                            {ev.notice_text ? (
                              <div className="border-l-2 border-neutral-200 pl-3 text-[13px] text-neutral-500 leading-relaxed">
                                {ev.notice_text}
                              </div>
                            ) : (
                              <p className="text-[13px] text-neutral-400">No additional notice.</p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
