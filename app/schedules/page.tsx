'use client';

import { useGraduationTimeline } from '@/app/schedules/hooks/useGraduationTimeline';
import TimelineHeader from '@/app/schedules/components/TimelineHeader';
import CurrentEventCard from '@/app/schedules/components/CurrentEventCard';
import PastEventsCarousel from '@/app/schedules/components/PastEventsCarousel';
import UpcomingEventsList from '@/app/schedules/components/UpcomingEventsList';

export default function PublicTimelinePage() {
  const timeline = useGraduationTimeline();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <TimelineHeader />

        {/* Past Events */}
        {timeline.pastEvents.length > 0 && (
          <PastEventsCarousel
            pastEvents={timeline.pastEvents}
            activeEventId={timeline.activeEventId}
            showPastEvents={timeline.showPastEvents}
            setShowPastEvents={timeline.setShowPastEvents}
            onHover={timeline.setHoveredId}
            onToggle={timeline.toggleSelect}
          />
        )}

        {/* Current Event */}
        <CurrentEventCard events={timeline.todayEvents} now={timeline.now} />

        {/* Upcoming */}
        {timeline.futureEvents.length > 0 && (
          <UpcomingEventsList
            futureEvents={timeline.futureEvents}
            activeEventId={timeline.activeEventId}
            onHover={timeline.setHoveredId}
            onToggle={timeline.toggleSelect}
          />
        )}
      </div>
    </div>
  );
}