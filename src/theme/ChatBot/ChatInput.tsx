import React, { useState } from 'react';
import styles from './styles.module.css';
import { useChatBot } from './index';
import { useSessionStorage } from './useSessionStorage';
import type { ChatTurn, Citation } from './types';

import { API_BASE_URL } from '../../config/api';

const API_URL = API_BASE_URL;

interface ChatInputProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export function ChatInput({ inputRef }: ChatInputProps): React.JSX.Element {
  const {
    scope,
    setScope,
    selectedText,
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
  } = useChatBot();
  const { saveSession } = useSessionStorage();

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          scope,
          selected_text: scope === 'selected_text' ? selectedText : undefined,
          session_id: currentSessionId ?? undefined,
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      const turn: ChatTurn = {
        id: data.turn_id,
        query: trimmed,
        answer: data.answer,
        citations: data.citations ?? [],
        scope,
        timestamp: new Date().toISOString(),
      };

      setSessions((prev) => {
        const sessionId = data.session_id;
        const existing = prev.find((s) => s.id === sessionId);
        if (existing) {
          const updated = {
            ...existing,
            updated_at: new Date().toISOString(),
            turns: [...existing.turns, turn],
          };
          const next = prev.map((s) => (s.id === sessionId ? updated : s));
          saveSession(updated);
          return next;
        } else {
          const newSession = {
            id: sessionId,
            title: trimmed.slice(0, 40),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            turns: [turn],
          };
          setCurrentSessionId(sessionId);
          const next = [newSession, ...prev];
          saveSession(newSession);
          return next;
        }
      });

      setQuery('');
    } catch (err) {
      setError((err as Error).message ?? 'Unknown error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function toggleScope() {
    if (scope === 'global') {
      if (!selectedText) {
        setError('Highlight text on the page first, then switch to Selected Text mode.');
        return;
      }
      setScope('selected_text');
    } else {
      setScope('global');
    }
    setError(null);
  }

  return (
    <div className={styles.inputArea}>
      {/* Scope toggle */}
      <div className={styles.scopeRow}>
        <button
          type="button"
          onClick={toggleScope}
          className={`${styles.scopeToggle} ${scope === 'selected_text' ? styles.scopeSelected : styles.scopeGlobal}`}
        >
          {scope === 'global' ? '🌐 Global Book' : '📌 Selected Text'}
        </button>
      </div>

      {error && (
        <div className={styles.errorMsg}>
          ⚠️ {error}
          <button onClick={() => setError(null)} className={styles.errorDismiss}>✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <textarea
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the book…"
          rows={2}
          maxLength={1000}
          disabled={isLoading}
          className={styles.textarea}
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className={styles.sendBtn}
          aria-label="Send message"
        >
          {isLoading ? (
            <span className={styles.spinner} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
