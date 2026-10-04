import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://vdrqvvxvvuqqgxwqjfyy.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcnF2dnh2dnVxcWd4d3FqZnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NzQwOTMsImV4cCI6MjEwNDU1MDA5M30.ulf1wysrZSTp4tWKozQC0-AVHarj0-u8pMjTUjCJCe8';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let _clientInstance: SupabaseClient | null = null;
let _initPromise: Promise<SupabaseClient | null> | null = null;

/**
 * High-Performance Dynamic Loader:
 * Lazily loads @supabase/supabase-js on demand so the heavy 223KB library 
 * is NEVER loaded or evaluated on the critical mobile initial paint.
 */
export const getSupabase = async (): Promise<SupabaseClient | null> => {
  if (!isSupabaseConfigured) return null;
  if (_clientInstance) return _clientInstance;
  if (!_initPromise) {
    _initPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => {
        _clientInstance = createClient(supabaseUrl, supabaseAnonKey);
        return _clientInstance;
      })
      .catch((err) => {
        console.warn('Failed to load Supabase client:', err);
        return null;
      });
  }
  return _initPromise;
};

/**
 * Backward-compatible transparent proxy that resolves Supabase methods asynchronously,
 * ensuring zero main-thread blocking during initial page load.
 */
export const supabase: any = new Proxy({} as any, {
  get(_target, prop) {
    if (prop === 'then') return undefined;

    if (prop === 'from') {
      return (table: string) => {
        const queryBuilder = {
          select: (...sArgs: any[]) => {
            const p = getSupabase().then((client: any) => {
              if (!client) return { data: null, error: new Error('Supabase not configured') };
              const q = client.from(table);
              return q.select.apply(q, sArgs);
            });
            (p as any).order = (...oArgs: any[]) => {
              return getSupabase().then((client: any) => {
                if (!client) return { data: null, error: new Error('Supabase not configured') };
                const q = client.from(table);
                const s = q.select.apply(q, sArgs);
                return s.order.apply(s, oArgs);
              });
            };
            return p;
          },
          upsert: (...uArgs: any[]) => {
            return getSupabase().then((client: any) => {
              if (!client) return { data: null, error: new Error('Supabase not configured') };
              const q = client.from(table);
              return q.upsert.apply(q, uArgs);
            });
          },
          insert: (...iArgs: any[]) => {
            return getSupabase().then((client: any) => {
              if (!client) return { data: null, error: new Error('Supabase not configured') };
              const q = client.from(table);
              return q.insert.apply(q, iArgs);
            });
          },
          update: (...upArgs: any[]) => ({
            eq: (...eqArgs: any[]) => {
              return getSupabase().then((client: any) => {
                if (!client) return { data: null, error: new Error('Supabase not configured') };
                const q = client.from(table);
                const u = q.update.apply(q, upArgs);
                return u.eq.apply(u, eqArgs);
              });
            },
          }),
          delete: () => ({
            eq: (...eqArgs: any[]) => {
              return getSupabase().then((client: any) => {
                if (!client) return { data: null, error: new Error('Supabase not configured') };
                const q = client.from(table);
                const d = q.delete();
                return d.eq.apply(d, eqArgs);
              });
            },
          }),
        };
        return queryBuilder;
      };
    }

    if (prop === 'storage') {
      return {
        from: (bucket: string) => ({
          upload: (...uArgs: any[]) => {
            return getSupabase().then((client: any) => {
              if (!client) return { data: null, error: new Error('Supabase not configured') };
              const s = client.storage.from(bucket);
              return s.upload.apply(s, uArgs);
            });
          },
          getPublicUrl: (filePath: string) => {
            return {
              data: {
                publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`
              }
            };
          },
          remove: (...rArgs: any[]) => {
            return getSupabase().then((client: any) => {
              if (!client) return { data: null, error: new Error('Supabase not configured') };
              const s = client.storage.from(bucket);
              return s.remove.apply(s, rArgs);
            });
          },
        }),
      };
    }

    return (...args: any[]) => {
      return getSupabase().then((client: any) => {
        if (!client) return null;
        const fn = client[prop];
        return typeof fn === 'function' ? fn.apply(client, args) : fn;
      });
    };
  },
});
