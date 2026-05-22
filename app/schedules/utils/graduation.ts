// app/schedules/utils/graduation.ts
import { GraduationSchedule } from '@/types/graduation';
import { formatManilaDate, formatManilaTime, getManilaTime } from './timezone';

export const formatEventDate = (startStr: string, endStr?: string | null): string => {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  };

  if (!end || start.toDateString() === end.toDateString()) {
    return formatManilaDate(startStr, dateOptions);
  }

  const endDateStr = endStr!;
  return `${formatManilaDate(startStr, { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Asia/Manila'
  })} - ${formatManilaDate(endDateStr, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'Asia/Manila'
  })}`;
};

export const formatEventTime = (startStr: string, endStr?: string | null): string => {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' };
  return `${formatManilaTime(startStr, options)}${
    end ? ` - ${formatManilaTime(endStr!, options)}` : ''
  }`;
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
