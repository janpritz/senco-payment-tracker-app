"use client";

import { X, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fixEncoding } from "@/lib/utils";

interface Student {
    full_name: string;
    student_id: string;
    college: string;
    payments?: any[];
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

        // 1. HEADER IMAGE
        try {
            const base64Img = await loadLocalImage("/header_img.png");
            doc.addImage(base64Img, "PNG", 5, 7, 200, 35);
        } catch (e) {
            console.error("Header image failed:", e);
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("SENCO REPORT", 105, 25, { align: "center" });
        }

        // 2. REPORT TITLE & PADDING
        let currentY = 55; 
        const reportTitle = type === "fully_paid" 
            ? "Full List of Fully Paid Students" 
            : "Full List of Zero Payment Students";

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(reportTitle, 105, currentY, { align: "center" });

        currentY += 15; 

        // 3. GROUPING LOGIC
        const colleges = ["CASE", "COHME", "CCJE", "CITE"];
        const grouped = colleges.reduce((acc, college) => {
            acc[college] = students.filter(
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
                ? ["ID", "Name", "Paid Date"]
                : ["ID", "Name"];

            const tableRows = collegeStudents.map((student) => {
                const row: any[] = [
                    student.student_id,
                    fixEncoding(student.full_name),
                ];

                if (type === "fully_paid") {
                    const lastPayment = student.payments?.length
                        ? new Date(Math.max(...student.payments.map((p) => new Date(p.created_at).getTime()))).toLocaleDateString()
                        : "N/A";
                    row.push(lastPayment);
                }
                return row;
            });

            autoTable(doc, {
                startY: currentY + 5,
                head: [tableColumn],
                body: tableRows,
                theme: "grid",
                headStyles: {
                    fillColor: type === "fully_paid" ? [22, 163, 74] : [234, 88, 12],
                    fontSize: 9,
                },
                styles: { fontSize: 8 },
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

        if (!hasData) {
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text("No records available.", 105, 80, { align: "center" });
        }

        // 4. FOOTER (Aligned Left/Right on same line)
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // System Disclaimer (Left Side - Aligned with Page Number Y)
            doc.setTextColor(160, 160, 160);
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.text(
                `System Generated Report on ${new Date().toLocaleString()}.`,
                14,
                285,
                { align: "left" }
            );

            // Page Number (Right Side - Aligned with Disclaimer Y)
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(9);
            doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: "right" });
        }

        doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
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
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="py-3 px-4">College</th>
                                <th className="py-3 px-4">Name</th>
                                {type === "fully_paid" && <th className="py-3 px-4">Paid Date</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map((student, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 font-medium text-gray-700">{student.college}</td>
                                    <td className="py-4 px-4">
                                        <div className="font-bold text-gray-900">{fixEncoding(student.full_name)}</div>
                                        <div className="text-xs text-gray-500">{student.student_id}</div>
                                    </td>
                                    {type === "fully_paid" && (
                                        <td className="py-4 px-4 text-sm text-gray-600">
                                            {student.payments?.length
                                                ? new Date(Math.max(...student.payments.map((p) => new Date(p.created_at).getTime()))).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};