import React, { useState } from 'react';
import styles from './styles.module.css';
import { useChatBot } from './index';
import { useSessionStorage } from './useSessionStorage';

interface ChatHistoryProps {
  onClose: () => void;
}

export function ChatHistory({ onClose }: ChatHistoryProps): React.JSX.Element {
  const { sessions, setSessions, currentSessionId, setCurrentSessionId } = useChatBot();
  const { deleteAllSessions } = useSessionStorage();
  const [confirmClear, setConfirmClear] = useState(false);

  function handleNewChat() {
    setCurrentSessionId(null);
    onClose();
  }

  function handleSelectSession(id: string) {
    setCurrentSessionId(id);
    onClose();
  }

  function handleClearHistory() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    deleteAllSessions();
    setSessions([]);
    setCurrentSessionId(null);
    setConfirmClear(false);
    onClose();
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  return (
    <div className={styles.historyPanel}>
      <div className={styles.historyHeader}>
        <span className={styles.historyTitle}>Chat History</span>
        <button className={styles.newChatBtn} onClick={handleNewChat}>
          + New Chat
        </button>
      </div>

      <div className={styles.sessionList}>
        {sessions.length === 0 ? (
          <p className={styles.emptyHistory}>No previous chats</p>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              className={`${styles.sessionCard} ${s.id === currentSessionId ? styles.sessionActive : ''}`}
              onClick={() => handleSelectSession(s.id)}
            >
              <span className={styles.sessionTitle}>{s.title || 'Untitled'}</span>
              <span className={styles.sessionDate}>{formatDate(s.updated_at)}</span>
            </button>
          ))
        )}
      </div>

      {sessions.length > 0 && (
        <div className={styles.clearRow}>
          {confirmClear ? (
            <div className={styles.confirmClear}>
              <span>Delete all history?</span>
              <button className={styles.confirmYes} onClick={handleClearHistory}>Yes</button>
              <button className={styles.confirmNo} onClick={() => setConfirmClear(false)}>No</button>
            </div>
          ) : (
            <button className={styles.clearBtn} onClick={() => setConfirmClear(true)}>
              🗑 Clear history
            </button>
          )}
        </div>
      )}
    </div>
  );
}
