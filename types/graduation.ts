export type DailyScheduleRow = {
  date: string;
  time: string;
  label?: string | null;
};

export interface GraduationSchedule {
  id?: number;
  title: string;
  start_date: string;
  end_date?: string;
  notice_text: string;
  is_important: boolean;
  daily_schedule?: DailyScheduleRow[] | null;
  created_at?: string;
  updated_at?: string;
}