import React from 'react';
import { GraduationSchedule } from '@/types/graduation';

interface ScheduleTableProps {
  schedules: GraduationSchedule[];
  onEdit: (schedule: GraduationSchedule) => void;
  onDelete: (id: number | null) => void;
}

export default function ScheduleTable({ schedules, onEdit, onDelete }: ScheduleTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map(schedule => (
              <tr key={schedule.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {schedule.title} {schedule.is_important && <span className="text-red-500 font-bold text-xs">[!]</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(schedule.start_date).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}
                    {schedule.end_date && ` — ${new Date(schedule.end_date).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}`}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {schedule.notice_text ? schedule.notice_text : <span className="text-gray-300 italic">No Notice</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => onEdit(schedule)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => onDelete(schedule.id!)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile card view */}
      <div className="md:hidden divide-y divide-gray-200">
        {schedules.map(schedule => (
          <div key={schedule.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {schedule.title} {schedule.is_important && <span className="text-red-500 font-bold text-xs">[!]</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(schedule.start_date).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}
                  {schedule.end_date && ` — ${new Date(schedule.end_date).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}`}
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => onEdit(schedule)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                <button onClick={() => onDelete(schedule.id!)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {schedule.notice_text ? schedule.notice_text : <span className="text-gray-300 italic">No Notice</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
