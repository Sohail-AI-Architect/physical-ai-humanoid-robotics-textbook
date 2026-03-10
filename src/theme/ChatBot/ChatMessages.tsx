import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import type { ChatSession, Citation } from './types';

interface ChatMessagesProps {
  session: ChatSession | null;
}

function CitationPill({ citation }: { citation: Citation }): React.JSX.Element {
  // url_fragment from backend is like "/module-1-ros2/week-3-5"
  // Docusaurus serves docs at /docs/ under the site baseUrl
  const href = useBaseUrl(`/docs${citation.url_fragment}`);
  return (
    <a
      href={href}
      className={styles.citationPill}
      title={`${citation.chapter_title} — ${citation.section_title} (score: ${citation.relevance_score.toFixed(2)})`}
    >
      {citation.section_title || citation.chapter_title}
    </a>
  );
}

export function ChatMessages({ session }: ChatMessagesProps): React.JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.turns]);

  if (!session || session.turns.length === 0) {
    return (
      <div className={styles.emptyChat}>
        <div className={styles.emptyChatIcon}>🤖</div>
        <p className={styles.emptyChatText}>
          Ask me anything about Physical AI & Humanoid Robotics!
        </p>
        <p className={styles.emptyChatHint}>
          Highlight text on any page and click ✨ to ask about it.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.messages}>
      {session.turns.map((turn) => (
        <div key={turn.id} className={styles.turnWrapper}>
          {/* User query */}
          <div className={styles.userBubble}>
            <span className={styles.bubbleLabel}>You</span>
            <p className={styles.userText}>{turn.query}</p>
            {turn.scope === 'selected_text' && (
              <span className={styles.scopeBadge}>📌 Selected text</span>
            )}
          </div>

          {/* AI answer */}
          <div className={styles.aiBubble}>
            <span className={styles.bubbleLabel}>AI</span>
            <div className={styles.markdownBody}>
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const inline = !match;
                    return inline ? (
                      <code className={styles.inlineCode} {...props}>
                        {children}
                      </code>
                    ) : (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  },
                }}
              >
                {turn.answer}
              </ReactMarkdown>
            </div>

            {/* Citations */}
            {turn.citations.length > 0 && (
              <div className={styles.citations}>
                <span className={styles.citationsLabel}>Sources:</span>
                <div className={styles.citationPills}>
                  {turn.citations.map((c: Citation) => (
                    <CitationPill key={c.chunk_id} citation={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
