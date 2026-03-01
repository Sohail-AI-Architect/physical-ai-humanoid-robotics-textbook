import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './styles.module.css';
import type { ChatSession, Citation } from './types';

interface ChatMessagesProps {
  session: ChatSession | null;
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
                    <a
                      key={c.chunk_id}
                      href={c.url_fragment}
                      className={styles.citationPill}
                      title={`${c.chapter_title} — ${c.section_title} (score: ${c.relevance_score.toFixed(2)})`}
                    >
                      {c.section_title || c.chapter_title}
                    </a>
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
