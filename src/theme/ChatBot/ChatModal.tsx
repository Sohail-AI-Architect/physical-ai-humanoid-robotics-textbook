import React, { useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { useChatBot } from './index';
import { ChatHistory } from './ChatHistory';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface ChatModalProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export function ChatModal({ inputRef }: ChatModalProps): React.JSX.Element {
  const { close, currentSessionId, sessions } = useChatBot();
  const [showHistory, setShowHistory] = React.useState(false);

  const currentSession = sessions.find((s) => s.id === currentSessionId) ?? null;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className={`${styles.modal} ${styles.glass}`}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <button
            className={styles.hamburger}
            onClick={() => setShowHistory((v) => !v)}
            aria-label="Toggle chat history"
          >
            ☰
          </button>
          <span className={styles.modalTitle}>
            🤖 Physical AI Assistant
          </span>
          <button className={styles.closeBtn} onClick={close} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* History sidebar */}
          <div className={`${styles.historySidebar} ${showHistory ? styles.historyVisible : ''}`}>
            <ChatHistory onClose={() => setShowHistory(false)} />
          </div>

          {/* Main chat area */}
          <div className={styles.chatArea}>
            <ChatMessages session={currentSession} />
            <ChatInput inputRef={inputRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
