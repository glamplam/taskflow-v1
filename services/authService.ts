
import { User } from '../types';

const USERS_KEY = 'taskflow_users';
const SESSION_KEY = 'taskflow_session';

export const authService = {
  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  saveUser: (user: User) => {
    const users = authService.getUsers();
    // Check if email exists
    if (users.find(u => u.email === user.email)) {
      throw new Error('이미 존재하는 이메일입니다.');
    }
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  login: (email: string, password: string): User => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    // Create session (exclude password)
    const sessionUser = { email: user.email, name: user.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};
