import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Check,
  CreditCard,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { EMAIL_VALIDO } from '../../lib/perfil';
import {
  assinaturaDe,
  economiaAnual,
  equivalenteMensal,
  formatarPreco,
  lerPix,
  lerPlanos,
  payloadPix,
  precoDoCiclo,
  salvarAssinatura,
  type CicloCobranca,
  type Plano,
} from '../../lib/planos';

interface Comprovante {
  plano: string;
  ciclo: CicloCobranca;
  valor: number;
  protocolo: string;
}

export function PlanosPage() {
  const planos = useMemo(() => lerPlanos(), []);
  const pix = useMemo(() => lerPix(), []);
  const [ciclo, setCiclo] = useState<CicloCobranca>('mensal');
  const [email, setEmail] = useState('');
  const [escolhido, setEscolhido] = useState<Plano | null>(null);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [comprovante, setComprovante] = useState<Comprovante | null>(null);

  const assinatura = assinaturaDe(email.trim());

  const abrirAssinatura = (plano: Plano) => {
    if (plano.id === 'offline') {
      toast.info('O plano Offline já está disponível sem custo.');
      return;
    }
    setErro('');
    setEscolhido(plano);
  };

  const confirmar = () => {
    if (!escolhido) return;
    if (!EMAIL_VALIDO.test(email.trim())) {
      setErro('Informe o e-mail da conta para vincular a assinatura.');
      return;
    }
    setEnviando(true);
    const valor = precoDoCiclo(escolhido, ciclo);
    const protocolo = `PH-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const salvo = salvarAssinatura(email.trim(), {
      plano: escolhido.nome,
      ciclo,
      valor,
      statusCobranca: 'Pendente',
      metodo: 'Pix',
    });
    setEnviando(false);
    if (!salvo) {
      setErro('Não foi possível registrar a assinatura neste navegador.');
      return;
    }
    setComprovante({
      plano: escolhido.nome,
      ciclo,
      valor,
      protocolo,
    });
    toast.success(`Assinatura ${escolhido.nome} registrada como pendente.`);
  };

  const fecharDialogo = (aberto: boolean) => {
    if (aberto) return;
    setEscolhido(null);
    setComprovante(null);
    setErro('');
  };

  const payload = useMemo(() => {
    if (!comprovante || !pix.chave) return '';
    return payloadPix(pix, comprovante.valor);
  }, [comprovante, pix]);

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6">
      <header className="rounded-2xl bg-gradient-to-br from-primary to-[#3261AB] p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              Assinatura
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Planos do PastorHub</h2>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              Comece offline e evolua quando precisar de IA, backup e equipe.
            </p>
          </div>
          <CreditCard className="hidden h-8 w-8 text-accent sm:block" />
        </div>
      </header>

      <div
        className="flex w-full rounded-xl border border-line bg-white p-1"
        role="group"
        aria-label="Ciclo de cobrança"
      >
        {(['mensal', 'anual'] as CicloCobranca[]).map((item) => {
          const ativo = ciclo === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCiclo(item)}
              aria-pressed={ativo}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                ativo ? 'bg-primary text-white' : 'text-muted-foreground'
              }`}
            >
              {item === 'mensal' ? 'Mensal' : 'Anual'}
              {item === 'anual' && (
                <span className="ml-1 text-[10px] font-bold text-accent">
                  economia
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {planos.map((plano) => {
          const preco = precoDoCiclo(plano, ciclo);
          const economia = economiaAnual(plano);
          const atual = assinatura?.plano === plano.nome;
          return (
            <article
              key={plano.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-4 ${
                plano.destaque
                  ? 'border-accent shadow-lg ring-1 ring-accent/40'
                  : 'border-line'
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3 w-3" />
                  Recomendado
                </span>
              )}
              {atual && (
                <Badge className="absolute right-3 top-3 bg-primary text-white">
                  Seu plano
                </Badge>
              )}
              <h3
                className="mt-1 text-lg font-semibold"
                style={{ color: plano.cor }}
              >
                {plano.nome}
              </h3>
              <p className="text-xs text-muted-foreground">{plano.desc}</p>
              <p className="mt-3 text-2xl font-bold text-primary">
                {formatarPreco(preco)}
                {preco > 0 && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    /{ciclo === 'anual' ? 'ano' : 'mês'}
                  </span>
                )}
              </p>
              {ciclo === 'anual' && economia > 0 && (
                <p className="text-[11px] font-semibold text-accent">
                  Economize {formatarPreco(economia)} ·{' '}
                  {formatarPreco(equivalenteMensal(plano))}/mês
                </p>
              )}
              <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                {plano.recursos.map((recurso) => (
                  <li key={recurso} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-foreground/80">{recurso}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-4 ${
                  plano.destaque
                    ? 'bg-accent text-primary hover:bg-accent/90'
                    : ''
                }`}
                variant={plano.destaque ? 'default' : 'outline'}
                onClick={() => abrirAssinatura(plano)}
              >
                {plano.id === 'offline'
                  ? 'Continuar grátis'
                  : `Assinar ${plano.nome}`}
              </Button>
            </article>
          );
        })}
      </div>

      <section className="rounded-xl border border-line bg-white p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <BadgeCheck className="h-4 w-4 text-[#3261AB]" />
          Consultar assinatura
        </h3>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            placeholder="E-mail usado na assinatura"
            aria-label="E-mail da assinatura"
          />
          <Button
            variant="outline"
            onClick={() => {
              if (!EMAIL_VALIDO.test(email.trim())) {
                toast.error('Informe um e-mail válido.');
                return;
              }
              const registro = assinaturaDe(email.trim());
              if (!registro) {
                toast.info('Nenhuma assinatura encontrada para este e-mail.');
                return;
              }
              toast.success(
                `${registro.plano} · ${registro.ciclo} · ${formatarPreco(registro.valor)} · ${registro.statusCobranca ?? 'Ativa'}`,
              );
            }}
          >
            Consultar
          </Button>
        </div>
        {assinatura && (
          <p className="mt-2 text-xs text-muted-foreground">
            Assinatura atual: <strong className="text-primary">{assinatura.plano}</strong>{' '}
            · {assinatura.ciclo} · {formatarPreco(assinatura.valor)} ·{' '}
            {assinatura.statusCobranca ?? 'Ativa'}
          </p>
        )}
      </section>

      <Dialog open={Boolean(escolhido)} onOpenChange={fecharDialogo}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {comprovante
                ? 'Pedido de assinatura registrado'
                : `Assinar ${escolhido?.nome ?? ''}`}
            </DialogTitle>
            <DialogDescription>
              {comprovante
                ? 'Pague via Pix com o código abaixo para ativar o plano.'
                : `Ciclo ${ciclo} · ${formatarPreco(
                    escolhido ? precoDoCiclo(escolhido, ciclo) : 0,
                  )}`}
            </DialogDescription>
          </DialogHeader>

          {comprovante ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-soft p-3 text-sm">
                <p>
                  <strong className="text-primary">Plano:</strong>{' '}
                  {comprovante.plano} ({comprovante.ciclo})
                </p>
                <p>
                  <strong className="text-primary">Valor:</strong>{' '}
                  {formatarPreco(comprovante.valor)}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Protocolo {comprovante.protocolo}
                </p>
              </div>
              {payload ? (
                <div className="space-y-1">
                  <Label htmlFor="pix-copia-cola">Pix copia e cola</Label>
                  <textarea
                    id="pix-copia-cola"
                    readOnly
                    rows={4}
                    value={payload}
                    className="w-full rounded-md border border-line bg-white p-2 font-mono text-[11px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(payload);
                        toast.success('Código Pix copiado.');
                      } catch {
                        toast.error('Não foi possível copiar o código.');
                      }
                    }}
                  >
                    Copiar código Pix
                  </Button>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-line bg-soft p-3 text-xs text-muted-foreground">
                  A chave Pix ainda não foi configurada pelo administrador. A
                  equipe entrará em contato pelo e-mail informado.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="plano-email">E-mail da conta</Label>
                <Input
                  id="plano-email"
                  type="email"
                  value={email}
                  onChange={(evento) => {
                    setEmail(evento.target.value);
                    setErro('');
                  }}
                  placeholder="seu@email.com"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                A cobrança é confirmada pela equipe. Nenhum valor é debitado
                automaticamente nesta etapa.
              </p>
              {erro && (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {erro}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {comprovante ? (
              <Button onClick={() => fecharDialogo(false)}>Concluir</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => fecharDialogo(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={enviando}
                  onClick={confirmar}
                  className="bg-accent text-primary hover:bg-accent/90"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registrando…
                    </>
                  ) : (
                    'Confirmar assinatura'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
