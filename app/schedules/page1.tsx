'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GraduationSchedule } from '@/types/graduation';
import { GraduationApi } from '@/lib/graduation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CalendarDays,
} from 'lucide-react';

export default function PublicTimelinePage() {
  const [schedules, setSchedules] = useState<GraduationSchedule[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);

  const [now, setNow] = useState<Date | null>(null);

  const pastRef = useRef<HTMLDivElement>(null);
  const futureRef = useRef<HTMLDivElement>(null);

  const activeEventId = selectedId ?? hoveredId;

  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadSchedules = () => {
    GraduationApi.getAll()
      .then(setSchedules)
      .catch(err =>
        console.error('Error fetching graduation timeline:', err)
      );
  };

  useEffect(() => {
    loadSchedules();
    const interval = setInterval(loadSchedules, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const formatEventDate = (
    startStr: string,
    endStr?: string | null
  ) => {
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
      day: 'numeric',
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  const formatEventTime = (
    startStr: string,
    endStr?: string | null
  ) => {
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : null;

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    if (!end || start.toDateString() === end.toDateString()) {
      return `${start.toLocaleTimeString('en-US', timeOptions)}${end
        ? ` - ${end.toLocaleTimeString(
          'en-US',
          timeOptions
        )}`
        : ''
        }`;
    }

    return '';
  };

  const isEventNow = (event: GraduationSchedule) => {
    if (!now) return false;

    const start = new Date(event.start_date);
    const end = event.end_date
      ? new Date(event.end_date)
      : start;

    return now >= start && now <= end;
  };

  const isEventPast = (event: GraduationSchedule) => {
    if (!now) return false;

    const end = event.end_date
      ? new Date(event.end_date)
      : new Date(event.start_date);

    return end < now;
  };

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort(
      (a, b) =>
        new Date(a.start_date).getTime() -
        new Date(b.start_date).getTime()
    );
  }, [schedules]);

  const currentEvent =
    sortedSchedules.find(event => isEventNow(event)) || null;

  const pastEvents = sortedSchedules
    .filter(event => isEventPast(event))
    .reverse();

  const futureEvents = sortedSchedules.filter(
    event =>
      !isEventPast(event) &&
      event.id !== currentEvent?.id
  );

  const todayEvents = schedules.filter(event => {
    if (!now) return false;

    const start = new Date(event.start_date);
    const end = event.end_date
      ? new Date(event.end_date)
      : start;

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    return start <= todayEnd && end >= todayStart;
  });

  const hasTodayEvent = todayEvents.length > 0;

  const formattedNow = now
    ? now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    : '';

  const scrollCarousel = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return;

    ref.current.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            ACC Graduation Events Timeline
          </h1>

          <p className="mt-2 text-gray-500">
            Academic Year 2025–2026
          </p>
          <span className="text-sm text-slate-400">Dates and Time are subject to change. Please check back and update regularly.</span>
        </div>

        {/* NOW BANNER */}
        {/* <div className="mb-10">
          <div
            className={`rounded-3xl border px-6 py-5 transition-all duration-500 ${
              hasTodayEvent
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div className="flex items-center gap-4">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                </span>

                <div>
                  <p className="uppercase text-xs tracking-[0.25em] font-bold text-emerald-600">
                    NOW
                  </p>

                  <p className="font-mono text-sm text-gray-700 mt-1">
                    {formattedNow || 'Loading current time...'}
                  </p>
                </div>
              </div>

              {hasTodayEvent ? (
                <div className="flex flex-wrap gap-2">
                  {todayEvents.map(event => (
                    <div
                      key={event.id}
                      className="bg-white border border-emerald-200 rounded-full px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No events scheduled today
                </p>
              )}
            </div>
          </div>
        </div> */}

        {/* PAST EVENTS TOGGLE */}
        {pastEvents.length > 0 && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() =>
                setShowPastEvents(prev => !prev)
              }
              className="group flex items-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 rounded-full px-5 py-3 shadow-sm"
            >
              <ChevronUp
                className={`w-4 h-4 transition-transform duration-300 ${showPastEvents ? 'rotate-180' : ''
                  }`}
              />

              <span className="text-sm font-semibold text-gray-700">
                {showPastEvents
                  ? 'Hide Past Events'
                  : 'Show Past Events'}
              </span>
            </button>
          </div>
        )}

        {/* PAST EVENTS CAROUSEL */}
        <div
          className={`transition-all duration-500 overflow-hidden ${showPastEvents
            ? 'max-h-[500px] opacity-100 mb-14'
            : 'max-h-0 opacity-0'
            }`}
        >
          <div className="relative">

            <button
              onClick={() =>
                scrollCarousel(pastRef, 'left')
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white shadow-lg border border-gray-200 rounded-full p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() =>
                scrollCarousel(pastRef, 'right')
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white shadow-lg border border-gray-200 rounded-full p-2"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={pastRef}
              className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar px-12 py-2"
            >
              {pastEvents.map(event => {
                const isActive =
                  activeEventId === event.id;

                return (
                  <div
                    key={event.id}
                    className="min-w-[280px] max-w-[280px] flex-shrink-0"
                  >
                    <div
                      onMouseEnter={() =>
                        setHoveredId(event.id!)
                      }
                      onMouseLeave={() =>
                        setHoveredId(null)
                      }
                      onClick={() =>
                        toggleSelect(event.id!)
                      }
                      className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer ${isActive
                        ? 'border-gray-300 shadow-xl scale-105'
                        : 'border-gray-200 opacity-80 hover:opacity-100 hover:shadow-lg'
                        }`}
                    >
                      <div className="h-1 bg-gray-300" />

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase tracking-widest font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                            Past
                          </span>
                        </div>

                        <h3 className="font-bold text-lg text-gray-700 leading-tight">
                          {event.title}
                        </h3>

                        <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                          <CalendarDays className="w-4 h-4 mt-0.5" />
                          <div>
                            <p>
                              {formatEventDate(
                                event.start_date,
                                event.end_date
                              )}
                            </p>

                            <p className="text-xs mt-1">
                              {formatEventTime(
                                event.start_date,
                                event.end_date
                              )}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`grid transition-all duration-300 overflow-hidden ${isActive
                            ? 'grid-rows-[1fr] opacity-100 mt-4'
                            : 'grid-rows-[0fr] opacity-0'
                            }`}
                        >
                          <div className="overflow-hidden">
                            {event.notice_text && (
                              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-600">
                                {event.notice_text}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* NOW EVENT */}
        <div className="relative flex justify-center mb-16">

          <div className="relative z-20 w-full max-w-2xl">

            <div className="bg-white border-2 border-emerald-400 shadow-2xl rounded-[2rem] overflow-hidden">

              <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />

              <div className="p-7 text-center">

                {/* LIVE CLOCK */}
                <div className="flex flex-col items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                    </span>

                    <span className="uppercase text-xs tracking-[0.25em] font-black text-emerald-600">
                      NOW
                    </span>
                  </div>

                  <p className="font-mono text-sm text-gray-500 mt-3">
                    {formattedNow || 'Loading current time...'}
                  </p>
                </div>

                {currentEvent ? (
                  <>
                    {/* LIVE BADGE
                    <div className="flex justify-center mb-4">
                      <span className="bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full">
                        LIVE NOW
                      </span>
                    </div> */}

                    {/* TITLE */}
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                      {currentEvent.title}
                    </h2>

                    {/* DATE */}
                    <div className="mt-5 space-y-1">
                      <p className="font-mono text-emerald-600 font-semibold">
                        {formatEventDate(
                          currentEvent.start_date,
                          currentEvent.end_date
                        )}
                      </p>

                      <p className="text-sm text-gray-500">
                        {formatEventTime(
                          currentEvent.start_date,
                          currentEvent.end_date
                        )}
                      </p>
                    </div>

                    {/* NOTICE */}
                    {currentEvent.notice_text && (
                      <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-3xl p-1 text-gray-700 text-sm leading-relaxed">
                        {currentEvent.notice_text}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="pt-5 pb-5">
                    <div className="flex justify-center mb-4">
                      <span className="bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full">
                        No Event
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-gray-400">
                      No ongoing event right now
                    </h2>

                    <p className="text-gray-400 mt-3 text-sm">
                      Please check the upcoming events below
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* UPCOMING EVENTS LIST */}
        {futureEvents.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="space-y-8 relative">

                {/* UPCOMING EVENTS LIST */}
                {futureEvents.length > 0 && (
                  <div className="max-w-5xl mx-auto">

                    <div className="mb-6">
                      <h2 className="text-2xl font-black text-gray-900">
                        Upcoming Events
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Scroll through all upcoming graduation activities
                      </p>
                    </div>

                    <div className="space-y-5">

                      {futureEvents.map(event => {
                        const isActive =
                          activeEventId === event.id;

                        const isLive = isEventNow(event);

                        return (
                          <div
                            key={event.id}
                            onMouseEnter={() =>
                              setHoveredId(event.id!)
                            }
                            onMouseLeave={() =>
                              setHoveredId(null)
                            }
                            onClick={() =>
                              toggleSelect(event.id!)
                            }
                            className={`bg-white rounded-3xl border overflow-hidden cursor-pointer transition-all duration-300 ${isActive
                              ? 'border-emerald-400 shadow-2xl scale-[1.01]'
                              : 'border-gray-200 hover:border-emerald-200 hover:shadow-lg'
                              }`}
                          >

                            {/* TOP BAR */}
                            <div
                              className={`h-1 ${event.is_important
                                ? 'bg-red-500'
                                : 'bg-emerald-400'
                                }`}
                            />

                            <div className="p-5 md:p-6">

                              {/* HEADER */}
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                <div className="flex-1">

                                  {/* BADGES */}
                                  {/* <div className="flex items-center gap-2 flex-wrap mb-3">

                                    {isLive && (
                                      <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                        Live
                                      </span>
                                    )}

                                    {!isLive && (
                                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                        Upcoming
                                      </span>
                                    )}

                                    {event.is_important && (
                                      <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                        Important
                                      </span>
                                    )}

                                  </div> */}

                                  {/* TITLE */}
                                  <h3
                                    className={`font-black leading-tight transition-all duration-300 ${isActive
                                      ? 'text-2xl text-gray-900'
                                      : 'text-xl text-gray-800'
                                      }`}
                                  >
                                    {event.title}
                                  </h3>

                                </div>

                                {/* DATE */}
                                <div className="md:text-right shrink-0">

                                  <p
                                    className={`font-mono text-sm transition-all duration-300 ${isActive
                                      ? 'text-emerald-600 font-semibold'
                                      : 'text-gray-500'
                                      }`}
                                  >
                                    {formatEventDate(
                                      event.start_date,
                                      event.end_date
                                    )}
                                  </p>

                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatEventTime(
                                      event.start_date,
                                      event.end_date
                                    )}
                                  </p>

                                </div>
                              </div>

                              {/* EXPANDABLE DETAILS */}
                              <div
                                className={`grid transition-all duration-300 overflow-hidden ${isActive
                                  ? 'grid-rows-[1fr] opacity-100 mt-5'
                                  : 'grid-rows-[0fr] opacity-0'
                                  }`}
                              >
                                <div className="overflow-hidden">

                                  {event.notice_text && (
                                    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-600 leading-relaxed">
                                      {event.notice_text}
                                    </div>
                                  )}

                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>
    </div>
  );
}