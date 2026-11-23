import { useEffect, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Share2,
  User,
  Users,
} from 'lucide-react';
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
  carregarPerfil,
  compartilharPerfil,
  consumirSolicitacaoCardPerfil,
  ouvirSolicitacaoCardPerfil,
  salvarPerfil,
  validarPerfil,
  type PerfilUsuario,
} from '../../lib/perfil';
import { iniciais } from '../../lib/format';
import { useRota } from '../../app/router';
import { navegar } from '../../app/router';
import { FotoPerfilSection } from './FotoPerfilSection';

const ATALHOS = [
  {
    titulo: 'Devocional',
    descricao: 'Palavra de Deus para o seu dia',
    icone: BookOpen,
    destino: 'sermoes',
  },
  {
    titulo: 'Pedidos de oração',
    descricao: 'Compartilhe suas orações',
    icone: MessageCircle,
    destino: 'chat',
  },
  {
    titulo: 'Minhas comunidades',
    descricao: 'Conecte-se com sua igreja',
    icone: Users,
    destino: 'chat',
  },
  {
    titulo: 'Eventos',
    descricao: 'Confira a agenda e participe',
    icone: CalendarDays,
    destino: 'agenda',
  },
];

export function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilUsuario>(() => carregarPerfil());
  const [editando, setEditando] = useState(false);
  const [cardAberto, setCardAberto] = useState(false);
  const [rascunho, setRascunho] = useState<PerfilUsuario>(perfil);
  const [erro, setErro] = useState<string | null>(null);
  const { secao } = useRota();

  useEffect(() => {
    if (consumirSolicitacaoCardPerfil()) setCardAberto(true);
    return ouvirSolicitacaoCardPerfil(() => {
      consumirSolicitacaoCardPerfil();
      setCardAberto(true);
    });
  }, []);

  const abrirEdicao = () => {
    setRascunho(perfil);
    setErro(null);
    setEditando(true);
  };

  const salvar = (evento: React.FormEvent) => {
    evento.preventDefault();
    const falha = validarPerfil(rascunho);
    if (falha) {
      setErro(falha);
      return;
    }
    const normalizado: PerfilUsuario = {
      ...rascunho,
      nome: rascunho.nome.trim(),
      apelido: rascunho.apelido.trim(),
      email: rascunho.email.trim(),
      cidade: rascunho.cidade.trim(),
    };
    if (!salvarPerfil(normalizado)) {
      setErro('Não foi possível salvar neste navegador.');
      return;
    }
    setPerfil(normalizado);
    setEditando(false);
    toast.success('Perfil atualizado.');
  };

  const compartilhar = async () => {
    const mensagem = await compartilharPerfil(perfil);
    if (!mensagem) return;
    if (mensagem.includes('Não foi possível')) toast.error(mensagem);
    else toast.success(mensagem);
  };

  const campo = (rotulo: string, valor: string, Icone: typeof User) => (
    <div className="flex items-center gap-2 text-sm text-foreground/80">
      <Icone className="h-4 w-4 shrink-0 text-[#3261AB]" />
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {rotulo}
        </span>
        <span className="block truncate">{valor}</span>
      </span>
    </div>
  );

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6" aria-label="Perfil do usuário">
      <header className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary to-[#3261AB] p-5 text-white shadow-lg">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-white/10 text-xl font-bold">
          {iniciais(perfil.nome)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold">{perfil.nome}</h2>
          <p className="truncate text-sm text-white/75">{perfil.apelido}</p>
        </div>
      </header>

      <nav className="grid gap-2 sm:grid-cols-2" aria-label="Atalhos do perfil">
        {ATALHOS.map((atalho) => {
          const Icone = atalho.icone;
          return (
            <button
              key={atalho.titulo}
              type="button"
              onClick={() => navegar(atalho.destino)}
              className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 text-left transition-colors hover:border-[#3261AB] hover:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-soft text-[#3261AB]">
                <Icone className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-primary">
                  {atalho.titulo}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {atalho.descricao}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </nav>

      {/* Card "Meu perfil": exibido exclusivamente em modal (popup). */}
      <Dialog open={cardAberto} onOpenChange={setCardAberto}>
        <DialogContent className="sm:max-w-md">
          <article className="grid gap-4" aria-label="Meu perfil">
            <DialogHeader>
              <DialogTitle className="text-primary">Meu perfil</DialogTitle>
              <DialogDescription>
                Veja e edite suas informações.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2">
              {campo('Nome', perfil.nome, User)}
              {campo('E-mail', perfil.email, Mail)}
              {campo('Cidade', perfil.cidade, MapPin)}
              {campo('Membro desde', perfil.membroDesde, CalendarDays)}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={abrirEdicao} className="sm:flex-1">
                <User className="h-4 w-4" />
                Editar perfil
              </Button>
              <Button variant="outline" onClick={compartilhar} className="sm:flex-1">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </article>
        </DialogContent>
      </Dialog>

      <FotoPerfilSection
        perfil={perfil}
        onAtualizar={(novo) => setPerfil(novo)}
        onEditarPerfil={abrirEdicao}
      />

      <p className="text-center text-[11px] text-muted-foreground">
        Seção atual: <span className="font-semibold text-primary">{secao}</span> ·
        dados salvos apenas neste dispositivo.
      </p>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Editar perfil</DialogTitle>
            <DialogDescription>
              Atualize as informações exibidas no seu perfil.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={salvar} noValidate>
            {[
              { chave: 'nome', rotulo: 'Nome', tipo: 'text' },
              { chave: 'apelido', rotulo: 'Apelido ou frase', tipo: 'text' },
              { chave: 'email', rotulo: 'E-mail', tipo: 'email' },
              { chave: 'cidade', rotulo: 'Cidade', tipo: 'text' },
            ].map((item) => (
              <div key={item.chave} className="space-y-1">
                <Label htmlFor={`perfil-${item.chave}`}>{item.rotulo}</Label>
                <Input
                  id={`perfil-${item.chave}`}
                  type={item.tipo}
                  value={rascunho[item.chave as 'nome' | 'apelido' | 'email' | 'cidade']}
                  onChange={(evento) =>
                    setRascunho((atual) => ({
                      ...atual,
                      [item.chave]: evento.target.value,
                    }))
                  }
                />
              </div>
            ))}
            {erro && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {erro}
              </p>
            )}
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
