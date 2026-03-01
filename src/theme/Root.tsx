import React, { Suspense, type ReactNode } from 'react';

const ChatBot = React.lazy(() => import('./ChatBot'));

interface RootProps {
  children: ReactNode;
}

export default function Root({ children }: RootProps): React.JSX.Element {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </>
  );
}
