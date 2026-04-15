"use client";

import useSWR, { mutate } from 'swr';
import { QueueEntry } from '../types/index';
import api from '@/lib/axios';

export interface QueueStatusResponse {
    active_sessions: Student[];
    upcoming: QueueEntry[];
    total_waiting: number;
    toga_queue: Student[];
    recent_completed: Student[];
    toga_active: Student | null;
}

export interface Student {
    id: number;
    student_id: string;
    name: string;
    status: 'waiting' | 'toga' | 'creative' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useQueueActions = (isPublicDisplay = false) => {
    const { data, error, isLoading } = useSWR<QueueStatusResponse>('/admin/queue/status', fetcher, {
        // If it's the TV, poll every 5s. If it's staff, don't poll (mutate handles it).
        refreshInterval: isPublicDisplay ? 5000 : 0,
        revalidateOnFocus: true,
    });

    const triggerAction = async (action: 'next_toga' | 'next_creative' | 'back' | 'complete' | 'undo_toga' | 'undo_creative') => {
        try {
            await api.post(`/admin/queue/${action}`, { action });

            // Immediate local update
            mutate('/admin/queue/status');

        } catch (err) {
            console.error(`Queue action [${action}] failed:`, err);
        }
    };

    return {
        queueData: data || {
            active_sessions: [],
            upcoming: [],
            toga_active: null,
            total_waiting: 0,
            toga_queue: [],
            recent_completed: []
        },
        isLoading,
        error,
        triggerAction
    };
};