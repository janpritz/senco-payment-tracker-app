// hooks/useGraduationTimeline.ts
import { useState, useEffect, useMemo } from 'react';
import { GraduationSchedule } from '@/types/graduation';
import { GraduationApi } from '@/lib/graduation';
import { isEventNow, isEventPast, getTodayEvents } from '@/app/schedules/utils/graduation';

export function useGraduationTimeline() {
    const [schedules, setSchedules] = useState<GraduationSchedule[]>([]);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showPastEvents, setShowPastEvents] = useState(false);
    const [now, setNow] = useState<Date>(new Date());

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Data fetching
    useEffect(() => {
        const load = () => {
            GraduationApi.getAll()
                .then(setSchedules)
                .catch(err => console.error('Error fetching graduation timeline:', err));
        };

        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    const sortedSchedules = useMemo(() => {
        return [...schedules].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }, [schedules]);

    const currentEvent = useMemo(() =>
        sortedSchedules.find(event => isEventNow(event, now)) || null,
        [sortedSchedules, now]);

    const pastEvents = useMemo(() =>
        sortedSchedules.filter(event => isEventPast(event, now)).reverse(),
        [sortedSchedules, now]);

    const futureEvents = useMemo(() =>
        sortedSchedules.filter(event =>
            !isEventPast(event, now) && event.id !== currentEvent?.id
        ),
        [sortedSchedules, currentEvent, now]);

    const todayEvents = useMemo(() => getTodayEvents(schedules, now), [schedules, now]);

    const activeEventId = selectedId ?? hoveredId;

    const toggleSelect = (id: number) => {
        setSelectedId(prev => (prev === id ? null : id));
    };

    // In useGraduationTimeline.ts
    return {
        now,
        currentEvent,
        pastEvents,
        futureEvents,
        todayEvents,
        activeEventId,
        showPastEvents,
        setShowPastEvents,           // ← This is already React.Dispatch<React.SetStateAction<boolean>>
        hoveredId,
        setHoveredId,
        toggleSelect,
    };
}