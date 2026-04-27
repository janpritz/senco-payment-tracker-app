import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReceiptData {
    full_name: string;
    student_id: string;
    remaining_balance: number;
    payments: Array<{
        created_at: string;
        reference_number: string;
        amount: number | string;
    }>;
}

export const generateFullyPaidReceipts = (students: ReceiptData[]): void => {
    const fullyPaid = students.filter(s => s.remaining_balance <= 0);

    if (fullyPaid.length === 0) {
        alert("No fully paid students found.");
        return;
    }

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "a4",
    });

    const receiptWidth = 3.7;
    const receiptHeight = 1.8;

    const margin = 0.15;
    const gap = 0.08;

    let col = 0;
    let row = 0;

    fullyPaid.forEach((student) => {
        if (row > 5) {
            doc.addPage();
            row = 0;
            col = 0;
        }

        const x = margin + (col * (receiptWidth + gap));
        const y = margin + (row * (receiptHeight + gap));

        const padding = 0.12;
        const contentWidth = receiptWidth - (padding * 2);

        // Border
        doc.setDrawColor(0);
        doc.setLineWidth(0.003);
        doc.rect(x, y, receiptWidth, receiptHeight);

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("SENCO OFFICIAL RECEIPT", x + receiptWidth / 2, y + 0.25, {
            align: "center"
        });

        // === Narrative ===
        const startY = y + 0.45;
        let currentY = startY;

        const name = student.full_name;
        const amountText = "FOUR THOUSAND PESOS (P4,000.00)";
        const fullText = `${name} has paid an amount of ${amountText} as payment for Graduation Contribution.`;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const lines = doc.splitTextToSize(fullText, contentWidth);

        lines.forEach((line: string) => {
            let cursorX = x + padding;

            if (line.includes(name)) {
                const parts = line.split(name);

                doc.setFont("helvetica", "normal");
                doc.text(parts[0], cursorX, currentY);
                cursorX += doc.getTextWidth(parts[0]);

                doc.setFont("helvetica", "bold");
                doc.text(name, cursorX, currentY);

                const nameWidth = doc.getTextWidth(name);
                doc.setLineWidth(0.002);
                doc.line(cursorX, currentY + 0.01, cursorX + nameWidth, currentY + 0.01);

                cursorX += nameWidth;

                doc.setFont("helvetica", "normal");
                doc.text(parts[1] || "", cursorX, currentY);

            } else if (line.includes(amountText)) {
                const parts = line.split(amountText);

                doc.setFont("helvetica", "normal");
                doc.text(parts[0], cursorX, currentY);
                cursorX += doc.getTextWidth(parts[0]);

                doc.setFont("helvetica", "bold");
                doc.text(amountText, cursorX, currentY);

                cursorX += doc.getTextWidth(amountText);

                doc.setFont("helvetica", "normal");
                doc.text(parts[1] || "", cursorX, currentY);

            } else {
                doc.setFont("helvetica", "normal");
                doc.text(line, cursorX, currentY);
            }

            currentY += 0.14;
        });

        // === TABLE ===
        const tableStartY = currentY + 0.02;

        autoTable(doc, {
            startY: tableStartY,
            margin: { left: x + padding, right: x + padding },
            tableWidth: contentWidth,
            styles: {
                fontSize: 5,
                cellPadding: 0.015,
                lineWidth: 0.003,
                fontStyle: 'bold',
            },
            head: [['Date', 'Reference No.', 'Amount']],
            body: student.payments
                .filter(p => Number(p.amount) !== 0)
                .map(p => [
                    new Date(p.created_at).toLocaleString(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    p.reference_number,
                    `P${Number(p.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })}`
                ]),
            theme: 'grid',
        });

        // === BOTTOM-ALIGNED ELEMENTS ===
        const bottomY = y + receiptHeight;
        const sigY = bottomY - 0.25;

        // Signature line
        doc.setLineWidth(0.003);
        doc.line(
            x + receiptWidth - 1.2,
            sigY,
            x + receiptWidth - 0.12,
            sigY
        );

        // Signature label
        doc.setFontSize(6);
        doc.text("SIGNATURE",
            x + receiptWidth - 0.65,
            sigY + 0.07,
            { align: "center" }
        );

        // STATUS aligned with signature
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text("STATUS: FULLY PAID",
            x + 0.12,
            sigY
        );

        // 🗓 Generated date (bottom-left note)
        const generatedText = `Generated: ${new Date().toLocaleString()}`;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(5);

        doc.text(
            generatedText,
            x + 0.12,                 // left padding
            y + receiptHeight - 0.05  // very bottom, safe margin
        );

        // ✅ RESTORED GRID FLOW
        if (col === 0) {
            col = 1;
        } else {
            col = 0;
            row++;
        }
    });

    doc.save(`SENCO_Receipts_${new Date().toLocaleDateString()}.pdf`);
};