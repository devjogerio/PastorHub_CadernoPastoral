import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Send,
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
import {
  PASTORS,
  enviarMensagem,
  lerConversas,
  mensagensDoPastor,
  pastorPorId,
  ultimaMensagem,
  type RegistroChat,
} from '../../lib/chat';
import { Link, navegar, useRota } from '../../app/router';

const MOTIVOS = [
  'Família e Lar',
  'Saúde e Restauração',
  'Gratidão e Testemunho',
  'Direção Espiritual',
];

export function ChatPage() {
  const { id } = useRota();
  const pastor = id ? pastorPorId(id) : null;
  const [registro, setRegistro] = useState<RegistroChat>(() => lerConversas());
  const [texto, setTexto] = useState('');
  const [pedidoAberto, setPedidoAberto] = useState(false);
  const [pedido, setPedido] = useState({
    pastorId: String(PASTORS[0].id),
    motivo: MOTIVOS[0],
    texto: '',
  });
  const [erroPedido, setErroPedido] = useState('');
  const fimDaLista = useRef<HTMLDivElement | null>(null);

  const mensagens = pastor ? mensagensDoPastor(pastor, registro) : [];

  useEffect(() => {
    if (!pastor) return;
    fimDaLista.current?.scrollIntoView({ block: 'end' });
  }, [pastor, mensagens.length]);

  const enviar = () => {
    if (!pastor) return;
    const limpo = texto.trim();
    if (!limpo) {
      toast.error('Escreva uma mensagem antes de enviar.');
      return;
    }
    setRegistro(enviarMensagem(pastor, limpo, registro));
    setTexto('');
  };

  const enviarPedido = () => {
    if (!pedido.texto.trim()) {
      setErroPedido('Escreva o seu pedido de oração antes de enviar.');
      return;
    }
    const destino = pastorPorId(pedido.pastorId);
    const mensagem = `[Pedido de Oração · ${pedido.motivo}] ${pedido.texto.trim()}`;
    setRegistro(enviarMensagem(destino, mensagem, registro));
    setPedidoAberto(false);
    setPedido({ pastorId: String(PASTORS[0].id), motivo: MOTIVOS[0], texto: '' });
    setErroPedido('');
    toast.success(`Pedido enviado para ${destino.nome}.`);
    navegar(`chat/${destino.id}`);
  };

  if (!pastor) {
    return (
      <div className="space-y-4 px-4 py-5 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-primary">
              Comunidade & Pastores
            </h2>
            <p className="text-sm text-muted-foreground">
              Converse com pastores e envie pedidos de oração.
            </p>
          </div>
          <Button
            className="bg-accent text-primary hover:bg-accent/90"
            onClick={() => setPedidoAberto(true)}
          >
            <MessageCircle className="h-4 w-4" />
            Pedido de oração
          </Button>
        </header>

        <div className="grid gap-2">
          {PASTORS.map((item) => {
            const previa = ultimaMensagem(item, registro);
            return (
              <Link
                key={item.id}
                to={`chat/${item.id}`}
                className="flex w-full overflow-hidden items-center gap-3 rounded-xl border border-line bg-white p-3 transition-colors hover:border-[#3261AB] hover:shadow-sm"
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {item.avatar}
                  {item.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-accent" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-primary">
                      {item.nome}
                    </span>
                    {item.naoLida > 0 && (
                      <Badge className="h-5 min-w-5 justify-center rounded-full bg-accent px-1.5 text-[10px] text-primary">
                        {item.naoLida}
                      </Badge>
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.cargo} · {previa}
                  </span>
                </span>
                <Send className="h-4 w-4 shrink-0 rotate-45 text-muted-foreground" />
              </Link>
            );
          })}
        </div>

        <PedidoDialog
          aberto={pedidoAberto}
          onOpenChange={setPedidoAberto}
          pedido={pedido}
          setPedido={setPedido}
          erro={erroPedido}
          enviar={enviarPedido}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col px-0 sm:px-6 sm:py-5">
      <header className="flex items-center gap-3 border-b border-line bg-white px-3 py-3 sm:rounded-xl sm:border">
        <Link
          to="chat"
          aria-label="Voltar para lista de conversas"
          className="rounded-lg p-2 text-primary hover:bg-soft"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {pastor.avatar}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">{pastor.nome}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {pastor.cargo} · {pastor.online ? 'Online agora' : 'Offline'}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-accent text-primary hover:bg-accent/90"
          onClick={() => {
            setPedido((atual) => ({ ...atual, pastorId: String(pastor.id) }));
            setPedidoAberto(true);
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Pedir oração
        </Button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {mensagens.map((mensagem, indice) => {
          const minha = mensagem.autor === 'usuario';
          return (
            <div
              key={`${indice}-${mensagem.hora}`}
              className={`flex flex-col ${minha ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  minha
                    ? 'rounded-br-sm bg-primary text-white'
                    : 'rounded-bl-sm border border-line bg-white text-foreground'
                }`}
              >
                {mensagem.texto}
              </div>
              <time className="mt-0.5 px-1 text-[10px] text-muted-foreground">
                {mensagem.hora}
              </time>
            </div>
          );
        })}
        <div ref={fimDaLista} />
      </div>

      <div className="sticky bottom-16 flex gap-2 border-t border-line bg-white p-3 md:bottom-0 md:rounded-xl md:border">
        <Input
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter' && !evento.shiftKey) {
              evento.preventDefault();
              enviar();
            }
          }}
          placeholder="Escreva sua mensagem ou motivo de oração…"
          aria-label="Mensagem"
        />
        <Button onClick={enviar}>
          <Send className="h-4 w-4" />
          Enviar
        </Button>
      </div>

      <PedidoDialog
        aberto={pedidoAberto}
        onOpenChange={setPedidoAberto}
        pedido={pedido}
        setPedido={setPedido}
        erro={erroPedido}
        enviar={enviarPedido}
      />
    </div>
  );
}

interface PedidoDialogProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  pedido: { pastorId: string; motivo: string; texto: string };
  setPedido: React.Dispatch<
    React.SetStateAction<{ pastorId: string; motivo: string; texto: string }>
  >;
  erro: string;
  enviar: () => void;
}

function PedidoDialog({
  aberto,
  onOpenChange,
  pedido,
  setPedido,
  erro,
  enviar,
}: PedidoDialogProps) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Novo pedido de oração</DialogTitle>
          <DialogDescription>
            Seu pedido será encaminhado ao pastor ou ministério de intercessão.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="oracao-pastor">Destinatário</Label>
            <select
              id="oracao-pastor"
              value={pedido.pastorId}
              onChange={(evento) =>
                setPedido((atual) => ({ ...atual, pastorId: evento.target.value }))
              }
              className="h-9 w-full rounded-md border border-input bg-input-background px-2 text-sm"
            >
              {PASTORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome} ({item.cargo})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="oracao-motivo">Motivo / Área</Label>
            <select
              id="oracao-motivo"
              value={pedido.motivo}
              onChange={(evento) =>
                setPedido((atual) => ({ ...atual, motivo: evento.target.value }))
              }
              className="h-9 w-full rounded-md border border-input bg-input-background px-2 text-sm"
            >
              {MOTIVOS.map((motivo) => (
                <option key={motivo} value={motivo}>
                  {motivo}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="oracao-texto">Seu pedido</Label>
            <textarea
              id="oracao-texto"
              rows={3}
              value={pedido.texto}
              onChange={(evento) => {
                setPedido((atual) => ({ ...atual, texto: evento.target.value }));
              }}
              placeholder="Compartilhe seu pedido para intercedermos juntos…"
              className="w-full rounded-md border border-input bg-input-background px-2 py-1.5 text-sm"
            />
          </div>
          {erro && <p className="text-xs font-medium text-destructive">{erro}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-accent text-primary hover:bg-accent/90"
            onClick={enviar}
          >
            Enviar pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
