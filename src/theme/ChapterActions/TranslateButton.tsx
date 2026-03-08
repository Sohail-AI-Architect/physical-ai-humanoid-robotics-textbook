import React from 'react';
import { useAuth } from '../AuthProvider';
import { API_BASE_URL } from '../../config/api';
import styles from './styles.module.css';

interface TranslateButtonProps {
  chapterSlug: string;
  isProcessing: boolean;
  isTranslated: boolean;
  onStartProcessing: () => void;
  onComplete: (content: string) => void;
  onRevert: () => void;
  onError: (msg: string) => void;
}

function getUrduPref(slug: string): boolean {
  try {
    return localStorage.getItem(`urdu_pref_${slug}`) === 'true';
  } catch {
    return false;
  }
}

function setUrduPref(slug: string, val: boolean) {
  try {
    if (val) {
      localStorage.setItem(`urdu_pref_${slug}`, 'true');
    } else {
      localStorage.removeItem(`urdu_pref_${slug}`);
    }
  } catch {
    // localStorage disabled — ignore
  }
}

export { getUrduPref };

export default function TranslateButton({
  chapterSlug,
  isProcessing,
  isTranslated,
  onStartProcessing,
  onComplete,
  onRevert,
  onError,
}: TranslateButtonProps): React.JSX.Element {
  const { session } = useAuth();

  const handleTranslate = async () => {
    onStartProcessing();

    const articleEl = document.querySelector('.markdown');
    if (!articleEl) {
      onError('Could not find chapter content.');
      return;
    }

    const chapterContent = articleEl.innerHTML || '';

    try {
      const res = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || ''}`,
        },
        body: JSON.stringify({
          chapter_slug: chapterSlug,
          chapter_content: chapterContent,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to translate');
      }

      const data = await res.json();
      setUrduPref(chapterSlug, true);
      onComplete(data.urdu_content);
    } catch {
      onError('Service temporarily unavailable. Please try again in a moment.');
    }
  };

  const handleRevert = () => {
    setUrduPref(chapterSlug, false);
    onRevert();
  };

  if (isTranslated) {
    return (
      <button className={styles.toggleBtn} onClick={handleRevert}>
        Back to English
      </button>
    );
  }

  return (
    <button
      className={`${styles.actionBtn} ${styles.translateBtn}`}
      onClick={handleTranslate}
      disabled={isProcessing}
    >
      {isProcessing ? 'Translating to Urdu...' : 'Translate to Urdu'}
    </button>
  );
}
