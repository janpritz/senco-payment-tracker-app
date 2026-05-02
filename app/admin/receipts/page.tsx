"use client";

import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { db, Student as DbStudent, Payment as DbPayment, formatPaymentForDexie } from '@/lib/db';
import { generateFullyPaidReceipts } from '@/services/receiptGenerator';
import { FileDown, Printer, Database, UserMinus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { StudentModal } from "@/components/receipts/StudentModal";

interface StudentWithBalance extends DbStudent {
    payments: DbPayment[];
    remaining_balance: number;
    filing_id?: number;
    is_claimed: boolean;
    is_exported: boolean;
}

const ReportsPage = () => {
    const [studentsWithHistory, setStudentsWithHistory] = useState<StudentWithBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const syncAndLoadData = async () => {
        setSyncing(true);
        try {
            await db.students.clear();
            await db.payments.clear();

            // Fetch students, payments, and the receipt_claims manifest
            const response = await api.get('/admin/receipts/sync');
            const { students, payments, receipt_claims } = response.data;

            await db.students.bulkPut(students);
            const formattedPayments = payments.map((p: any) => formatPaymentForDexie(p));
            await db.payments.bulkPut(formattedPayments);

            const enrichedData: StudentWithBalance[] = students.map((student: any) => {
                const studentPayments = formattedPayments.filter((p: any) => p.student_id === student.student_id);
                const totalPaid = studentPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
                const startingBalance = student.balance > 0 ? student.balance : 4000;

                // Link filing manifest data
                const claimRecord = receipt_claims?.find((c: any) => c.student_id === student.student_id);

                return {
                    ...student,
                    payments: studentPayments,
                    remaining_balance: Math.max(0, startingBalance - totalPaid),
                    filing_id: claimRecord?.id,
                    is_claimed: claimRecord?.is_claimed || false,
                    is_exported: claimRecord?.is_exported || false
                };
            });

            setStudentsWithHistory(enrichedData);
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setSyncing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        syncAndLoadData();
    }, []);

    const stats = useMemo(() => {
        const fullyPaidList = studentsWithHistory.filter(s => s.remaining_balance <= 0);
        const zeroPaymentsList = studentsWithHistory.filter(s => s.payments.length === 0);
        return {
            fullyPaid: fullyPaidList.length,
            fullyPaidData: fullyPaidList,
            zeroPayments: zeroPaymentsList.length,
            zeroPaymentsData: zeroPaymentsList,
            totalClaimed: fullyPaidList.filter(s => s.is_claimed).length,
            totalExported: fullyPaidList.filter(s => s.is_exported).length
        };
    }, [studentsWithHistory]);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        type: "fully_paid" | "zero_payment";
        data: StudentWithBalance[];
    }>({
        isOpen: false,
        title: "",
        type: "fully_paid",
        data: []
    });

    return (
        <div className="space-y-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">SENCO Reports</h1>
                    <p className="text-gray-600">Manage Graduation Fee Receipts & Claims</p>
                </div>
                <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full ${syncing ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {syncing ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                    {syncing ? "SYNCING..." : "LIVE DATA READY"}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Fully Paid */}
                <div onClick={() => setModalConfig({ isOpen: true, title: "Fully Paid Students", type: "fully_paid", data: stats.fullyPaidData })}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-green-400 hover:shadow-md transition-all">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Database size={24} /></div>
                    <div>
                        <div className="text-gray-500 text-sm font-medium">Fully Paid</div>
                        <div className="text-2xl font-bold text-green-600">{stats.fullyPaid}</div>
                    </div>
                </div>

                {/* Claimed Stat */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle2 size={24} /></div>
                    <div>
                        <div className="text-gray-500 text-sm font-medium">Total Claimed</div>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalClaimed}</div>
                    </div>
                </div>

                {/* Exported Stat */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Printer size={24} /></div>
                    <div>
                        <div className="text-gray-500 text-sm font-medium">Printed/Exported</div>
                        <div className="text-2xl font-bold text-indigo-600">{stats.totalExported}</div>
                    </div>
                </div>

                {/* Zero Payments */}
                <div onClick={() => setModalConfig({ isOpen: true, title: "Zero Payment Students", type: "zero_payment", data: stats.zeroPaymentsData })}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><UserMinus size={24} /></div>
                    <div>
                        <div className="text-gray-500 text-sm font-medium">Zero Payment</div>
                        <div className="text-2xl font-bold text-orange-600">{stats.zeroPayments}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-semibold text-gray-800">Export Actions</h2>
                </div>
                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Printer size={24} /></div>
                        <div>
                            <h3 className="font-bold text-gray-900">Bulk Official Receipts</h3>
                            <p className="text-sm text-gray-500 max-w-sm">Generates Filing IDs for physical organization. Only for students with 0 balance.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            // We pass the pre-calculated list of fully paid students 
                            // who have a valid filing_id from receipt_claims
                            const claimsForPrinting = stats.fullyPaidData.map(s => ({
                                id: s.filing_id!, // This is the ID starting at 1
                                full_name: s.full_name,
                                student_id: s.student_id,
                                remaining_balance: s.remaining_balance,
                                payments: s.payments
                            }));

                            generateFullyPaidReceipts(claimsForPrinting);
                        }}
                        disabled={loading || syncing || stats.fullyPaid === 0}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                    >
                        <FileDown size={18} />
                        {syncing ? 'Syncing...' : 'Export PDF Manifest'}
                    </button>
                </div>
            </div>

            <StudentModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                type={modalConfig.type}
                students={modalConfig.data}
            />
        </div>
    );
};

export default ReportsPage;