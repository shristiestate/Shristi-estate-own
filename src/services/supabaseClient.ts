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
 * Allows arbitrary method chaining on Supabase query builders (e.g. from(t).select().eq().order().limit().maybeSingle())
 * while deferring the actual Supabase client evaluation until the promise is awaited.
 */
function createFluentChain(rootPromise: Promise<any>): any {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: any, reject: any) => rootPromise.then(resolve, reject);
      }
      if (prop === 'catch') {
        return (reject: any) => rootPromise.catch(reject);
      }
      if (prop === 'finally') {
        return (callback: any) => rootPromise.finally(callback);
      }
      return (...args: any[]) => {
        const nextPromise = rootPromise.then((target) => {
          if (!target) return { data: null, error: new Error('Supabase client not initialized') };
          const fn = target[prop];
          if (typeof fn === 'function') {
            return fn.apply(target, args);
          }
          return target[prop];
        });
        return createFluentChain(nextPromise);
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
        const targetPromise = getSupabase().then((client) => {
          if (!client) throw new Error('Supabase not configured');
          return client.from(table);
        });
        return createFluentChain(targetPromise);
      };
    }

    if (prop === 'rpc') {
      return (fnName: string, params?: any) => {
        const targetPromise = getSupabase().then((client) => {
          if (!client) throw new Error('Supabase not configured');
          return client.rpc(fnName, params);
        });
        return createFluentChain(targetPromise);
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
