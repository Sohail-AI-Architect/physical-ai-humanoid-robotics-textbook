import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const features = [
  { title: 'ROS 2 & Navigation', desc: 'Master Robot Operating System 2, SLAM, autonomous navigation, and multi-robot communication.' },
  { title: 'Gazebo & Unity Simulation', desc: 'Build and test robots in photorealistic 3D environments before deploying to hardware.' },
  { title: 'NVIDIA Isaac Platform', desc: 'Leverage GPU-accelerated simulation, Isaac Sim, and edge deployment on Jetson.' },
  { title: 'Vision-Language-Action Models', desc: 'Train VLA models that let humanoid robots understand and act on natural language instructions.' },
];

export default function Home(): React.JSX.Element {
  return (
    <Layout title="Home" description="Physical AI & Humanoid Robotics - University Textbook">
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem 2rem',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)',
      }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #c4b5fd, #818cf8, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Physical AI &amp; Humanoid Robotics
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}>
            From Digital Brain to Embodied Humanoid Intelligence.
            A comprehensive university course covering ROS 2, simulation, NVIDIA Isaac, and Vision-Language-Action models.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/docs/intro-physical-ai/week-1-2-foundations"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 2rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              Start Learning
            </Link>
            <a
              href="https://github.com/Sohail-AI-Architect/physical-ai-humanoid-robotics-textbook"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 2rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.85)',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '3rem 2rem 4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
      }}>
        {features.map((f) => (
          <div key={f.title} style={{
            padding: '1.5rem',
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.12)',
            borderRadius: '12px',
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#c4b5fd' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
