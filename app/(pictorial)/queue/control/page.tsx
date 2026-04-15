"use client";

import { StaffControls } from "@/components/queue/components/staff-controls";
import { useQueueActions } from "@/components/queue/hooks/use-queue-actions";
import { ControlHeader } from "@/components/queue/components/ControlHeader";
import { QueueSidebar } from "@/components/queue/components/QueueSidebar";
import { QueueSearch } from "@/components/queue/components/QueueSearch";


export default function ControlPage() {
  const { triggerAction, queueData } = useQueueActions();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ControlHeader totalWaiting={queueData?.total_waiting || 0} />

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div>
        
            <StaffControls />

          {/* Sidebar Area */}
          {/* <QueueSidebar upcoming={queueData?.upcoming} /> */}

        </div>
      </main>
    </div>
  );
}