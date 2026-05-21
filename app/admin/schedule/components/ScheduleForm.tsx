import React from 'react';
import { GraduationSchedule } from '@/types/graduation';

interface ScheduleFormProps {
  formData: GraduationSchedule;
  setFormData: React.Dispatch<React.SetStateAction<GraduationSchedule>>;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onCancel: () => void;
  onClose: () => void;
  showHeader?: boolean;
  containerClassName?: string;
}

export default function ScheduleForm({ formData, setFormData, onSubmit, isEditing, onCancel, onClose, showHeader = true, containerClassName }: ScheduleFormProps) {
  const formClassName = containerClassName ?? "bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4";
  return (
    <form onSubmit={onSubmit} className={formClassName}>
      {showHeader && <h2 className="text-lg font-semibold text-gray-700">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Event Title</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Start Date & Time</label>
          <input 
            type="datetime-local" 
            value={formData.start_date} 
            onChange={e => setFormData({...formData, start_date: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">End Date & Time (optional)</label>
          <input 
            type="datetime-local" 
            value={formData.end_date || ''} 
            onChange={e => setFormData({...formData, end_date: e.target.value || undefined})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600">Notice / Update Announcement</label>
        <textarea 
          value={formData.notice_text} 
          onChange={e => setFormData({...formData, notice_text: e.target.value})}
          placeholder="Optional instructions, changes, or venue details..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
          rows={3}
        />
      </div>

      <div className="flex items-center">
        <input 
          type="checkbox" 
          checked={formData.is_important} 
          id="is_important"
          onChange={e => setFormData({...formData, is_important: e.target.checked})}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="is_important" className="ml-2 block text-sm text-gray-900">Mark as Urgent Notice</label>
      </div>

      <div className="flex justify-end space-x-2">
        {isEditing && (
          <button type="button" onClick={() => { onCancel(); onClose(); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Cancel
          </button>
        )}
        {!isEditing && (
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Cancel
          </button>
        )}
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          {isEditing ? 'Update Event' : 'Publish Event'}
        </button>
      </div>
    </form>
  );
}