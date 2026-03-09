import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import styles from './styles.module.css';

const SOFTWARE_OPTIONS = [
  'Python', 'ROS 2', 'CUDA', 'PyTorch', 'Isaac Sim',
  'Unity', 'Gazebo', 'C++', 'Docker', 'Linux',
];

const GPU_OPTIONS = ['None', 'RTX 4070 Ti', 'RTX 4090', 'Other'];
const RAM_OPTIONS = ['16GB', '32GB', '64GB+'];
const ROBOT_OPTIONS = ['None', 'Unitree Go2', 'Unitree G1', 'Other'];

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onClose: () => void;
}

export default function SignUpForm({ onSwitchToSignIn, onClose }: SignUpFormProps): React.JSX.Element {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [software, setSoftware] = useState<string[]>([]);
  const [gpuTier, setGpuTier] = useState('None');
  const [ramTier, setRamTier] = useState('16GB');
  const [hasJetson, setHasJetson] = useState(false);
  const [robotPlatform, setRobotPlatform] = useState('None');
  const [showBackground, setShowBackground] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSoftware = (item: string) => {
    setSoftware(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in name, email, and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name,
        email,
        password,
        softwareBackground: software,
        gpuTier,
        ramTier,
        hasJetson,
        robotPlatform,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      if (msg.includes('already') || msg.includes('exist')) {
        setError('An account with this email already exists.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className={styles.title}>Create Account</h2>

      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input className={styles.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Password</label>
        <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" />
      </div>

      <button
        type="button"
        onClick={() => setShowBackground(!showBackground)}
        style={{
          width: '100%',
          padding: '0.6rem',
          marginTop: '0.5rem',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.85rem',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {showBackground ? '- Hide' : '+'} Technical Background (optional — improves personalization)
      </button>

      {showBackground && (
        <div style={{ marginTop: '0.75rem' }}>
          <div className={styles.field}>
            <label className={styles.label}>Software Skills</label>
            <div className={styles.checkboxGroup}>
              {SOFTWARE_OPTIONS.map(opt => (
                <span
                  key={opt}
                  className={`${styles.chip} ${software.includes(opt) ? styles.chipActive : ''}`}
                  onClick={() => toggleSoftware(opt)}
                >
                  {opt}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className={styles.field}>
              <label className={styles.label}>GPU</label>
              <select className={styles.select} value={gpuTier} onChange={e => setGpuTier(e.target.value)}>
                {GPU_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>RAM</label>
              <select className={styles.select} value={ramTier} onChange={e => setRamTier(e.target.value)}>
                {RAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'end' }}>
            <div className={styles.field}>
              <label className={styles.label}>Robot Platform</label>
              <select className={styles.select} value={robotPlatform} onChange={e => setRobotPlatform(e.target.value)}>
                {ROBOT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className={styles.checkboxRow} style={{ marginBottom: '1rem' }}>
              <input type="checkbox" id="jetson" checked={hasJetson} onChange={e => setHasJetson(e.target.checked)} />
              <label htmlFor="jetson">I have a Jetson</label>
            </div>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.submitBtn} type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <div className={styles.switchLink}>
        Already have an account? <button type="button" onClick={onSwitchToSignIn}>Sign In</button>
      </div>
    </form>
  );
}
