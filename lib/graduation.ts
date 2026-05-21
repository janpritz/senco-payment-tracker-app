import api from "@/lib/axios";
import { GraduationSchedule } from '@/types/graduation';

export const GraduationApi = {
  getAll: async (): Promise<GraduationSchedule[]> => {
    const res = await api.get('/graduation-schedules');
    return res.data;
  },

  create: async (data: GraduationSchedule): Promise<GraduationSchedule> => {
    const res = await api.post('/admin/graduation-schedules', data);
    return res.data;
  },

  update: async (id: number, data: GraduationSchedule): Promise<GraduationSchedule> => {
    const res = await api.put(`/admin/graduation-schedules/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/graduation-schedules/${id}`);
  }
};
