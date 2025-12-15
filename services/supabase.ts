import { createClient } from '@supabase/supabase-js';

// User provided credentials
// 이 키들이 최우선으로 적용됩니다.
const DEFAULT_URL = 'https://xyinhhwbjljfyofocmct.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5aW5oaHdiamxqZnlvZm9jbWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjYwNTIsImV4cCI6MjA4MTQwMjA1Mn0.ja9FJ0a-l5cRwimbs6N7NKgXEkPxI2hgIWaAAE8qTXI';

let client;
let configured = false;

try {
  // 강제로 하드코딩된 키를 사용하도록 수정 (이전의 잘못된 localStorage 값을 무시)
  if (DEFAULT_URL && DEFAULT_KEY) {
    client = createClient(DEFAULT_URL, DEFAULT_KEY);
    configured = true;
  }
} catch (error) {
  console.error("Supabase init failed:", error);
}

// Fallback logic removed as we are enforcing the defaults above
if (!client) {
    // Empty client placeholder if something goes extremely wrong
    client = createClient('', '');
    configured = false;
}

export const supabase = client;
export const isConfigured = configured;

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('SB_URL', url.trim());
    localStorage.setItem('SB_KEY', key.trim());
    window.location.reload();
  }
};

export const resetSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('SB_URL');
    localStorage.removeItem('SB_KEY');
    window.location.reload();
  }
};