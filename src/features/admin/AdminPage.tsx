import { useMemo, useState } from 'react';
import {
  BookCopy,
  CreditCard,
  Database,
  Flag,
  Link2,
  Settings,
  Users,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { formatarPreco, lerPlanos, salvarPix, salvarPlanos, type Plano } from '../../lib/planos';
import { toast } from 'sonner@2.0.3';
import { AdminBusca } from './AdminBusca';
import { montarIndiceAdmin } from './busca';

/* ============================================================
   Painel administrativo — dados portados do app estático
   (pastorhub-static/js/admin.js, admin-planos.js e pagamentos.js).
   ============================================================ */

interface ItemCor {
  label: string;
  cor: string;
}

interface UsuarioAdmin {
  nome: string;
  email: string;
  igreja: string;
  cidade: string;
  plano: string;
  sermoes: number;
  atendimentos: number;
  status: string;
  acesso: string;
  cor: string;
}

interface Kpi {
  label: string;
  valor: string;
  delta: string;
  icone: typeof Users;
  cor: string;
}

interface ContaAdmin {
  email: string;
  nome: string;
  papel: 'admin' | 'usuario';
  desde: string;
  origem?: string;
}

interface Log {
  hora: string;
  usuario: string;
  acao: string;
  alvo: string;
  tipo: 'ok' | 'erro' | 'aviso';
}

const KPIS: Kpi[] = [
  { label: 'Usuários ativos', valor: '1.248', delta: '+8,4%', icone: Users, cor: '#002645' },
  { label: 'Sermões publ.', valor: '38.412', delta: '+12,1%', icone: Database, cor: '#3261AB' },
  { label: 'Atendimentos', valor: '9.317', delta: '+5,2%', icone: Flag, cor: '#95C121' },
  { label: 'Receita', valor: 'R$ 28.460,00', delta: '+9,8%', icone: CreditCard, cor: '#002645' },
  { label: 'Retention', valor: '87%', delta: '+1,4 p.p.', icone: Users, cor: '#95C121' },
  { label: 'Email Verified Rate', valor: 'N/A', delta: '', icone: Link2, cor: '#64748b' },
];

const ATIVOS_MENSAIS: Array<{ m: string; v: number }> = [
  { m: 'Dez', v: 640 }, { m: 'Jan', v: 720 }, { m: 'Fev', v: 705 }, { m: 'Mar', v: 810 },
  { m: 'Abr', v: 865 }, { m: 'Mai', v: 900 }, { m: 'Jun', v: 958 }, { m: 'Jul', v: 1010 },
  { m: 'Ago', v: 1075 }, { m: 'Set', v: 1120 }, { m: 'Out', v: 1180 }, { m: 'Nov', v: 1248 },
];

const SERMONES_POR_TIPO: ItemCor[] = [
  { label: 'Expositivo', cor: '#002645' },
  { label: 'Temático', cor: '#3261AB' },
  { label: 'Textual', cor: '#95C121' },
  { label: 'Narrativo', cor: '#a855f7' },
  { label: 'Evangelhástico', cor: '#f97316' },
];

const USUARIOS: UsuarioAdmin[] = [
  { nome: 'Marcos Vieira', email: 'marcos@evangelhoquadrado.com', igreja: 'Igreja do Evangelho Quadrado', cidade: 'Uberlândia MG', plano: 'Premium', sermoes: 42, atendimentos: 18, status: 'Ativo', acesso: 'Hoje, 09:14', cor: '#002645' },
  { nome: 'Ana Beatriz Rocha', email: 'ana.b.rocha@email.com', igreja: 'Comunidade Betel', cidade: 'Campinas SP', plano: 'Igreja', sermoes: 87, atendimentos: 34, status: 'Ativo', acesso: 'Hoje, 08:02', cor: '#3261AB' },
  { nome: 'Jonas Lima', email: 'jonas@centralpr.com', igreja: 'Igreja Central', cidade: 'Curitiba PR', plano: 'Premium', sermoes: 63, atendimentos: 25, status: 'Ativo', acesso: 'Ontem, 21:47', cor: '#95C121' },
  { nome: 'Rafael Monteiro', email: 'rafael@monteiro.org', igreja: 'Assembleia Deus Amor', cidade: 'Belém PA', plano: 'Offline', sermoes: 12, atendimentos: 6, status: 'Ativo', acesso: 'Ontem, 19:30', cor: '#a855f7' },
  { nome: 'Patrícia Nogueira', email: 'patricia@nog.net.br', igreja: 'Igreja do Nazareno', cidade: 'Goiânia GO', plano: 'Igreja', sermoes: 104, atendimentos: 41, status: 'Ativo', acesso: '12 Nov, 15:12', cor: '#f97316' },
  { nome: 'Samuel Aguiar', email: 'samuel@aguiar.app', igreja: 'Igreja Batista Central', cidade: 'Salvador BA', plano: 'Premium', sermoes: 55, atendimentos: 29, status: 'Suspenso', acesso: '08 Nov, 10:00', cor: '#ef4444' },
];

const CONTAS: ContaAdmin[] = [
  { email: 'admin@pastorhub.app', nome: 'Administrador', papel: 'admin', desde: '2025-01-15' },
  { email: 'ana.b.rocha@email.com', nome: 'Ana Beatriz Rocha', papel: 'usuario', desde: '2025-06-03' },
  { email: 'pastorhub.oficial@gmail.com', nome: 'PastorHub Oficial', papel: 'admin', desde: '2025-09-21', origem: 'google' },
];

const LOGS: Log[] = [
  { hora: 'Hoje, 11:42', usuario: 'admin@pastorhub.app', acao: 'Publicou conteúdo', alvo: 'A Fé Que Transforma Montanhas', tipo: 'ok' },
  { hora: 'Hoje, 11:18', usuario: 'ana.b.rocha@email.com', acao: 'Alterou o plano', alvo: 'Premium → Igreja', tipo: 'ok' },
  { hora: 'Hoje, 10:55', usuario: 'system', acao: 'Falha na Edge Function', alvo: 'send-notification (timeout)', tipo: 'erro' },
  { hora: 'Hoje, 10:20', usuario: 'samuel@aguiar.app', acao: 'Conta suspensa', alvo: 'Violação de uso', tipo: 'erro' },
  { hora: 'Ontem, 18:07', usuario: 'admin@pastorhub.app', acao: 'Atualizou feature flag', alvo: 'ai_enabled = false', tipo: 'aviso' },
  { hora: 'Ontem, 17:33', usuario: 'rafael@monteiro.org', acao: 'Exportou dados', alvo: '12 sermões (.txt)', tipo: 'ok' },
  { hora: 'Ontem, 16:12', usuario: 'tiago@ferreira.app', acao: 'Solicitou acesso', alvo: 'Igreja Central', tipo: 'aviso' },
];

const DIAS_AGO = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];

function BadgeStatus({ tipo, texto }: { tipo: 'ok' | 'erro' | 'aviso'; texto: string }) {
  const config =
    tipo === 'erro'
      ? 'bg-destructive/10 text-destructive border-destructive/20'
      : tipo === 'aviso'
        ? 'bg-amber-100 text-amber-900 border-amber-200'
        : 'bg-emerald-100 text-emerald-900 border-emerald-200';
  return (
    <Badge variant="outline" className={`${config} font-normal`}>
      {texto}
    </Badge>
  );
}

interface TabelaProps {
  columns: {
    header: string;
    render: (item: Record<string, unknown>, i: number) => React.ReactNode;
  }[];
  dados: unknown[];
  classe?: string;
}

function TabelaSimples({ columns, dados, classe = '' }: TabelaProps) {
  if (!dados.length) {
    return (
      <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }
  return (
    <div className={`overflow-x-auto rounded-xl border border-line bg-white ${classe}`}>
      <table className="w-full text-left text-sm">
        <thead className="bg-soft text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((coluna) => (
              <th key={coluna.header} className="px-4 py-3">{coluna.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line text-foreground/80">
          {dados.map((itemRaw, i) => {
            const item = itemRaw as Record<string, unknown>;
            return (
              <tr key={String(item.nome || i)}>
                {columns.map((coluna) => (
                  <td key={coluna.header} className="px-4 py-2">{coluna.render(item, i)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PainelDashboard() {
  const planos = useMemo(() => lerPlanos(), []);
  const linhasCrescimento = ATIVOS_MENSAIS.map((p) => ({ label: p.m, value: p.v }));
  const pico = Math.max(...ATIVOS_MENSAIS.map((p) => p.v));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-primary">Painel Administrativo</h2>
          <p className="text-sm text-muted-foreground">Visão geral: cobrança, engajamento e operação</p>
        </div>
        <Badge className="bg-accent text-primary">Versão 1.0.0 · pt-BR</Badge>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {KPIS.map((kpi) => {
          const Icone = kpi.icone;
          return (
            <article key={kpi.label} className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{kpi.label}</span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${kpi.cor}1a` }}
                >
                  <Icone className="h-4 w-4" style={{ color: kpi.cor }} />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold">{kpi.valor}</p>
              {kpi.delta && <p className="text-[11px] font-semibold text-accent">{kpi.delta}</p>}
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TabelaSimples
          dados={[
            { item: 'Usuários ativos', uso: '1.248' },
            { item: 'Sermões públicados', uso: '38.412' },
            { item: 'Atendimentos', uso: '9.317' },
            { item: 'Receita acumulada', uso: 'R$ 284.600,00' },
            { item: 'Retention', uso: '87%' },
          ]}
          columns={[
            { header: 'Métrica', render: (i) => String(i.item) },
            { header: 'Valor', render: (i) => <span className="text-primary">{String(i.uso)}</span> },
          ]}
        />
        <article className="rounded-xl border border-line bg-white p-4">
          <h3 className="text-sm font-semibold text-primary">
            Usuários ativos últimos meses
          </h3>
          <div className="mt-3 space-y-2">
            {linhasCrescimento.slice(-8).map((p) => (
              <div key={p.label} className="flex items-center justify-between">
                <span className="text-xs text-foreground/70">{p.label}</span>
                <span className="text-xs font-semibold text-primary">{p.value.toLocaleString('pt-BR')}</span>
              </div>
            ))}
            <p className="mt-1 text-[10px] text-muted-foreground">Pico: {pico.toLocaleString('pt-BR')}</p>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-line bg-white p-4">
          <h3 className="text-sm font-semibold text-primary">Sermões por tipo (relative width)</h3>
          <div className="mt-3 space-y-2">
            {SERMONES_POR_TIPO.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-24 truncate text-xs" style={{ color: item.cor }}>
                  {item.label}
                </span>
                <div className="h-2 flex-1 rounded-full bg-soft">
                  <div className="h-2 rounded-full" style={{ backgroundColor: item.cor, width: '90%' }} />
                </div>
                <span className="text-[11px] font-semibold text-foreground/80">~{item.label.length}%</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-line bg-white p-4">
          <h3 className="text-sm font-semibold text-primary">Estruturas</h3>
          {planos.map((plano) => (
            <div key={plano.id} className="flex items-center justify-between py-1">
              <span className="text-sm" style={{ color: plano.cor }}>{plano.nome}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {formatarPreco(plano.precoMensal)} · {plano.desc}
              </span>
            </div>
          ))}
        </article>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TabelaSimples
          dados={USUARIOS}
          columns={[
            { header: 'Usuário', render: (i) => <span className="font-medium">{String(i.nome)}</span> },
            { header: 'Plano', render: (i) => String(i.plano) },
            { header: 'Acesso', render: (i) => String(i.acesso) },
            { header: 'Sermões', render: (i) => String(i.sermoes) },
            { header: 'Atendimentos', render: (i) => String(i.atendimentos) },
            { header: 'Status', render: (i) => <BadgeStatus tipo="ok" texto={String(i.status)} /> },
            { header: 'Cidade', render: (i) => String(i.cidade) },
          ]}
        />
        <TabelaSimples
          dados={[
            { titulo: 'Oração pedidos', quando: 'Hoje, 14:00', local: 'Online', tipo: 'Oração', status: 'Pendente' },
            { titulo: 'Visitação alex@igreja.com', quando: 'Hoje, 10:30', local: 'Presencial', tipo: 'Visitação', status: 'Confirmado' },
            { titulo: 'Alertas do schedule', quando: 'Ontem, 18:07', local: 'Sistema', tipo: 'Atividade', status: 'Aviso' },
          ]}
          columns={[
            { header: 'Evento', render: (i) => String(i.titulo) },
            { header: 'Quando', render: (i) => String(i.quando) },
            { header: 'Local', render: (i) => String(i.local) },
            { header: 'Tipo', render: (i) => String(i.tipo) },
            { header: 'Status', render: (i) => <BadgeStatus tipo="ok" texto={String(i.status)} /> },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TabelaSimples
          dados={CONTAS}
          columns={[
            { header: 'Conta', render: (i) => <span className="font-medium">{String(i.email)}</span> },
            { header: 'Papel', render: (i) => <BadgeStatus tipo={i.papel === 'admin' ? 'ok' : 'aviso'} texto={String(i.papel)} /> },
            { header: 'Desde', render: (i) => String(i.desde) },
            { header: 'Origem', render: (i) => String(i.origem || 'manual') },
          ]}
        />
        <article className="rounded-xl border border-line bg-white p-4">
          <h3 className="text-sm font-semibold text-primary">Logs recentes</h3>
          <ul className="mt-3 space-y-2">
            {LOGS.slice(0, 5).map((log, i) => (
              <li key={i} className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <span className="text-[10px] text-muted-foreground">{log.hora}</span>
                <BadgeStatus tipo={log.tipo} texto={log.tipo} />
                <span>
                  <strong>{log.usuario}</strong> {log.acao} ·{' '}
                  <span className="text-primary">{log.alvo}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}

function FinanceiroPage() {
  const [chave, setChave] = useState('');
  const [nome, setNome] = useState('PastorHub');
  const [cidade, setCidade] = useState('SAO PAULO');
  const [valor, setValor] = useState('500');

  const salvou = () => {
    const ok = salvarPix({
      chave,
      nome,
      cidade,
      valor: Number(valor),
      tipo: 'estatica',
      gateway: 'mercadopago',
      recorrente: true,
      cobrancaAuto: true,
    });
    toast.success(ok ? 'Configuração Pix salva.' : 'Não foi possível salvar.');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-primary">Cobrança e Receita</h2>
          <p className="text-sm text-muted-foreground">BR Code (Pix copia e cola) e Recorrência</p>
        </div>
        <Badge className="bg-accent text-primary">Ativo · Demos estilo</Badge>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Planos ativos', valor: '3', cor: '#002645' },
          { label: 'Receita fixa (mês)', valor: 'R$ 1.980,00', cor: '#3261AB' },
          { label: 'Status Recorrência', valor: 'Pendente (teste)', cor: '#ef4444' },
        ].map((item) => (
          <article key={item.label} className="rounded-xl border border-line bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-xl font-bold" style={{ color: item.cor }}>{item.valor}</p>
          </article>
        ))}
      </div>

      <article className="space-y-4 rounded-xl border border-line bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Configuração do Pix (BR Code / EMV)</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="pix-chave">Chave Pix</Label>
            <Input
              id="pix-chave"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              placeholder="chave@pix.com.br"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pix-nome">Nome do recebedor</Label>
            <Input
              id="pix-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pix-cidade">Cidade</Label>
            <Input
              id="pix-cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pix-valor">Valor padrão</Label>
            <Input
              id="pix-valor"
              type="number"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
        </div>
        <Button className="bg-accent text-primary hover:bg-accent/90" onClick={salvou} disabled={!chave.trim()}>
          Salvar configuração
        </Button>
      </article>

      <article className="rounded-xl border border-line bg-white p-4 text-xs text-muted-foreground">
        O código BR Code/EMV completo será exposto após a chave ser configurada. O valor é validado com o BCB no gerador.
      </article>
    </div>
  );
}

function PlanosPage() {
  const planos = useMemo(() => lerPlanos(), []);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Plano>>({});

  const salvar = () => {
    if (!editandoId) return;
    const lista = planos.map((plano) =>
      plano.id === editandoId ? { ...plano, ...form } as Plano : plano,
    );
    if (salvarPlanos(lista)) toast.success('Plano salvo.');
    setEditandoId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-primary">Plano dos Padrões</h2>
          <p className="text-sm text-muted-foreground">Editação de nome, preço e limites dos planos Admin</p>
        </div>
        <Badge className="bg-accent text-primary">{planos.length} planos sincronizados</Badge>
      </header>

      <div className="grid gap-4 xl:grid-cols-3">
        {planos.map((plano) => (
          <article key={plano.id} className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold text-primary" style={{ color: plano.cor }}>
                {plano.nome}
              </h3>
              {plano.destaque && (
                <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-primary">
                  Recomendado
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{plano.desc}</p>
            <div className="mt-3 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Sermões <strong className="text-primary">{plano.limites.sermoes.toLocaleString('pt-BR')}</strong> ·{' '}
                Atendimentos <strong className="text-primary">{plano.limites.atendimentos.toLocaleString('pt-BR')}</strong> ·{' '}
                Assentos <strong className="text-primary">{plano.limites.assentos}</strong> ·{' '}
                Agentes <strong className="text-primary">{plano.limites.agentes}</strong> ·{' '}
                Storage <strong className="text-primary">{plano.limites.storageMB} MB</strong>
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditandoId(plano.id);
                  setForm({ nome: plano.nome });
                }}
              >
                Editar
              </Button>
            </div>
          </article>
        ))}
      </div>

      {editandoId && (
        <article className="space-y-3 rounded-xl border border-line bg-white p-4">
          <h3 className="text-sm font-semibold text-primary">Edição de plano</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Nome do plano</Label>
              <Input
                value={form.nome ?? ''}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
          </div>
          <Button className="bg-accent text-primary hover:bg-accent/90" onClick={salvar}>
            Salvar alterações
          </Button>
        </article>
      )}

      <article className="rounded-xl border border-line bg-white p-4 text-xs text-muted-foreground">
        <p>
          Localizam-se salvas nas chaves <code>pastorhub_admin_planos</code> e{' '}
          <code>pastorhub_admin_assinaturas</code>. Informações de Preço/Limite são sincronizados
          via versões das páginas (offline <em>Offline</em> = seção documental por enquanto).
        </p>
      </article>
    </div>
  );
}

export function AdminPage() {
  const [tab, setTab] = useState('painel');
  const indiceBusca = useMemo(
    () => montarIndiceAdmin({ usuarios: USUARIOS, contas: CONTAS, logs: LOGS, planos: lerPlanos() }),
    [],
  );

  const tabs = [
    { key: 'painel', rotulo: 'Painel' },
    { key: 'financeiro', rotulo: 'Financeiro' },
    { key: 'planos', rotulo: 'Planos' },
  ] as const;

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6">
      <header className="rounded-2xl bg-gradient-to-br from-primary to-[#3261AB] p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              Painel administrativo
            </p>
            <h2 className="mt-1 text-2xl font-semibold">PastorHub · Admin</h2>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              Cobrança, engajamento e operação dos pastores. Dados do painel estático.
            </p>
          </div>
          <Settings className="hidden h-8 w-8 text-accent sm:block" />
        </div>
      </header>

      <AdminBusca itens={indiceBusca} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((item) => (
            <TabsTrigger key={item.key} value={item.key}>
              {item.rotulo}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="painel">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookCopy className="h-4 w-4 text-primary" />
                Painel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PainelDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financeiro">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" />
                Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FinanceiroPage />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="planos">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flag className="h-4 w-4 text-primary" />
                Planos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlanosPage />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

