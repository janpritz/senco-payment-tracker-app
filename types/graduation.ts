export interface GraduationSchedule {
  id?: number;
  title: string;
  start_date: string;
  end_date?: string;
  notice_text: string;
  is_important: boolean;
  created_at?: string;
  updated_at?: string;
}