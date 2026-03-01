import type { ChatSession } from './types';

const STORAGE_KEY = 'chatbot_sessions';
const MAX_SESSIONS = 10;

export function useSessionStorage() {
  function loadSessions(): ChatSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ChatSession[];
    } catch {
      return [];
    }
  }

  function saveSession(session: ChatSession): void {
    try {
      const sessions = loadSessions();
      const idx = sessions.findIndex((s) => s.id === session.id);
      let updated: ChatSession[];
      if (idx >= 0) {
        updated = sessions.map((s) => (s.id === session.id ? session : s));
      } else {
        updated = [session, ...sessions];
      }
      // Prune to max
      if (updated.length > MAX_SESSIONS) {
        updated = updated.slice(0, MAX_SESSIONS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  function deleteAllSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  return { loadSessions, saveSession, deleteAllSessions };
}
