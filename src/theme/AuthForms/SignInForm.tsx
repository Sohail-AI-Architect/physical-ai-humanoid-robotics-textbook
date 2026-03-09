import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import styles from './styles.module.css';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onClose: () => void;
}

export default function SignInForm({ onSwitchToSignUp, onClose }: SignInFormProps): React.JSX.Element {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      onClose();
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className={styles.title}>Sign In</h2>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Password</label>
        <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.submitBtn} type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className={styles.switchLink}>
        No account? <button type="button" onClick={onSwitchToSignUp}>Sign Up</button>
      </div>
    </form>
  );
}
