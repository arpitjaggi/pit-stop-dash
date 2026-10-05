import { createContext, useContext } from 'react';

export interface Session {
  mode: 'supabase' | 'demo';
  email: string | null;
  signOut: () => Promise<void>;
  /** Demo only: wipe the sample data and start again. */
  resetDemo?: () => Promise<void>;
}

export const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error('useSession outside provider');
  return s;
}
