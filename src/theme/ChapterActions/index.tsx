import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import PersonalizeButton from './PersonalizeButton';
import TranslateButton, { getUrduPref } from './TranslateButton';
import { API_BASE_URL } from '../../config/api';
import styles from './styles.module.css';

interface ChapterActionsProps {
  chapterSlug: string;
}

export default function ChapterActions({ chapterSlug }: ChapterActionsProps): React.JSX.Element | null {
  const { user, session, loading } = useAuth();
  const [processing, setProcessing] = useState<'none' | 'personalize' | 'translate'>('none');
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [error, setError] = useState('');
  const originalContentRef = useRef<string>('');
  const articleRef = useRef<Element | null>(null);

  const saveOriginal = useCallback(() => {
    if (!originalContentRef.current) {
      const el = document.querySelector('.markdown');
      if (el) {
        originalContentRef.current = el.innerHTML;
        articleRef.current = el;
      }
    }
  }, []);

  const replaceContent = (newContent: string) => {
    saveOriginal();
    const el = articleRef.current || document.querySelector('.markdown');
    if (el) {
      el.innerHTML = newContent;
    }
  };

  const restoreOriginal = () => {
    const el = articleRef.current || document.querySelector('.markdown');
    if (el && originalContentRef.current) {
      el.innerHTML = originalContentRef.current;
    }
  };

  // Auto-load Urdu if preference exists
  useEffect(() => {
    if (!user || !session || loading) return;
    if (!getUrduPref(chapterSlug)) return;

    const autoTranslate = async () => {
      const articleEl = document.querySelector('.markdown');
      if (!articleEl) return;

      saveOriginal();
      setProcessing('translate');

      try {
        const res = await fetch(`${API_BASE_URL}/api/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`,
          },
          body: JSON.stringify({
            chapter_slug: chapterSlug,
            chapter_content: articleEl.innerHTML || '',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replaceContent(data.urdu_content);
          setIsTranslated(true);
        }
      } catch {
        // Silent fail for auto-load
      } finally {
        setProcessing('none');
      }
    };

    const timer = setTimeout(autoTranslate, 500);
    return () => clearTimeout(timer);
  }, [chapterSlug, user, session, loading]);

  if (loading || !user) return null;

  return (
    <div className={styles.container}>
      <PersonalizeButton
        chapterSlug={chapterSlug}
        isProcessing={processing !== 'none'}
        isPersonalized={isPersonalized}
        onStartProcessing={() => {
          setError('');
          setProcessing('personalize');
        }}
        onComplete={(content) => {
          replaceContent(content);
          setIsPersonalized(true);
          setIsTranslated(false);
          setProcessing('none');
        }}
        onRevert={() => {
          restoreOriginal();
          setIsPersonalized(false);
        }}
        onError={(msg) => {
          setError(msg);
          setProcessing('none');
        }}
      />

      <TranslateButton
        chapterSlug={chapterSlug}
        isProcessing={processing !== 'none'}
        isTranslated={isTranslated}
        onStartProcessing={() => {
          setError('');
          setProcessing('translate');
        }}
        onComplete={(content) => {
          replaceContent(content);
          setIsTranslated(true);
          setIsPersonalized(false);
          setProcessing('none');
        }}
        onRevert={() => {
          restoreOriginal();
          setIsTranslated(false);
        }}
        onError={(msg) => {
          setError(msg);
          setProcessing('none');
        }}
      />

      {processing !== 'none' && (
        <span className={styles.statusText}>
          {processing === 'personalize' ? 'Personalizing for your background...' : 'Translating to Urdu...'}
        </span>
      )}

      {error && <span className={styles.statusText} style={{ color: '#ef4444' }}>{error}</span>}
    </div>
  );
}
