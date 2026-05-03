"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Download, Loader2, Calendar, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";
import { fixEncoding } from "@/lib/utils";

export default function ReportGenerator() {
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingDates, setIsLoadingDates] = useState(true);

    useEffect(() => {
        const fetchDates = async () => {
            try {
                const response = await api.get("/admin/reports/dates");
                const uniqueDates = response.data;

                // We keep "all" as the default or first option
                setAvailableDates(uniqueDates);
                setSelectedDate("all"); // Set All-Time as default
            } catch (error) {
                console.error("Failed to load dates:", error);
            } finally {
                setIsLoadingDates(false);
            }
        };
        fetchDates();
    }, []);

    const generatePDF = async () => {
        if (!selectedDate) return;
        setIsGenerating(true);

        try {
            const response = await api.get(`/admin/reports/generate?date=${selectedDate}`);
            const { stats, transactions, summary_list, overall_grand_total, selected_date } = response.data;

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            const loadImage = (url: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => resolve(img);
                    img.onerror = (err) => reject(err);
                });
            };

            // --- HEADER ---
            const headerImg = await loadImage('/header_img.png');
            doc.addImage(headerImg, 'PNG', 5, 7, 200, 35);

            // --- TITLE ---
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(`COLLECTION SUMMARY REPORT`, pageWidth / 2, 45, { align: "center" });

            // --- 1. COLLECTION SUMMARY ---
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(10, 23, 42);
            doc.text("Collection Dates", 14, 62);

            autoTable(doc, {
                startY: 65,
                head: [['Date', 'Amount Collected']],
                body: [
                    ...summary_list.map((item: any) => [
                        item.date,
                        `P${Number(item.daily_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    ]),
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

            // --- 2. COLLEGE DISTRIBUTION STATS ---
            const statsY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`College Distribution Stats`, 14, statsY - 5);

            autoTable(doc, {
                startY: statsY,
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

            // --- 3. SEPARATED PAYMENT RECORDS PER COLLEGE ---
            const colleges = Array.from(new Set(transactions.map((t: any) => t.college)));
            let currentY = (doc as any).lastAutoTable.finalY + 10;

            colleges.forEach((collegeName: any) => {
                if (currentY > 240) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(10, 23, 42);
                doc.text(`Payment Records: ${collegeName}`, 14, currentY);

                const collegeTransactions = transactions.filter((t: any) => t.college === collegeName);

                autoTable(doc, {
                    startY: currentY + 2,
                    margin: { bottom: 30 },
                    styles: { font: "helvetica", fontStyle: "normal", fontSize: 9 },
                    head: [['Ref #', 'Student Name', 'Amount', 'Time', 'Collector']],
                    body: [
                        ...collegeTransactions.map((t: any) => [
                            t.reference_number,
                            fixEncoding(t.student_name),
                            `P${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                            t.time,
                            t.collected_by
                        ]),
                        [
                            {
                                content: '******** Nothing Follows ********',
                                colSpan: 5,
                                styles: {
                                    halign: 'center',
                                    fontStyle: 'italic',
                                    // --- CHANGED TO RED ---
                                    textColor: [220, 38, 38],
                                    fontSize: 9,
                                    fillColor: [250, 250, 250]
                                }
                            }
                        ]
                    ],
                    headStyles: { fillColor: [51, 65, 85] },
                });

                currentY = (doc as any).lastAutoTable.finalY + 15;
            });

            // --- SIGNATORIES SECTION ---
            let finalY = (doc as any).lastAutoTable.finalY + 20;

            // Page break check for signatories
            if (finalY > 180) {
                doc.addPage();
                finalY = 25;
            }

            doc.setTextColor(0);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Reviewed by:", 14, finalY);

            finalY += 12;
            doc.setFontSize(8.5);

            // 4-column layout for Reviewed By
            const colWidth = (pageWidth - 28) / 4;
            const c1 = 14;
            const c2 = c1 + colWidth;
            const c3 = c2 + colWidth;
            const c4 = c3 + colWidth;

            // Row: Names
            doc.text("MARJORIE A. ARCHIN", c1, finalY);
            doc.text("LORRAINE C. SUPERABLE", c2, finalY);
            doc.text("CHRISTINE T. REALINO", c3, finalY);
            doc.text("JOHN MICHAEL E. KIMNO", c4, finalY);

            finalY += 4;
            doc.setFont("helvetica", "normal");
            doc.text("President, SENCO", c1, finalY);
            doc.text("Treasurer, SENCO", c2, finalY);
            doc.text("Auditor, SENCO", c3, finalY);
            doc.text("BS Entrep Representative, SENCO", c4, finalY);

            // Noted By
            finalY += 15;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("Noted by:", 14, finalY);

            finalY += 12;
            doc.setFontSize(8.5);
            const nColWidth = (pageWidth - 28) / 3;
            const nc1 = 14;
            const nc2 = nc1 + nColWidth;
            const nc3 = nc2 + nColWidth;

            doc.text("ROBERT JOHN NOVIO", nc1, finalY);
            doc.text("MARIAN JOY C. BRILLO", nc2, finalY);
            doc.text("ARYANNE QUERQUEZ-ELMIDO", nc3, finalY);

            finalY += 4;
            doc.setFont("helvetica", "normal");
            doc.text("Adviser, SENCO", nc1, finalY);
            doc.text("Adviser, SENCO", nc2, finalY);
            doc.text("Adviser, SENCO", nc3, finalY);

            // Approved By
            finalY += 15;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("Summary Report Received by:", 14, finalY);

            finalY += 12;
            doc.text("CLEMELLE L. MONTALLANA, DM, CESE", 14, finalY);
            finalY += 4;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.text("College President", 14, finalY);

            // --- FOOTER ---
            const totalPages = (doc as any).internal.getNumberOfPages();
            const manilaTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Manila',
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(new Date());

            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                const pWidth = doc.internal.pageSize.width;
                const pHeight = doc.internal.pageSize.height;
                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(150);
                doc.setDrawColor(230, 230, 230);
                doc.line(10, pHeight - 20, pWidth - 10, pHeight - 20);
                doc.text(`System Generated Report • ${manilaTime}`, 14, pHeight - 12);
                doc.text(`Page ${i} of ${totalPages}`, pWidth - 30, pHeight - 12);
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
                    <p className="text-[10px] font-black uppercase text-slate-600 mb-0.5 ml-1">Report Timeframe</p>
                    <div className="relative">
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            disabled={isLoadingDates}
                            className="w-full appearance-none bg-slate-200 border-none text-sm font-black text-slate-900 py-2 px-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer disabled:opacity-50"
                        >
                            {isLoadingDates ? (
                                <option>Loading records...</option>
                            ) : (
                                <>
                                    {availableDates.length > 0 && (
                                        <option value="all">ALL-TIME SUMMARY</option>
                                    )}
                                    {availableDates.map(date => (
                                        <option key={date} value={date}>{date}</option>
                                    ))}
                                    {availableDates.length === 0 && (
                                        <option>No collections recorded</option>
                                    )}
                                </>
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