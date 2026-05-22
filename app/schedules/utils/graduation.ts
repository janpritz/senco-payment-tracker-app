// app/schedules/utils/graduation.ts
import { GraduationSchedule } from '@/types/graduation';

export const formatEventDate = (startStr: string, endStr?: string | null): string => {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  if (!end || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', dateOptions);
  }

  return `${start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })} - ${end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })}`;
};

export const formatEventTime = (startStr: string, endStr?: string | null): string => {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  if (!end || start.toDateString() === end.toDateString()) {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return `${start.toLocaleTimeString('en-US', options)}${
      end ? ` - ${end.toLocaleTimeString('en-US', options)}` : ''
    }`;
  }
  return '';
};

export const isEventNow = (event: GraduationSchedule, now: Date): boolean => {
  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : start;
  return now >= start && now <= end;
};

export const isEventPast = (event: GraduationSchedule, now: Date): boolean => {
  const end = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
  return end < now;
};

export const getTodayEvents = (schedules: GraduationSchedule[], now: Date): GraduationSchedule[] => {
  return schedules.filter(event => {
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : start;

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    return start <= todayEnd && end >= todayStart;
  });
};