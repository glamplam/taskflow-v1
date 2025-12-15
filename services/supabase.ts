import { createClient } from '@supabase/supabase-js';

// User provided credentials
const DEFAULT_URL = 'https://xyinhhwbjljfyofocmct.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5aW5oaHdiamxqZnlvZm9jbWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjYwNTIsImV4cCI6MjA4MTQwMjA1Mn0.ja9FJ0a-l5cRwimbs6N7NKgXEkPxI2hgIWaAAE8qTXI';

// Helper to get environment variables safely
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error
  }
  return '';
};

// 1. Get configuration
// Priority: LocalStorage -> Env -> Default (Hardcoded)
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('SB_URL') : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('SB_KEY') : '';

const envUrl = getEnv('SUPABASE_URL');
const envKey = getEnv('SUPABASE_ANON_KEY');

const rawUrl = (storedUrl || envUrl || DEFAULT_URL).trim();
const rawKey = (storedKey || envKey || DEFAULT_KEY).trim();

let client;
let configured = false;

// 2. Initialize
try {
  if (rawUrl && rawKey && rawUrl.startsWith('http')) {
    client = createClient(rawUrl, rawKey);
    configured = true;
  }
} catch (error) {
  console.error("Supabase init failed:", error);
}

// 3. Fallback
if (!client) {
  // If initialization failed, use defaults to prevent crash
  client = createClient(DEFAULT_URL, DEFAULT_KEY);
  configured = true; 
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