import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import AuthModal from '../AuthForms/AuthModal';

export default function AuthNavbarItem(): React.JSX.Element {
  const { user, loading, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'signin' | 'signup'>('signin');

  if (loading) {
    return <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>...</span>;
  }

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <a
          href="/profile"
          style={{
            color: '#c4b5fd',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {user.name}
        </a>
        <button
          onClick={() => signOut()}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.7)',
            padding: '0.3rem 0.7rem',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => { setModalMode('signin'); setShowModal(true); }}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.8)',
            padding: '0.3rem 0.7rem',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => { setModalMode('signup'); setShowModal(true); }}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            padding: '0.3rem 0.7rem',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Sign Up
        </button>
      </div>
      {showModal && (
        <AuthModal initialMode={modalMode} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
