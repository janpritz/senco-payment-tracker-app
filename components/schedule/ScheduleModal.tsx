"use client";

import { X } from "lucide-react";
import { GraduationSchedule } from "@/types/graduation";
import ScheduleForm from "@/app/admin/schedule/components/ScheduleForm";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: GraduationSchedule;
  setFormData: React.Dispatch<React.SetStateAction<GraduationSchedule>>;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onCancel: () => void;
  onCloseFromCancel?: () => void;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEditing,
  onCancel,
  onCloseFromCancel
}: ScheduleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              {isEditing ? "Edit Graduation Event" : "New Graduation Event"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Schedule Management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <ScheduleForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
            isEditing={isEditing}
            onCancel={onCancel}
            onClose={onCloseFromCancel || onClose}
            showHeader={false}
            containerClassName="space-y-4"
          />
        </div>
      </div>
    </div>
  );
}
