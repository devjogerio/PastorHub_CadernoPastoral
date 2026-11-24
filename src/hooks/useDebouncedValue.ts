import { useEffect, useState } from 'react';

/* Devolve o valor só depois de `atrasoMs` sem novas mudanças.
   Evita recalcular a busca a cada tecla digitada. */
export function useDebouncedValue<T>(valor: T, atrasoMs: number): T {
  const [atrasado, setAtrasado] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setAtrasado(valor), atrasoMs);
    return () => clearTimeout(timer);
  }, [valor, atrasoMs]);

  return atrasado;
}
