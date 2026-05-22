// components/graduation/EventCard.tsx
import { GraduationSchedule } from '@/types/graduation';
import { formatEventDate, formatEventTime } from '@/app/schedules/utils/graduation';
import { CalendarDays } from 'lucide-react';

type Props = {
  event: GraduationSchedule;
  isActive: boolean;
  onHover: (id: number | null) => void;
  onClick: (id: number | null) => void;
  variant?: 'past' | 'upcoming';
};

export default function EventCard({ event, isActive, onHover, onClick, variant = 'upcoming' }: Props) {
  return (
    <div
      onMouseEnter={() => onHover(event.id ?? null)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(event.id ?? null)}
      className={`bg-white rounded-3xl border overflow-hidden cursor-pointer transition-all duration-300 ${isActive
        ? 'border-emerald-400 shadow-2xl scale-[1.01]'
        : 'border-gray-200 hover:border-emerald-200 hover:shadow-lg'
        }`}
    >
      <div className={`h-1 ${event.is_important ? 'bg-red-500' : 'bg-emerald-400'}`} />

      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h3 className={`font-black leading-tight transition-all duration-300 ${isActive ? 'text-2xl' : 'text-xl'} text-gray-900`}>
              {event.title}
            </h3>
          </div>

          <div className="md:text-right shrink-0">
            <p className={`font-mono text-sm ${isActive ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
              {formatEventDate(event.start_date, event.end_date)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatEventTime(event.start_date, event.end_date)}
            </p>
          </div>
        </div>

        {event.notice_text && (
          <div className={`grid transition-all duration-300 overflow-hidden ${isActive ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-600">
                {event.notice_text}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
