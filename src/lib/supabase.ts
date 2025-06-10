
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'single_choice' | 'short_text';
  options: string[] | null;
  order_index: number;
  created_at: string;
};

export type Response = {
  id: string;
  quiz_id: string;
  question_id: string;
  answer_text: string;
  submitted_at: string;
  session_id: string;
};
