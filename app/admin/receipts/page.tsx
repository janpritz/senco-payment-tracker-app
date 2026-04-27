"use client";

import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { db, Student as DbStudent, Payment as DbPayment, formatPaymentForDexie } from '@/lib/db'; 
import { generateFullyPaidReceipts } from '@/services/receiptGenerator';
import { FileDown, Printer, Database, UserMinus, RefreshCw } from 'lucide-react';

interface StudentWithBalance extends DbStudent {
    payments: DbPayment[];
    remaining_balance: number;
}

const ReportsPage = () => {
    const [studentsWithHistory, setStudentsWithHistory] = useState<StudentWithBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const syncAndLoadData = async () => {
        setSyncing(true);
        try {
            // 1. CLEAR EXISTING LOCAL DATA
            await db.students.clear();
            await db.payments.clear();

            // 2. FETCH FROM BACKEND
            // Ensure this endpoint returns { students: [], payments: [] }
            const response = await api.get('/admin/receipts/sync');
            const { students, payments } = response.data;

            // 3. RE-POPULATE INDEXEDDB
            await db.students.bulkAdd(students);
            const formattedPayments = payments.map((p: any) => formatPaymentForDexie(p));
            await db.payments.bulkAdd(formattedPayments);

            // 4. ENRICH DATA FOR UI
            const enrichedData: StudentWithBalance[] = students.map((student: any) => {
                const studentPayments = formattedPayments.filter((p: any) => p.student_id === student.student_id);
                const totalPaid = studentPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
                const startingBalance = student.balance > 0 ? student.balance : 4000;

                return {
                    ...student,
                    payments: studentPayments,
                    remaining_balance: Math.max(0, startingBalance - totalPaid)
                };
            });

            setStudentsWithHistory(enrichedData);
        } catch (error) {
            console.error("Sync failed:", error);
            // Fallback: try to load whatever is left in DB if fetch fails
            loadLocalOnly();
        } finally {
            setSyncing(false);
            setLoading(false);
        }
    };

    const loadLocalOnly = async () => {
        const allStudents = await db.students.toArray();
        const allPayments = await db.payments.toArray();
        // ... (Same enrichment logic as above)
    };

    useEffect(() => {
        syncAndLoadData();
    }, []);

    const stats = useMemo(() => {
        const fullyPaid = studentsWithHistory.filter(s => s.remaining_balance <= 0).length;
        const zeroPayments = studentsWithHistory.filter(s => s.payments.length === 0).length;
        return { fullyPaid, zeroPayments };
    }, [studentsWithHistory]);

    return (
        <div className="space-y-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Receipts Dashboard</h1>
                    <p className="text-gray-600">Print Receipts</p>
                </div>
                <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full ${syncing ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {syncing ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                    {syncing ? "SYNCING..." : "LIVE DATA READY"}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Fully Paid Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <div className="text-gray-500 text-sm font-medium">Fully Paid Students</div>
                        <div className="text-2xl font-bold text-green-600">{stats.fullyPaid}</div>
                    </div>
                </div>

                {/* Zero Payment Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <UserMinus size={24} />
                    </div>
                    <div>
                        <div className="text-gray-500 text-sm font-medium">Zero Payment Students</div>
                        <div className="text-2xl font-bold text-orange-600">{stats.zeroPayments}</div>
                    </div>
                </div>
                
                {/* Total Sync Card (Optional/Extra) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <div className="text-gray-500 text-sm font-medium">Total Records Synced</div>
                        <div className="text-2xl font-bold text-blue-600">{studentsWithHistory.length}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-semibold text-gray-800">Export Options</h2>
                </div>

                <div className="divide-y divide-gray-100">
                    <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Printer size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Bulk Official Receipts</h3>
                                <p className="text-sm text-gray-500 max-w-sm">
                                    Generates 3-inch high receipts (A4 Portrait, 2-Column).
                                    Only includes students with 0 remaining balance.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => generateFullyPaidReceipts(studentsWithHistory)}
                            disabled={loading || syncing || stats.fullyPaid === 0}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                            <FileDown size={18} />
                            {syncing ? 'Syncing...' : 'Export Receipts (PDF)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;