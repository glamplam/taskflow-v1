import { createClient } from '@supabase/supabase-js';

// Hardcoded defaults are removed so the user connects to their own project.
const DEFAULT_URL = '';
const DEFAULT_KEY = '';

let client;
let configured = false;

// 1. Check LocalStorage first
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('SB_URL') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('SB_KEY') : null;

// Determine which credentials to use (LocalStorage takes priority)
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

// Fallback to prevent crash if not configured (Setup screen will handle it)
if (!client) {
    try {
        // Create a dummy client just to satisfy imports, configured flag controls access
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