export interface User {
  id: string;
  name: string;
  email: string;
  softwareBackground: string;
  gpuTier: string;
  ramTier: string;
  hasJetson: boolean;
  robotPlatform: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  softwareBackground: string[];
  gpuTier: string;
  ramTier: string;
  hasJetson: boolean;
  robotPlatform: string;
}
