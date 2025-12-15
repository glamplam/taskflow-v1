import { createClient } from '@supabase/supabase-js';

// Hardcoded defaults provided by user
const DEFAULT_URL = 'https://xyinhhwbjljfyofocmct.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5aW5oaHdiamxqZnlvZm9jbWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjYwNTIsImV4cCI6MjA4MTQwMjA1Mn0.ja9FJ0a-l5cRwimbs6N7NKgXEkPxI2hgIWaAAE8qTXI';

let client;
let configured = false;

// 1. Check LocalStorage first (User override)
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('SB_URL') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('SB_KEY') : null;

// Determine which credentials to use (LocalStorage overrides defaults if present)
const url = localUrl || DEFAULT_URL;
const key = localKey || DEFAULT_KEY;

try {
  if (url && key) {
    client = createClient(url, key);
    configured = true;
  }
} catch (error) {
  console.error("Supabase init failed:", error);
}

// Fallback to prevent crash if not configured (Although defaults ensure this rarely happens)
if (!client) {
    try {
        client = createClient('https://placeholder.supabase.co', 'placeholder');
    } catch (e) {
        client = {} as any;
    }
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