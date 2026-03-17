import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Reading {
  id: number;
  timestamp: string;
  temperature: number;
}

export async function getTodayReadings(): Promise<Reading[]> {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(5, 0, 0, 0);

  // If it's before 05:00, use yesterday's 05:00
  if (now.getHours() < 5) {
    todayStart.setDate(todayStart.getDate() - 1);
  }

  const { data, error } = await supabase
    .from("readings")
    .select("id, timestamp, temperature")
    .gte("timestamp", todayStart.toISOString())
    .lte("timestamp", now.toISOString())
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  return data ?? [];
}
