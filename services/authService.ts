
import { User, Task } from '../types';
import { supabase } from './supabase';

export const authService = {
  // --- Auth Methods ---

  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Save name in user metadata
      },
    });
    if (error) throw error;
    
    // Create initial data entry for the user
    if (data.user) {
        await supabase.from('user_data').insert([{ user_id: data.user.id, tasks: [] }]);
    }
    
    return data.user;
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('로그인 실패');

    return {
      email: data.user.email || '',
      name: data.user.user_metadata.name || 'User',
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return {
      email: session.user.email || '',
      name: session.user.user_metadata.name || 'User',
    };
  },

  // --- Password Reset ---

  checkEmail: async (email: string): Promise<boolean> => {
     // Supabase doesn't reveal if an email exists strictly for security, 
     // but we can try to initiate a reset flow.
     // For this UI, we'll just return true to proceed to the next step.
     return true; 
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // Redirect back to app after clicking email link
    });
    if (error) throw error;
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  // --- Data Sync Methods (Moved here for simple centralized access) ---

  loadUserTasks: async (): Promise<Task[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_data')
      .select('tasks')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
       console.error('Error loading tasks:', error);
       return [];
    }

    return data?.tasks || [];
  },

  saveUserTasks: async (tasks: Task[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // UPSERT: Insert or Update based on user_id
    const { error } = await supabase
      .from('user_data')
      .upsert({ user_id: user.id, tasks: tasks, updated_at: new Date() });

    if (error) console.error('Error saving tasks:', error);
  }
};
