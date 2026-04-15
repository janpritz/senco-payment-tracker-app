export type QueueStatus = 'waiting' | 'toga' | 'creative' | 'completed' | 'cancelled';

export interface QueueEntry {
    id: number;
    name: string;
    student_id: string;
    status: QueueStatus;
}