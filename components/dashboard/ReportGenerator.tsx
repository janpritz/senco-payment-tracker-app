"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios"; // Use your existing axios instance
import { Download, Loader2, Calendar, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";
import { fixEncoding } from "@/lib/utils"; // Import the encoding fix function

export default function ReportGenerator() {
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingDates, setIsLoadingDates] = useState(true);

    // 1. Fetch unique dates from the BACKEND
    useEffect(() => {
        const fetchDates = async () => {
            try {
                const response = await api.get("/admin/reports/dates");
                const uniqueDates = response.data;

                setAvailableDates(uniqueDates);
                if (uniqueDates.length > 0) {
                    setSelectedDate(uniqueDates[0]);
                }
            } catch (error) {
                console.error("Failed to load dates:", error);
                toast.error("Could not fetch collection dates.");
            } finally {
                setIsLoadingDates(false);
            }
        };

        fetchDates();
    }, []);

    // ReportGenerator.tsx

    const generatePDF = async () => {
        if (!selectedDate) return;
        setIsGenerating(true);

        try {
            // Destructure grand_total from the response
            const response = await api.get(`/admin/reports/generate?date=${selectedDate}`);
            const { stats, transactions, grand_total, summary_list, overall_grand_total } = response.data;

            const doc = new jsPDF();

            const loadImage = (url: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => resolve(img);
                    img.onerror = (err) => reject(err);
                });
            };

            const headerImg = await loadImage('/header_img.png');
            doc.addImage(headerImg, 'PNG', 10, 0, 190, 40);

            // --- TITLE SECTION ---
            const pageWidth = doc.internal.pageSize.getWidth();

            // Main Title: Centered and Larger
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(`COLLECTION REPORT FOR: ${selectedDate}`, pageWidth / 2, 50, { align: "center" });

            // Subtitle: Left Aligned and Smaller
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(`College Distribution Stats`, 14, 60);

            // Reset text color for the table
            doc.setTextColor(0);

            // // --- GRAND TOTAL (Added after title) ---
            // doc.setFontSize(14);
            // doc.setTextColor(16, 185, 129); // Emerald Green color
            // doc.text(
            //     `GRAND TOTAL COLLECTION: P${Number(grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            //     14,
            //     60
            // );

            // Reset text color for the rest of the doc
            doc.setTextColor(0, 0, 0);

            // --- STATS TABLE ---
            autoTable(doc, {
                startY: 65, // Adjusted startY to make room for Grand Total
                margin: { bottom: 35 },
                styles: { font: "helvetica", fontStyle: "normal" },
                head: [['College', "Collection", 'Total Students', 'Paid in Full', 'Partial Payment']],
                body: stats.map((s: any) => [
                    s.college,
                    `P${s.total_collected.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                    s.student_count,
                    s.paid_in_full,
                    s.partial_payments,
                ]),
                headStyles: { fillColor: [10, 23, 42] },
            });

            // --- TRANSACTION TABLE ---
            const finalY = (doc as any).lastAutoTable.finalY;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Payment Details", 14, finalY + 10);

            autoTable(doc, {
                startY: finalY + 15,
                margin: { bottom: 35 },
                styles: { font: "helvetica", fontStyle: "normal" },
                head: [['Ref #', 'Student Name', 'Amount', 'Time', 'Collector']],
                body: transactions.map((t: any) => [
                    t.reference_number,
                    fixEncoding(t.student_name),
                    `P${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                    t.time,
                    t.collected_by
                ]),
                headStyles: { fillColor: [51, 65, 85] },
            });

            // --- FINAL SUMMARY SECTION ---
            // --- FINAL SUMMARY SECTION ---
            const afterTransactionsY = (doc as any).lastAutoTable?.finalY || 70;

            // Use the top-level doc.getNumberOfPages() instead of doc.internal
            if (afterTransactionsY > 200) {
                doc.addPage();
                const newTotalPages = doc.getNumberOfPages();
                doc.setPage(newTotalPages);
            }

            // Positioning logic for the Summary Title
            const summaryTitleY = (afterTransactionsY > 200) ? 20 : afterTransactionsY + 20;

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(10, 23, 42);
            doc.text("Collection Summary (All Dates)", 14, summaryTitleY);

            autoTable(doc, {
                startY: summaryTitleY + 5,
                head: [['Date', 'Amount Collected']],
                body: [
                    ...summary_list.map((item: any) => [
                        item.date,
                        `P${Number(item.daily_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    ]),
                    // Summary Footer Row
                    [
                        {
                            content: 'GRAND TOTAL COLLECTION',
                            styles: { fontStyle: 'bold', fillColor: [241, 245, 249] }
                        },
                        {
                            content: `P${Number(overall_grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                            styles: { fontStyle: 'bold', fillColor: [241, 245, 249] }
                        }
                    ]
                ],
                headStyles: { fillColor: [15, 23, 42] },
                theme: 'striped',
            });

            // --- FOOTER LOGIC ---
            const totalPages = (doc as any).internal.getNumberOfPages();
            const manilaTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Manila',
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(new Date());

            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;

                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(150);
                doc.setDrawColor(230, 230, 230);
                doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);

                doc.text(`System Generated Report • ${manilaTime}`, 14, pageHeight - 12);
                doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 12);
            }

            doc.save(`Collection_Report_${selectedDate}.pdf`);
            toast.success("Report generated successfully!");

        } catch (error) {
            console.error(error);
            toast.error("Error generating report.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1 w-full">
                <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
                    <Calendar size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-slate-600 mb-0.5 ml-1">Available Collection Dates</p>
                    <div className="relative">
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            disabled={isLoadingDates || availableDates.length === 0}
                            className="w-full appearance-none bg-slate-200 border-none text-sm font-black text-slate-900 py-2 px-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer disabled:opacity-50"
                        >
                            {isLoadingDates ? (
                                <option>Loading dates...</option>
                            ) : availableDates.length > 0 ? (
                                availableDates.map(date => (
                                    <option key={date} value={date}>{date}</option>
                                ))
                            ) : (
                                <option>No collections recorded</option>
                            )}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <button
                onClick={generatePDF}
                disabled={isGenerating || !selectedDate}
                className="w-full md:w-auto px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
            >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                <span>Generate Report</span>
            </button>
        </div>
    );
}