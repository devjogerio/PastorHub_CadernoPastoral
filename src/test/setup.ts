import { afterEach } from 'vitest';

// Testes que montam React manualmente não podem deixar modais ou portais
// no DOM compartilhado com o próximo caso.
afterEach(() => {
  if (typeof document !== 'undefined') {
    document.body.replaceChildren();
  }
});
