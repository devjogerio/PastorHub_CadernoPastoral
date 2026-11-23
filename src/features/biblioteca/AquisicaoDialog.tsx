import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
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
import {
  registrarPedido,
  type LivroBiblioteca,
  type PedidoBiblioteca,
  type TipoAquisicao,
} from '../../lib/biblioteca';

const PAGAMENTOS = [
  {
    id: 'pix',
    nome: 'Pix',
    descricao: 'Pagamento instantâneo. O QR Code é enviado após a confirmação.',
  },
  {
    id: 'cartao',
    nome: 'Cartão de crédito',
    descricao: 'Cobrança na confirmação, conforme a condição da oferta.',
  },
  {
    id: 'boleto',
    nome: 'Boleto bancário',
    descricao: 'Compensação após o pagamento do boleto.',
  },
];

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ROTULO_TIPO: Record<TipoAquisicao, string> = {
  comprar: 'Compra',
  alugar: 'Aluguel',
};

interface AquisicaoDialogProps {
  livro: LivroBiblioteca | null;
  tipo: TipoAquisicao;
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
}

interface Erros {
  pagamento?: string;
  email?: string;
  aceite?: string;
}

export function AquisicaoDialog({
  livro,
  tipo,
  aberto,
  onOpenChange,
}: AquisicaoDialogProps) {
  const [pagamento, setPagamento] = useState('');
  const [email, setEmail] = useState('');
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [pedido, setPedido] = useState<PedidoBiblioteca | null>(null);

  // Cada abertura começa do zero, evitando reaproveitar dados do pedido anterior.
  useEffect(() => {
    if (!aberto) return;
    setPagamento('');
    setEmail('');
    setAceite(false);
    setErros({});
    setEnviando(false);
    setPedido(null);
  }, [aberto, livro?.id, tipo]);

  const validar = (): Erros => {
    const proximos: Erros = {};
    if (!pagamento) proximos.pagamento = 'Escolha uma forma de pagamento.';
    if (!EMAIL_VALIDO.test(email.trim())) {
      proximos.email = 'Informe um e-mail válido para contato.';
    }
    if (!aceite) {
      proximos.aceite =
        'Confirme que leu as condições e a licença da obra.';
    }
    return proximos;
  };

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!livro || enviando) return;
    const falhas = validar();
    setErros(falhas);
    if (Object.keys(falhas).length) return;

    setEnviando(true);
    const registro = registrarPedido(livro, tipo, {
      pagamento,
      email: email.trim(),
    });
    setPedido(registro);
    setEnviando(false);
    toast.success(
      `Solicitação de ${ROTULO_TIPO[tipo].toLowerCase()} registrada · ${registro.protocolo}`,
    );
  };

  if (!livro) return null;

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">{livro.titulo}</DialogTitle>
          <DialogDescription>
            {livro.autor} · {ROTULO_TIPO[tipo]} · valor confirmado pela equipe
            antes da cobrança
          </DialogDescription>
        </DialogHeader>

        {pedido ? (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Solicitação registrada
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {ROTULO_TIPO[pedido.tipo]} de <strong>{pedido.titulo}</strong> via{' '}
                {PAGAMENTOS.find((item) => item.id === pedido.pagamento)?.nome}.
                O retorno será enviado para <strong>{pedido.email}</strong>.
              </p>
            </div>
            <p className="rounded-lg border border-dashed border-[#3261AB] bg-soft px-3 py-2 font-mono text-sm text-primary">
              Protocolo {pedido.protocolo}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Concluir
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={enviar} noValidate>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-semibold text-primary">
                Forma de pagamento
              </legend>
              {PAGAMENTOS.map((item) => {
                const ativo = pagamento === item.id;
                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      ativo
                        ? 'border-primary bg-accent/10'
                        : 'border-line hover:border-[#3261AB]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pagamento"
                      value={item.id}
                      checked={ativo}
                      onChange={() => {
                        setPagamento(item.id);
                        setErros((atuais) => ({ ...atuais, pagamento: undefined }));
                      }}
                      className="mt-1 accent-[#002645]"
                    />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-medium text-primary">
                        <CreditCard className="h-4 w-4" />
                        {item.nome}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.descricao}
                      </span>
                    </span>
                  </label>
                );
              })}
              {erros.pagamento && (
                <p className="text-xs font-medium text-destructive">
                  {erros.pagamento}
                </p>
              )}
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="aquisicao-email">E-mail para contato</Label>
              <Input
                id="aquisicao-email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                aria-invalid={Boolean(erros.email)}
                onChange={(evento) => {
                  setEmail(evento.target.value);
                  setErros((atuais) => ({ ...atuais, email: undefined }));
                }}
              />
              {erros.email && (
                <p className="text-xs font-medium text-destructive">
                  {erros.email}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(evento) => {
                  setAceite(evento.target.checked);
                  setErros((atuais) => ({ ...atuais, aceite: undefined }));
                }}
                className="mt-0.5 accent-[#002645]"
              />
              Li as condições da oferta e a licença da obra.
            </label>
            {erros.aceite && (
              <p className="text-xs font-medium text-destructive">
                {erros.aceite}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={enviando}
                className="bg-accent text-primary hover:bg-accent/90"
              >
                {enviando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registrando…
                  </>
                ) : (
                  `Confirmar ${ROTULO_TIPO[tipo].toLowerCase()}`
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
