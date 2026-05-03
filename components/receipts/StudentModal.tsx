"use client";

import { X, FileDown, CheckCircle, Clock, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fixEncoding } from "@/lib/utils";

interface Student {
    full_name: string;
    student_id: string;
    college: string;
    payments?: any[];
    filing_id?: number;
    is_claimed: boolean;
    is_exported: boolean;
}

interface StudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    students: Student[];
    type: "fully_paid" | "zero_payment";
}

export const StudentModal = ({
    isOpen,
    onClose,
    title,
    students,
    type,
}: StudentModalProps) => {
    if (!isOpen) return null;

    // --- SORTING LOGIC ---
    // We sort students by filing_id ascending. Students without an ID (N/A) go to the bottom.
    const sortedStudents = [...students].sort((a, b) => {
        if (type === "fully_paid") {
            return (a.filing_id || Infinity) - (b.filing_id || Infinity);
        }
        return a.full_name.localeCompare(b.full_name);
    });

    const loadLocalImage = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => reject(new Error("Image load failed"));
        });
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();

        try {
            const base64Img = await loadLocalImage("/header_img.png");
            doc.addImage(base64Img, "PNG", 5, 7, 200, 35);
        } catch (e) {
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("SENCO REPORT", 105, 25, { align: "center" });
        }

        let currentY = 55; 
        const reportTitle = type === "fully_paid" 
            ? "Full List of Fully Paid Students (Sorted by Filing ID)" 
            : "Full List of Zero Payment Students";

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(reportTitle, 105, currentY, { align: "center" });

        currentY += 15; 

        // PDF Grouping using the SORTED list
        const colleges = ["CASE", "COHME", "CCJE", "CITE"];
        const grouped = colleges.reduce((acc, college) => {
            acc[college] = sortedStudents.filter(
                (s) => s.college?.toUpperCase() === college
            );
            return acc;
        }, {} as Record<string, Student[]>);

        let hasData = false;

        colleges.forEach((college, index) => {
            const collegeStudents = grouped[college];
            if (!collegeStudents.length) return;

            hasData = true;

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(40, 40, 40);
            doc.text(`${college} DEPARTMENT`, 14, currentY);

            const tableColumn = type === "fully_paid"
                ? ["Filing ID", "Student ID", "Name", "Status", "Paid Date"]
                : ["Student ID", "Name"];

            const tableRows = collegeStudents.map((student) => {
                const row: any[] = [
                    type === "fully_paid" ? (student.filing_id?.toString().padStart(4, '0') || 'N/A') : null,
                    student.student_id,
                    fixEncoding(student.full_name),
                ].filter(val => val !== null);

                if (type === "fully_paid") {
                    const status = student.is_claimed ? "CLAIMED" : "UNCLAIMED";
                    const lastPayment = student.payments?.length
                        ? new Date(Math.max(...student.payments.map((p) => new Date(p.created_at).getTime()))).toLocaleDateString()
                        : "N/A";
                    row.push(status, lastPayment);
                }
                return row;
            });

            autoTable(doc, {
                startY: currentY + 5,
                head: [tableColumn],
                body: tableRows,
                theme: "grid",
                headStyles: {
                    fillColor: type === "fully_paid" ? [79, 70, 229] : [234, 88, 12],
                    fontSize: 8,
                },
                styles: { fontSize: 7 },
                margin: { bottom: 30 }, 
            });

            const tableEndY = (doc as any).lastAutoTable.finalY;
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(220, 38, 38);
            doc.text("*** Nothing Follows ***", 105, tableEndY + 7, { align: "center" });

            currentY = tableEndY + 20;

            if (currentY > 250 && index < colleges.length - 1) {
                doc.addPage();
                currentY = 20;
            }
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setTextColor(160, 160, 160);
            doc.setFontSize(7);
            doc.text(`System Generated Report on ${new Date().toLocaleString()}.`, 14, 285);
            doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: "right" });
        }

        doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {title} ({students.length})
                        </h2>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
                        >
                            <FileDown size={16} />
                            Download Report
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                                <th className="pb-4 px-4">Filing ID</th>
                                <th className="pb-4 px-4">Student Info</th>
                                <th className="pb-4 px-4">College</th>
                                <th className="pb-4 px-4">Status & Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Rendering the SORTED list in the UI */}
                            {sortedStudents.map((student, idx) => (
                                <tr key={idx} className="bg-white border border-gray-100 shadow-sm rounded-lg hover:bg-gray-50 transition-all">
                                    <td className="py-4 px-4">
                                        <div className="bg-indigo-50 text-indigo-700 font-mono font-bold text-sm px-3 py-1.5 rounded-md inline-block">
                                            #{student.filing_id?.toString().padStart(4, '0') || '----'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="font-bold text-gray-900 text-sm">{fixEncoding(student.full_name)}</div>
                                        <div className="text-xs text-gray-400 font-mono">{student.student_id}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm font-semibold text-gray-600">{student.college}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                {student.is_claimed ? (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black tracking-tighter uppercase">
                                                        <CheckCircle size={10} /> Claimed
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-black tracking-tighter uppercase">
                                                        <Clock size={10} /> Unclaimed
                                                    </span>
                                                )}
                                                {student.is_exported && (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-black tracking-tighter uppercase">
                                                        <Printer size={10} /> Printed
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-gray-500 italic">
                                                {student.payments?.length
                                                    ? `Paid: ${new Date(Math.max(...student.payments.map((p) => new Date(p.created_at).getTime()))).toLocaleDateString()}`
                                                    : "No payments recorded"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {students.length === 0 && (
                        <div className="text-center py-12 text-gray-400 font-medium italic">
                            No records found for this category.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};