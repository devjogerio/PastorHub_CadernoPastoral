import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookMarked,
  Check,
  Copy,
  MessageCircle,
  RefreshCw,
  Search,
  Star,
  X,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { CHAVES, lerJSON, salvarJSON } from '../../lib/armazenamento';
import { normalizar } from '../../lib/format';
import {
  INTERVALO_ROTACAO,
  lerBanco,
  linkWhatsApp,
  textoParaCompartilhar,
  versiculoAtual,
  type Versiculo,
} from '../../lib/versiculos';

export function VersiculosPage() {
  const banco = useMemo(() => lerBanco(), []);
  const [versiculo, setVersiculo] = useState<Versiculo | null>(() =>
    versiculoAtual(new Date(), banco),
  );
  const [termo, setTermo] = useState('');
  const [favoritos, setFavoritos] = useState<string[]>(() =>
    lerJSON<string[]>(CHAVES.favoritos, []),
  );
  const [copiado, setCopiado] = useState(false);

  // Rotação automática: o versículo muda quando a janela de 3 min vira.
  useEffect(() => {
    let ultimoSlot = Math.floor(Date.now() / INTERVALO_ROTACAO);
    const temporizador = window.setInterval(() => {
      const slot = Math.floor(Date.now() / INTERVALO_ROTACAO);
      if (slot !== ultimoSlot) {
        ultimoSlot = slot;
        setVersiculo(versiculoAtual(new Date(), banco));
        setCopiado(false);
      }
    }, 15_000);
    return () => window.clearInterval(temporizador);
  }, [banco]);

  useEffect(() => {
    salvarJSON(CHAVES.favoritos, favoritos);
  }, [favoritos]);

  const alternarFavorito = useCallback((ref: string) => {
    setFavoritos((atuais) =>
      atuais.includes(ref)
        ? atuais.filter((item) => item !== ref)
        : [...atuais, ref],
    );
  }, []);

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      /* clipboard bloqueado: segue para o feedback de erro */
    }
  };

  const copiarAtual = async () => {
    if (!versiculo) return;
    await copiar(textoParaCompartilhar(versiculo));
    setCopiado(true);
    toast.success('Versículo copiado.');
    window.setTimeout(() => setCopiado(false), 2000);
  };

  const buscar = useMemo(() => {
    const alvo = normalizar(termo);
    if (!alvo) return banco;
    return banco.filter((item) =>
      normalizar(`${item.ref} ${item.texto} ${item.versao}`).includes(alvo),
    );
  }, [banco, termo]);

  const favoritosLista = useMemo(
    () => banco.filter((item) => favoritos.includes(item.ref)),
    [banco, favoritos],
  );

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-primary">Versículos</h2>
          <p className="text-sm text-muted-foreground">
            Palavra para o dia, com rotação a cada 3 minutos.
          </p>
        </div>
        <Badge className="bg-accent text-primary">
          {favoritos.length} favoritos
        </Badge>
      </header>

      {versiculo && (
        <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#3261AB] p-5 text-white shadow-lg">
          <span className="absolute -right-6 -top-6 text-[120px] leading-none opacity-10">
            ”
          </span>
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              Versículo do momento
            </p>
            <blockquote className="mt-2 text-lg font-medium leading-relaxed">
              {versiculo.texto}
            </blockquote>
            <p className="mt-3 text-sm font-semibold text-accent">
              {versiculo.ref}{' '}
              <span className="font-normal text-white/70">
                · {versiculo.versao || 'ACF'}
              </span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                
                className="bg-accent text-primary hover:bg-accent/90"
                onClick={copiarAtual}
              >
                {copiado ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiado ? 'Copiado' : 'Copiar'}
              </Button>
              <Button
                
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a
                  href={linkWhatsApp(versiculo)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button
                
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setVersiculo(versiculoAtual(new Date(), banco))}
              >
                <RefreshCw className="h-4 w-4" />
                Outro
              </Button>
            </div>
          </div>
        </article>
      )}

      {favoritosLista.length > 0 && (
        <section className="rounded-xl border border-line bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Star className="h-4 w-4 text-accent" fill="currentColor" />
            Favoritos
          </h3>
          <ul className="mt-2 space-y-2">
            {favoritosLista.map((item) => (
              <li
                key={item.ref}
                className="flex items-start gap-2 rounded-lg bg-soft p-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-primary">{item.ref}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {item.texto}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alternarFavorito(item.ref)}
                  aria-label={`Remover ${item.ref} dos favoritos`}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={termo}
            onChange={(evento) => setTermo(evento.target.value)}
            placeholder="Buscar por referência ou palavra…"
            aria-label="Buscar versículos"
            className="h-11 bg-white pl-9"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {buscar.map((item) => {
            const favorito = favoritos.includes(item.ref);
            return (
              <article
                key={item.ref}
                className="rounded-xl border border-line bg-white p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-primary">
                    {item.ref}
                  </p>
                  <button
                    type="button"
                    onClick={() => alternarFavorito(item.ref)}
                    aria-label={
                      favorito
                        ? `Remover ${item.ref} dos favoritos`
                        : `Favoritar ${item.ref}`
                    }
                    aria-pressed={favorito}
                    className={`rounded p-1 ${
                      favorito
                        ? 'text-accent'
                        : 'text-muted-foreground hover:text-accent'
                    }`}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={favorito ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                  {item.texto}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <Button
                    
                    variant="ghost"
                    className="h-7 px-2 text-xs text-[#3261AB]"
                    onClick={async () => {
                      await copiar(textoParaCompartilhar(item));
                      toast.success('Versículo copiado.');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </Button>
                  <Button
                    
                    variant="ghost"
                    className="h-7 px-2 text-xs text-[#3261AB]"
                    asChild
                  >
                    <a
                      href={linkWhatsApp(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Enviar
                    </a>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {!buscar.length && (
          <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-sm text-muted-foreground">
            <BookMarked className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            Nenhum versículo encontrado para “{termo}”.
          </p>
        )}
      </section>
    </div>
  );
}


