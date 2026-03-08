import React from 'react';
import { useAuth } from '../AuthProvider';
import { API_BASE_URL } from '../../config/api';
import styles from './styles.module.css';

interface PersonalizeButtonProps {
  chapterSlug: string;
  isProcessing: boolean;
  isPersonalized: boolean;
  onStartProcessing: () => void;
  onComplete: (content: string) => void;
  onRevert: () => void;
  onError: (msg: string) => void;
}

export default function PersonalizeButton({
  chapterSlug,
  isProcessing,
  isPersonalized,
  onStartProcessing,
  onComplete,
  onRevert,
  onError,
}: PersonalizeButtonProps): React.JSX.Element {
  const { session } = useAuth();

  const handlePersonalize = async () => {
    onStartProcessing();

    const articleEl = document.querySelector('.markdown');
    if (!articleEl) {
      onError('Could not find chapter content.');
      return;
    }

    const chapterContent = articleEl.textContent || '';

    try {
      const res = await fetch(`${API_BASE_URL}/api/personalize`, {
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
        throw new Error('Failed to personalize');
      }

      const data = await res.json();
      onComplete(data.personalized_content);
    } catch {
      onError('Service temporarily unavailable. Please try again in a moment.');
    }
  };

  if (isPersonalized) {
    return (
      <button className={styles.toggleBtn} onClick={onRevert}>
        Show Original
      </button>
    );
  }

  return (
    <button
      className={`${styles.actionBtn} ${styles.personalizeBtn}`}
      onClick={handlePersonalize}
      disabled={isProcessing}
    >
      {isProcessing ? 'Personalizing for your background...' : 'Personalize for Me'}
    </button>
  );
}
