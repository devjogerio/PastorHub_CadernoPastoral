import { useCallback, useEffect, useState } from 'react';
import { CHAVES, lerJSON, salvarJSON } from '../../lib/armazenamento';

/** Favoritos da Biblioteca persistidos localmente (compatível com o app estático). */
export function useFavoritosBiblioteca() {
  const [favoritos, setFavoritos] = useState<string[]>(() =>
    lerJSON<string[]>(CHAVES.favoritosBiblioteca, []),
  );

  useEffect(() => {
    salvarJSON(CHAVES.favoritosBiblioteca, favoritos);
  }, [favoritos]);

  const alternar = useCallback((id: string) => {
    setFavoritos((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id],
    );
  }, []);

  const ehFavorito = useCallback(
    (id: string) => favoritos.includes(id),
    [favoritos],
  );

  return { favoritos, alternar, ehFavorito };
}
