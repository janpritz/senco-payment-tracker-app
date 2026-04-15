import { NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Your database client

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        if (!q) {
            return NextResponse.json({ message: "Query required" }, { status: 400 });
        }

        /* DATABASE LOGIC EXAMPLE (Prisma):
           const student = await db.student.findFirst({
               where: {
                   OR: [
                       { studentId: q },
                       { fullName: { contains: q, mode: 'insensitive' } }
                   ]
               },
               select: {
                   studentId: true,
                   fullName: true,
                   college: true,
                   balance: true,
               }
           });
        */

        // Mock Logic for testing
        if (q === "2022-0001" || q.toLowerCase() === "fritz") {
            return NextResponse.json({
                id: "2022-0001",
                name: "Fritz Cabalhin",
                college: "BSIT",
                balance: 1500.00
            });
        }

        return NextResponse.json({ message: "Not found" }, { status: 404 });

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}