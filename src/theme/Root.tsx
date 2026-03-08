import React, { Suspense, type ReactNode } from 'react';
import AuthProvider from './AuthProvider';

const ChatBot = React.lazy(() => import('./ChatBot'));

interface RootProps {
  children: ReactNode;
}

export default function Root({ children }: RootProps): React.JSX.Element {
  return (
    <AuthProvider>
      {children}
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </AuthProvider>
  );
}
