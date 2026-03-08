import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ChatSession } from './types';
import { ChatOrb } from './ChatOrb';
import { ChatModal } from './ChatModal';
import { useSessionStorage } from './useSessionStorage';

// ─── Context ────────────────────────────────────────────────────────────────

interface ChatBotContextValue {
  isOpen: boolean;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  currentSessionId: string | null;
  setCurrentSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  scope: 'global' | 'selected_text';
  setScope: React.Dispatch<React.SetStateAction<'global' | 'selected_text'>>;
  selectedText: string;
  setSelectedText: React.Dispatch<React.SetStateAction<string>>;
  toggle: () => void;
  close: () => void;
}

const ChatBotContext = createContext<ChatBotContextValue | null>(null);

export function useChatBot(): ChatBotContextValue {
  const ctx = useContext(ChatBotContext);
  if (!ctx) throw new Error('useChatBot must be used within ChatBot');
  return ctx;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChatBot(): React.JSX.Element {
  const { loadSessions } = useSessionStorage();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [scope, setScope] = useState<'global' | 'selected_text'>('global');
  const [selectedText, setSelectedText] = useState('');

  // Floating "Ask about this" button state
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  // ─── Selected text detection ───────────────────────────────────────────────
  useEffect(() => {
    function handleSelectionChange() {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? '';
      if (text.length > 0 && !isOpen) {
        setSelectedText(text);
        try {
          const range = sel!.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectionPos({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
          });
        } catch {
          setSelectionPos(null);
        }
      } else {
        setSelectionPos(null);
      }
    }

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('touchend', handleSelectionChange);
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('touchend', handleSelectionChange);
    };
  }, [isOpen]);

  function handleAskAboutSelection() {
    setScope('selected_text');
    setSelectionPos(null);
    setIsOpen(true);
    // Focus input after modal opens
    setTimeout(() => inputRef.current?.focus(), 150);
  }

  const contextValue: ChatBotContextValue = {
    isOpen,
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    scope,
    setScope,
    selectedText,
    setSelectedText,
    toggle,
    close,
  };

  return (
    <ChatBotContext.Provider value={contextValue}>
      {/* Floating "Ask about this" pill */}
      {selectionPos && (
        <button
          onClick={handleAskAboutSelection}
          style={{
            position: 'absolute',
            top: selectionPos.top,
            left: selectionPos.left,
            zIndex: 10000,
            background: 'linear-gradient(135deg, #1a6cf6, #7c3aed)',
            color: '#fff',
            border: '1px solid rgba(100,200,255,0.4)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(26,108,246,0.4)',
            whiteSpace: 'nowrap',
          }}
        >
          ✨ Ask about this
        </button>
      )}

      <ChatOrb onClick={toggle} isOpen={isOpen} />
      {isOpen && <ChatModal inputRef={inputRef} />}
    </ChatBotContext.Provider>
  );
}
