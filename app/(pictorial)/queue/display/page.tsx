import { PublicQueueDisplay } from "@/components/queue/components/public-queue-display";

export default function DisplayPage() {
    return (
        // No wrappers needed, the component handles the dark fullscreen theme
        <main className="cursor-none"> 
            <PublicQueueDisplay />
        </main>
    );
}