'use client';

import React, { useState, useEffect } from 'react';
import { GraduationSchedule } from '@/types/graduation';
import { GraduationApi } from '@/lib/graduation';
import ScheduleTable from '@/app/admin/schedule/components/ScheduleTable';
import ScheduleModal from '@/components/schedule/ScheduleModal';

export default function GraduationScheduleAdminPage() {
  const [schedules, setSchedules] = useState<GraduationSchedule[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<GraduationSchedule>({
    title: '', start_date: '', notice_text: '', is_important: false
  });

  useEffect(() => { loadSchedules(); }, []);

  const loadSchedules = async () => {
    try {
      const data = await GraduationApi.getAll();
      setSchedules(data);
    } catch (err) { console.error(err); }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const idToUpdate = editingId;

    setIsModalOpen(false);
    resetForm();

    try {
      if (isEdit && idToUpdate) {
        await GraduationApi.update(idToUpdate, formData);
      } else {
        await GraduationApi.create(formData);
      }
      loadSchedules();
    } catch (err) { console.error(err); }
  };

  const initiateEdit = (schedule: GraduationSchedule) => {
    setEditingId(schedule.id || null);
    setFormData({
      title: schedule.title,
      start_date: schedule.start_date ? schedule.start_date.substring(0, 16) : '',
      end_date: schedule.end_date ? schedule.end_date.substring(0, 16) : undefined,
      notice_text: schedule.notice_text || '',
      is_important: schedule.is_important
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this milestone event?')) return;
    try {
      await GraduationApi.delete(id);
      loadSchedules();
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', start_date: '', notice_text: '', is_important: false });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">SENCO Graduation Schedule</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all active:scale-95"
        >
          + Create Event
        </button>
      </div>
      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData} 
        setFormData={setFormData} 
        onSubmit={handleFormSubmit} 
        isEditing={!!editingId} 
        onCancel={resetForm}
        onCloseFromCancel={() => setIsModalOpen(false)}
      />
      <ScheduleTable 
        schedules={schedules} 
        onEdit={initiateEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}