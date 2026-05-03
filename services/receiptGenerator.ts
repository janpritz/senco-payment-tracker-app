import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/lib/axios";
import { fixEncoding } from "@/lib/utils";

export interface ReceiptClaim {
    id: number;
    full_name: string;
    student_id: string;
    remaining_balance: number;
    payments: Array<{
        created_at: string;
        reference_number: string;
        amount: number | string;
    }>;
}

export const generateFullyPaidReceipts = async (claims: ReceiptClaim[]): Promise<void> => {
    const sortedClaims = [...claims].sort((a, b) => a.id - b.id);

    if (sortedClaims.length === 0) {
        alert("No receipt claims found to print.");
        return;
    }

    const idsToMark = sortedClaims.map(c => c.id);
    const doc = new jsPDF({ orientation: "portrait", unit: "in", format: "a4" });

    const receiptWidth = 3.9;
    const receiptHeight = 2.15;
    const margin = 0.15;
    const gap = 0.08;

    let col = 0;
    let row = 0;

    sortedClaims.forEach((claim) => {
        if (row >= 5) {
            doc.addPage();
            row = 0;
            col = 0;
        }

        const x = margin + (col * (receiptWidth + gap));
        const y = margin + (row * (receiptHeight + gap));
        const padding = 0.12;
        const contentWidth = receiptWidth - (padding * 2);

        // --- Border ---
        doc.setDrawColor(0);
        doc.setLineWidth(0.003);
        doc.rect(x, y, receiptWidth, receiptHeight);

        // --- Header ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("SENCO OFFICIAL RECEIPT", x + receiptWidth / 2, y + 0.3, { align: "center" });

        // === Narrative Section (Fixed Styling) ===
        const startY = y + 0.55;
        let currentY = startY;
        const name = claim.full_name.toUpperCase();
        const amountText = "FOUR THOUSAND PESOS (P4,000.00)";
        
        doc.setFontSize(9);
        const lineSpacing = 0.18;
        const part1 = "This is to certify that ";
        const part2 = " has paid the amount of ";
        const part3 = " as payment for Graduation Contribution.";

        let cursorX = x + padding;

        // 1. Part 1
        doc.setFont("helvetica", "normal");
        doc.text(part1, cursorX, currentY);
        cursorX += doc.getTextWidth(part1);

        // 2. Name (BOLD + UNDERLINE)
        doc.setFont("helvetica", "bold");
        doc.text(fixEncoding(name).toUpperCase(), cursorX, currentY);
        doc.setLineWidth(0.005);
        doc.line(cursorX, currentY + 0.02, cursorX + doc.getTextWidth(name), currentY + 0.02);
        cursorX += doc.getTextWidth(name);

        // 3. Part 2 (Wrap Check)
        doc.setFont("helvetica", "normal");
        if (cursorX + doc.getTextWidth(part2) > (x + receiptWidth - padding)) {
            currentY += lineSpacing;
            cursorX = x + padding;
        }
        doc.text(part2, cursorX, currentY);
        cursorX += doc.getTextWidth(part2);

        // 4. Amount (BOLD + Wrap Check)
        if (cursorX + doc.getTextWidth(amountText) > (x + receiptWidth - padding)) {
            currentY += lineSpacing;
            cursorX = x + padding;
        }
        doc.setFont("helvetica", "bold");
        doc.text(amountText, cursorX, currentY);
        cursorX += doc.getTextWidth(amountText);

        // 5. Part 3 (Wrap Check)
        doc.setFont("helvetica", "normal");
        if (cursorX + doc.getTextWidth(part3) > (x + receiptWidth - padding)) {
            currentY += lineSpacing;
            cursorX = x + padding;
        }
        doc.text(part3, cursorX, currentY);
        currentY += lineSpacing;

        // --- Payment Table ---
        autoTable(doc, {
            startY: currentY + 0.05,
            margin: { left: x + padding, right: x + padding },
            tableWidth: contentWidth,
            styles: { fontSize: 7, cellPadding: 0.02, lineWidth: 0.003, fontStyle: 'bold' },
            head: [['Date', 'Reference No.', 'Amount']],
            body: claim.payments
                .filter(p => Number(p.amount) !== 0)
                .map(p => [
                    new Date(p.created_at).toLocaleString(undefined, {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: 'numeric', minute: '2-digit', hour12: true
                    }),
                    p.reference_number,
                    `P${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                ]),
            theme: 'grid',
        });

        // --- Footer ---
        const bottomY = y + receiptHeight;
        const footerBaseline = bottomY - 0.08;
        const sigY = bottomY - 0.35;

        doc.setLineWidth(0.003);
        doc.line(x + receiptWidth - 1.2, sigY, x + receiptWidth - 0.12, sigY);
        doc.setFontSize(6);
        doc.text("SIGNATURE", x + receiptWidth - 0.65, sigY + 0.07, { align: "center" });

        doc.setFont("helvetica", "bold").setFontSize(8);
        doc.text("STATUS: FULLY PAID", x + 0.12, sigY);

        const filingIdStr = `ID: ${claim.id.toString().padStart(4, '0')}`;
        doc.setFontSize(12);
        doc.text(filingIdStr, x + 0.12, footerBaseline);

        const timestamp = `Generated: ${new Date().toLocaleString()}`;
        doc.setFont("helvetica", "italic").setFontSize(5);
        doc.text(timestamp, x + receiptWidth - 1.2, footerBaseline);

        // Grid Traversal (Inside Loop)
        if (col === 0) { col = 1; } else { col = 0; row++; }
    }); // End of forEach

    doc.save(`SENCO_Receipts_${new Date().toLocaleDateString()}.pdf`);

    try {
        await api.post('/admin/receipts/mark-exported', { ids: idsToMark });
        window.location.reload();
    } catch (error) {
        console.error("Failed to update export status:", error);
    }
};