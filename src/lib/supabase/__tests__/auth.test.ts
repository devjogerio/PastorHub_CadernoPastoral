import { describe, it, expect, vi } from 'vitest';

// Mock do cliente Supabase para autenticação
vi.mock('../../supabase', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: { session: { user: { id: 'u1' } } },
          error: null,
        })),
        signUp: vi.fn(async () => ({
          data: { user: { id: 'u2' } },
          error: null,
        })),
        signInWithOAuth: vi.fn(async () => ({
          data: { provider: 'google' },
          error: null,
        })),
        signOut: vi.fn(async () => ({ error: null })),
        getUser: vi.fn(async () => ({ data: { user: { id: 'u1' } } })),
        getSession: vi.fn(async () => ({
          data: { session: { user: { id: 'u1' } } },
        })),
      },
    },
  };
});

import {
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  isAuthenticated,
} from '../auth';

describe('Módulo de Autenticação (Supabase)', () => {
  // Simula ambiente de navegador para teste de OAuth
  // @ts-ignore
  globalThis.window = { location: { origin: 'http://localhost' } } as any;
  it('login com email/senha retorna sessão', async () => {
    const res = await signIn('a@b.com', '123456');
    expect(res.session.user.id).toBe('u1');
  });

  it('signUp cria usuário', async () => {
    const res = await signUp('c@d.com', '123456');
    expect(res.user).toBeTruthy();
    expect(res.user?.id).toBe('u2');
  });

  it('OAuth Google retorna provider', async () => {
    const res = await signInWithGoogle();
    expect(res.provider).toBe('google');
  });

  it('signOut não lança erro', async () => {
    await expect(signOut()).resolves.toBeUndefined();
  });

  it('getCurrentUser retorna usuário', async () => {
    const u = await getCurrentUser();
    expect(u?.id).toBe('u1');
  });

  it('isAuthenticated indica sessão ativa', async () => {
    const ok = await isAuthenticated();
    expect(ok).toBe(true);
  });
});
