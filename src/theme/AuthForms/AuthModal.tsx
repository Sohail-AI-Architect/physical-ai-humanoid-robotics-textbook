import React, { useState } from 'react';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';
import styles from './styles.module.css';

interface AuthModalProps {
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
}

export default function AuthModal({ initialMode = 'signin', onClose }: AuthModalProps): React.JSX.Element {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        {mode === 'signin' ? (
          <SignInForm onSwitchToSignUp={() => setMode('signup')} onClose={onClose} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setMode('signin')} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
