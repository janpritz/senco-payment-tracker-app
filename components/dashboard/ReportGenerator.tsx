"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Download, Loader2, Calendar, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";

export default function ReportGenerator() {
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingDates, setIsLoadingDates] = useState(true);

    // Fetch unique dates from the payments table
    useEffect(() => {
        const fetchDates = async () => {
            try {
                const payments = await db.payments.toArray();
                // Extract unique dates and sort them (newest first)
                const uniqueDates = Array.from(new Set(payments.map(p => p.date)))
                    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

                setAvailableDates(uniqueDates);
                if (uniqueDates.length > 0) {
                    setSelectedDate(uniqueDates[0]);
                }
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
            // 1. Fetch Data
            const payments = await db.payments.where("date").equals(selectedDate).toArray();
            const students = await db.students.toArray();

            // 2. Create a hidden Image object to load the local file
            const loadImage = (url: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => resolve(img);
                    img.onerror = (err) => reject(err);
                });
            };

            // Load the image from your public folder
            const headerImg = await loadImage('/header_img.png');

            // 3. Initialize PDF
            const doc = new jsPDF();

            // 4. Add Header Image (using the loaded Image object)
            // Parameters: image, type, x, y, width, height
            doc.addImage(headerImg, 'PNG', 10, 0, 190, 40);

            // 5. Title and Collector Info
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`COLLECTION REPORT: ${selectedDate}`, 14, 50);

            // Get unique collectors from this date's payments
            // const collectors = Array.from(new Set(payments.map(p => p.full_name || "Admin")));
            // doc.setFontSize(10);
            // doc.setFont("helvetica", "normal");
            // doc.text(`Collected by: ${collectors.join(", ")}`, 10, 56);

            // 6. Stats Table
            autoTable(doc, {
                startY: 55,
                head: [['College', "Collection", 'Students', 'Paid', 'Zero']],
                body: ["CITE", "CASE", "CCJE", "COHME"].map(college => {
                    const collegeStudents = students.filter(s => s.college.includes(college));
                    const collegePayments = payments.filter(p =>
                        students.find(s => s.student_id === p.student_id)?.college.includes(college)
                    );
                    return [
                        college,
                        `P${collegePayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
                        collegeStudents.length,
                        collegeStudents.filter(s => s.balance <= 0).length,
                        collegeStudents.filter(s => s.balance === 4000).length
                    ];
                }),
                headStyles: { fillColor: [10, 23, 42] }
            });

            // 7. Transaction Table
            const finalY = (doc as any).lastAutoTable.finalY;
            doc.setFont("helvetica", "bold");
            doc.text("Transaction Details", 14, finalY + 10);

            autoTable(doc, {
                startY: finalY + 15,
                head: [['Reference Number', 'Student Name', 'College', 'Amount']],
                body: payments.map(p => [
                    p.reference_number,
                    p.full_name,
                    students.find(s => s.student_id === p.student_id)?.college || "N/A",
                    `P${p.amount.toLocaleString()}`
                ]),
            });

            doc.save(`Collection_Report_${selectedDate}.pdf`);
            toast.success("Report generated successfully!");

        } catch (error) {
            console.error("PDF Error:", error);
            toast.error("Failed to load header image or generate PDF.");
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