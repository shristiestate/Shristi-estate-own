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
 * Universal Fluent Query Chain Proxy:
 * Collects chained calls (e.g. .from(t).select().eq().order().limit().maybeSingle())
 * and only executes them against the lazily-loaded Supabase client once awaited or when .then() is called.
 */
function createFluentChain(
  initTarget: () => Promise<any>,
  ops: Array<{ prop: string | symbol; args: any[] }> = []
): any {
  const execute = async () => {
    try {
      const clientTarget = await initTarget();
      if (!clientTarget) {
        return { data: null, error: new Error('Supabase client not initialized') };
      }
      let current: any = clientTarget;
      for (const op of ops) {
        if (!current) break;
        const fn = current[op.prop];
        if (typeof fn === 'function') {
          current = fn.apply(current, op.args);
        } else {
          current = fn;
        }
      }
      // If the resulting query builder is a Thenable (e.g., PostgrestFilterBuilder), await it
      if (current && typeof current.then === 'function') {
        const res = await current;
        return res ?? { data: null, error: null };
      }
      return current ?? { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: any, reject: any) => execute().then(resolve, reject);
      }
      if (prop === 'catch') {
        return (reject: any) => execute().catch(reject);
      }
      if (prop === 'finally') {
        return (callback: any) => execute().finally(callback);
      }
      if (prop === 'toJSON') {
        return () => ({});
      }
      return (...args: any[]) => {
        return createFluentChain(initTarget, [...ops, { prop, args }]);
      };
    }
  };

  return new Proxy({} as any, handler);
}

/**
 * Backward-compatible transparent proxy that resolves Supabase methods asynchronously,
 * ensuring zero main-thread blocking during initial page load.
 */
export const supabase: any = new Proxy({} as any, {
  get(_target, prop) {
    if (prop === 'then') return undefined;

    if (prop === 'from') {
      return (table: string) => {
        return createFluentChain(async () => {
          const client = await getSupabase();
          if (!client) throw new Error('Supabase not configured');
          return client.from(table);
        });
      };
    }

    if (prop === 'rpc') {
      return (fnName: string, params?: any) => {
        return createFluentChain(async () => {
          const client = await getSupabase();
          if (!client) throw new Error('Supabase not configured');
          return client.rpc(fnName, params);
        });
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
