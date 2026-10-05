import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ApiContext, type Api } from '@/data/api';
import { createSupabaseApi } from '@/data/supabaseApi';
import { SessionContext, type Session } from '@/auth/session';
import { SignIn } from '@/auth/SignIn';
import { DemoGate } from '@/auth/DemoGate';
import { SUPABASE_ANON_KEY, SUPABASE_URL, demoForced, supabaseConfigured } from '@/env';
import { Spinner } from '@/ui/atoms';
import { ToastProvider } from '@/ui/hooks';
import { App } from './App';

const DEMO_FLAG = 'pitstop:demo';

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } } });
}

export function Boot() {
  const useDemo = demoForced || !supabaseConfigured;
  return useDemo ? <DemoBoot /> : <SupabaseBoot />;
}

function Splash() {
  return (
    <div className="splash">
      <Spinner label="Opening the garage" />
    </div>
  );
}

// ---------------------------------------------------------------- Supabase

function SupabaseBoot() {
  // The Supabase client is fetched only when a backend is configured, keeping it off the demo's path.
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [state, setState] = useState<{ ready: boolean; email: string | null; userId: string | null }>({ ready: false, email: null, userId: null });

  useEffect(() => {
    let live = true;
    let unsubscribe = () => {};
    import('@supabase/supabase-js').then(({ createClient }) => {
      if (!live) return;
      const c = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      setClient(c);
      c.auth.getSession().then(({ data }) => live && setState({ ready: true, email: data.session?.user.email ?? null, userId: data.session?.user.id ?? null }));
      const { data } = c.auth.onAuthStateChange((_e, s) => setState({ ready: true, email: s?.user.email ?? null, userId: s?.user.id ?? null }));
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      live = false;
      unsubscribe();
    };
  }, []);

  if (!client || !state.ready) return <Splash />;
  if (!state.userId) return <SignIn client={client} />;
  // Re-key by user so one person's cache can never be shown to the next sign-in.
  return <SignedIn key={state.userId} client={client} email={state.email} />;
}

function SignedIn({ client, email }: { client: SupabaseClient; email: string | null }) {
  const api = useMemo<Api>(() => createSupabaseApi(client), [client]);
  const qc = useMemo(makeQueryClient, []);
  const session = useMemo<Session>(() => ({ mode: 'supabase', email, signOut: async () => void (await client.auth.signOut()) }), [client, email]);
  return (
    <ApiContext.Provider value={api}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={qc}>
          <ToastProvider>
            <App />
          </ToastProvider>
        </QueryClientProvider>
      </SessionContext.Provider>
    </ApiContext.Provider>
  );
}

// ---------------------------------------------------------------- demo

function DemoBoot() {
  const [entered, setEntered] = useState(() => demoForced || localStorage.getItem(DEMO_FLAG) === '1');
  if (!entered) {
    return (
      <DemoGate
        onEnter={() => {
          localStorage.setItem(DEMO_FLAG, '1');
          setEntered(true);
        }}
      />
    );
  }
  return <DemoApp />;
}

function DemoApp() {
  const [api, setApi] = useState<Api | null>(null);
  const [epoch, setEpoch] = useState(0);
  const qc = useMemo(makeQueryClient, [epoch]);

  useEffect(() => {
    let live = true;
    import('@/data/demoApi').then(async (m) => {
      const a = await m.createDemoApi();
      if (live) setApi(a);
    });
    return () => {
      live = false;
    };
  }, [epoch]);

  const session = useMemo<Session>(
    () => ({
      mode: 'demo',
      email: null,
      signOut: async () => {
        localStorage.removeItem(DEMO_FLAG);
        window.location.assign('/');
      },
      resetDemo: async () => {
        const m = await import('@/data/demoApi');
        await m.resetDemo();
        setApi(null);
        setEpoch((e) => e + 1);
      },
    }),
    [],
  );

  if (!api) return <Splash />;
  return (
    <ApiContext.Provider value={api}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={qc}>
          <ToastProvider>
            <App />
          </ToastProvider>
        </QueryClientProvider>
      </SessionContext.Provider>
    </ApiContext.Provider>
  );
}
