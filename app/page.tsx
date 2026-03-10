"use client";

import { useState } from "react";
function StatusBadge({ status }: { status: string }) {

  const isPaid = status === "Fully Paid";

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
      ${isPaid
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {isPaid ? "✔ Fully Paid" : "⏳ Installment"}
    </span>
  );
}

export default function Home() {

  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const API_URL = "https://opensheet.elk.sh/1cHCAgDt2Xf2YXFZ7JPz5IgRhGTTJ-TxD-a0FWql8ppI/1";

  const [history, setHistory] = useState([]);

  const searchStudent = async () => {

    setLoading(true);
    setSearched(true);

    const res = await fetch(API_URL);
    const data = await res.json();

    const results = data.filter(
      (item: any) => item["Student ID"] === studentId
    );

    if (results.length > 0) {

      // Sort by latest timestamp
      results.sort(
        (a: any, b: any) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
      );

      setStudent(results[0]); // latest payment
      setHistory(results);   // full payment history

    } else {

      setStudent(null);
      setHistory([]);

    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">

        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          SENCO PAYMENT TRACKER
        </h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="flex-1 border border-gray-200 text-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />

          <button
            onClick={searchStudent}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Check
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-500 mt-4">
            Checking payment record...
          </p>
        )}

        {student && !loading && (
          <div className="mt-6 border-t pt-6 space-y-2 text-gray-700">

            <h2 className="text-lg font-medium text-gray-800 mb-2">
              Student Information
            </h2>

            <p>
              <span className="text-gray-500">Name:</span>{" "}
              {student["First Name"]} {student["Middle Name"]} {student["Last Name"]}
            </p>

            <p>
              <span className="text-gray-500">College:</span>{" "}
              {student["College"]}
            </p>

            <p>
              <span className="text-gray-500">Payment:</span> ₱{student["Payment"]}
            </p>

            <p>
              <span className="text-gray-500">Balance:</span> ₱{student["Balance"]}
            </p>

            <p>
              <span className="text-gray-500">Status:</span>{" "}
              <StatusBadge status={student["Status"]} />
            </p>

            <p className="text-sm text-gray-500">
              Last Payment: {student["Timestamp"]}
            </p>

          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-3">
              Payment History
            </h2>
            <div className="overflow-hidden border rounded-lg">
              <table className="w-full text-xs text-gray-800">
                <thead className="bg-gray-100 text-gray-800">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Payment</th>
                    <th className="p-2 text-left">Balance</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="p-2">{item["Timestamp"]}</td>
                      <td className="p-2">₱{item["Payment"]}</td>
                      <td className="p-2">₱{item["Balance"]}</td>
                      <td className="p-2">
                        <StatusBadge status={item["Status"]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {searched && !student && !loading && (
          <p className="text-center text-red-500 mt-6">
            Student not found
          </p>
        )}

      </div>

    </main>
  );
}