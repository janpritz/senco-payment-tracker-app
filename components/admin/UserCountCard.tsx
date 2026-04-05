"use client";

import { useState } from "react";
import { History, ArrowRight } from "lucide-react";
import UserTransactionsModal from "./UserTransactionsModal";

// Explicitly define the props to fix "IntrinsicAttributes" error
interface UserCountCardProps {
  userId: number;
  userName: string;
  count: number;
}

export default function UserCountCard({ userId, userName, count }: UserCountCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <History size={20} />
          </div>
          <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </div>
        
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
          {userName}'s Transactions
        </p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">
          {count.toLocaleString()}
        </h3>
      </div>

      {/* The Modal triggered by this card */}
      <UserTransactionsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={userId} 
        userName={userName} 
      />
    </>
  );
}