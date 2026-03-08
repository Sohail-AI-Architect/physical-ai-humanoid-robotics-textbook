import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../AuthProvider';
import { API_BASE_URL } from '../../config/api';
import styles from './styles.module.css';

const SOFTWARE_OPTIONS = [
  'Python', 'ROS 2', 'CUDA', 'PyTorch', 'Isaac Sim',
  'Unity', 'Gazebo', 'C++', 'Docker', 'Linux',
];
const GPU_OPTIONS = ['RTX 4070 Ti', 'RTX 4090', 'Other', 'None'];
const RAM_OPTIONS = ['16GB', '32GB', '64GB+'];
const ROBOT_OPTIONS = ['Unitree Go2', 'Unitree G1', 'Other', 'None'];

export default function ProfilePage(): React.JSX.Element {
  const { user, session, loading } = useAuth();
  const [software, setSoftware] = useState<string[]>([]);
  const [gpuTier, setGpuTier] = useState('None');
  const [ramTier, setRamTier] = useState('16GB');
  const [hasJetson, setHasJetson] = useState(false);
  const [robotPlatform, setRobotPlatform] = useState('None');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`${API_BASE_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${session.token}` },
    })
      .then(r => r.json())
      .then(data => {
        setSoftware(data.softwareBackground || []);
        setGpuTier(data.gpuTier || 'None');
        setRamTier(data.ramTier || '16GB');
        setHasJetson(data.hasJetson || false);
        setRobotPlatform(data.robotPlatform || 'None');
      })
      .catch(() => {});
  }, [session]);

  const toggleSoftware = (item: string) => {
    setSoftware(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          softwareBackground: software,
          gpuTier,
          ramTier,
          hasJetson,
          robotPlatform,
        }),
      });
      setSaved(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Profile">
        <div className={styles.container}>Loading...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Profile">
        <div className={styles.container}>
          <h1 className={styles.title}>Profile</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Please sign in to view your profile.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className={styles.container}>
        <h1 className={styles.title}>Your Profile</h1>

        <div className={styles.field}>
          <label className={styles.label}>Name</label>
          <div className={styles.readOnly}>{user.name}</div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <div className={styles.readOnly}>{user.email}</div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Software Background</label>
          <div className={styles.chipGroup}>
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

        <div className={styles.field}>
          <label className={styles.label}>GPU</label>
          <select className={styles.select} value={gpuTier} onChange={e => { setGpuTier(e.target.value); setSaved(false); }}>
            {GPU_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>RAM</label>
          <select className={styles.select} value={ramTier} onChange={e => { setRamTier(e.target.value); setSaved(false); }}>
            {RAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className={styles.checkboxRow}>
          <input type="checkbox" id="jetson" checked={hasJetson} onChange={e => { setHasJetson(e.target.checked); setSaved(false); }} />
          <label htmlFor="jetson">I have a Jetson device</label>
        </div>

        <div className={styles.field} style={{ marginTop: '0.8rem' }}>
          <label className={styles.label}>Robot Platform</label>
          <select className={styles.select} value={robotPlatform} onChange={e => { setRobotPlatform(e.target.value); setSaved(false); }}>
            {ROBOT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        {saved && <p className={styles.success}>Profile updated successfully!</p>}
      </div>
    </Layout>
  );
}
