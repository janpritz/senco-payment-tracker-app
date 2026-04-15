import { useState, useEffect } from 'react';
import { db, Student } from '@/lib/db'; 
import api from '@/lib/axios';
import axios from 'axios';

export const useStudentSearch = (query: string) => {
    const [student, setStudent] = useState<Student | null>(null);
    const [results, setResults] = useState<Student[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length === 0) {
            setStudent(null);
            setResults([]);
            setError(null);
            return;
        }

        // Reduced to 1 character for instant feedback since it's local only
        if (trimmedQuery.length < 1) {
            setResults([]);
            return;
        }

        const findStudents = async () => {
            setIsSearching(true);
            setError(null);

            try {
                // QUERY LOCAL INDEXEDDB ONLY
                // This is near-instant even with 10,000+ records
                const localMatches = await db.students
                    .where('student_id')
                    .startsWithIgnoreCase(trimmedQuery)
                    .or('full_name')
                    .startsWithIgnoreCase(trimmedQuery)
                    .limit(8) // Increased limit since it's fast
                    .toArray();

                setResults(localMatches);

                if (localMatches.length === 0 && trimmedQuery.length > 3) {
                    setError("Not found in local masterlist. Try syncing.");
                }
            } catch (err: any) {
                console.error("Local search failed:", err);
                setError("Search error");
            } finally {
                setIsSearching(false);
            }
        };

        // Shorter debounce (150ms) because local DB is fast
        const debounceTimer = setTimeout(findStudents, 150);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    return { student, results, isSearching, error, setStudent };
};

export const useMasterlistSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(
        typeof window !== 'undefined' ? localStorage.getItem('last_masterlist_sync') : null
    );

    const syncMasterlist = async () => {
        setIsSyncing(true);
        try {
            // Fetch everything from the server in one go
            const response = await api.get('/admin/masterlist');
            const students = response.data;

            await db.transaction('rw', db.students, async () => {
                await db.students.clear();
                await db.students.bulkPut(students.map((s: any) => ({
                    student_id: String(s.student_id),
                    full_name: s.full_name,
                    college: s.college,
                    course: s.course || '',
                    balance: Number(s.balance || 0)
                })));
            });

            const now = new Date().toLocaleString();
            localStorage.setItem('last_masterlist_sync', now);
            setLastSync(now);
            
            alert("Masterlist updated! Local search is now ready.");
        } catch (error) {
            console.error("Sync failed:", error);
            alert("Sync failed. Check your internet connection.");
        } finally {
            setIsSyncing(false);
        }
    };

    return { syncMasterlist, isSyncing, lastSync };
};