'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GraduationSchedule } from '@/types/graduation';
import { GraduationApi } from '@/lib/graduation';
import ScheduleTable from '@/app/admin/schedule/components/ScheduleTable';
import ScheduleModal from '@/components/schedule/ScheduleModal';

export default function GraduationScheduleAdminPage() {
  const [schedules, setSchedules] = useState<GraduationSchedule[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<GraduationSchedule>({
    title: '', start_date: '', notice_text: '', is_important: false
  });

  const loadSchedules = useCallback(async () => {
    try {
      const data = await GraduationApi.getAll();
      setSchedules(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  const filteredSchedules = schedules.filter(schedule => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (schedule.title || '').toLowerCase().includes(query) ||
      (schedule.notice_text || '').toLowerCase().includes(query)
    );
  });

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

  const handleDelete = async (id: number | null) => {
    if (!id) return;
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">SENCO Graduation Schedule</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 sm:flex-initial sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
          >
            + Create Event
          </button>
        </div>
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
        schedules={filteredSchedules} 
        onEdit={initiateEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}
