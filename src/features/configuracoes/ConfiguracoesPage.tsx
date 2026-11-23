import { useEffect, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Cloud,
  Download,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  Palette,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CHAVES, lerJSON, salvarJSON } from '../../lib/armazenamento';
import { carregarPerfil } from '../../lib/perfil';
import { iniciais, normalizar } from '../../lib/format';
import { navegar } from '../../app/router';

interface Preferencias {
  temaEscuro: boolean;
  push: boolean;
  email: boolean;
  som: boolean;
  sincronizarAuto: boolean;
  bloqueioAuto: boolean;
}

const PREFERENCIAS_PADRAO: Preferencias = {
  temaEscuro: false,
  push: true,
  email: true,
  som: false,
  sincronizarAuto: true,
  bloqueioAuto: false,
};

/** Aplica o tema no documento; o React não tem ThemeProvider montado. */
function aplicarTema(escuro: boolean): void {
  const raiz = document.documentElement;
  raiz.classList.toggle('dark', escuro);
  raiz.style.colorScheme = escuro ? 'dark' : 'light';
}

interface ConfiguracoesPageProps {
  onSair?: () => void;
  isAuthenticated?: boolean;
}

export function ConfiguracoesPage({
  onSair,
  isAuthenticated = false,
}: ConfiguracoesPageProps) {
  const perfil = carregarPerfil();
  const [prefs, setPrefs] = useState<Preferencias>(() => ({
    ...PREFERENCIAS_PADRAO,
    ...lerJSON<Partial<Preferencias>>(CHAVES.tema, {}),
  }));

  // Persiste e aplica sempre que qualquer preferência muda.
  useEffect(() => {
    salvarJSON(CHAVES.tema, prefs);
    aplicarTema(prefs.temaEscuro);
  }, [prefs]);

  const alternar = (chave: keyof Preferencias, valor: boolean) => {
    setPrefs((atuais) => ({ ...atuais, [chave]: valor }));
  };

  const limparCache = () => {
    const preservar = new Set<string>([
      CHAVES.perfil,
      CHAVES.pedidosBiblioteca,
      CHAVES.favoritosBiblioteca,
    ]);
    let removidas = 0;
    try {
      Object.keys(window.localStorage).forEach((chave) => {
        if (!normalizar(chave).startsWith('pastorhub')) return;
        if (preservar.has(chave)) return;
        window.localStorage.removeItem(chave);
        removidas += 1;
      });
    } catch {
      toast.error('Não foi possível limpar o cache neste navegador.');
      return;
    }
    toast.success(`${removidas} registros locais removidos.`);
  };

  const exportarDados = () => {
    const dados: Record<string, unknown> = {};
    try {
      Object.keys(window.localStorage).forEach((chave) => {
        if (!normalizar(chave).startsWith('pastorhub')) return;
        const bruto = window.localStorage.getItem(chave);
        if (bruto == null) return;
        try {
          dados[chave] = JSON.parse(bruto);
        } catch {
          dados[chave] = bruto;
        }
      });
    } catch {
      toast.error('Não foi possível exportar os dados.');
      return;
    }
    const conteudo = JSON.stringify(
      { exportadoEm: new Date().toISOString(), dados },
      null,
      2,
    );
    const arquivo = new Blob([conteudo], { type: 'application/json' });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pastorhub-dados.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados em JSON.');
  };

  const linhaSwitch = (
    titulo: string,
    descricao: string,
    chave: keyof Preferencias,
    Icone: typeof Bell,
  ) => (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-start gap-2">
        <Icone className="mt-0.5 h-4 w-4 shrink-0 text-[#3261AB]" />
        <div>
          <Label>{titulo}</Label>
          <p className="text-xs text-muted-foreground">{descricao}</p>
        </div>
      </div>
      <Switch
        checked={prefs[chave]}
        onCheckedChange={(valor) => alternar(chave, valor)}
        aria-label={titulo}
      />
    </div>
  );

  return (
    <div className="space-y-4 px-4 py-5 pb-8 sm:px-6">
      <header className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary to-[#3261AB] p-5 text-white shadow-lg">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-white/10 text-xl font-bold">
          {iniciais(perfil.nome)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold">{perfil.nome}</h2>
          <p className="truncate text-sm text-white/75">{perfil.email}</p>
          <Badge className="mt-1 bg-accent text-primary">
            {isAuthenticated ? 'Conta conectada' : 'Modo local'}
          </Badge>
        </div>
      </header>

      <Tabs defaultValue="geral">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4 space-y-3">
          <section className="rounded-xl border border-line bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <User className="h-4 w-4" />
              Perfil
            </h3>
            <div className="mt-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => navegar('perfil')}
              >
                Editar perfil
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() =>
                  toast.info(
                    'A troca de senha usa a autenticação do Supabase quando configurada.',
                  )
                }
              >
                Alterar senha
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Palette className="h-4 w-4" />
              Aparência
            </h3>
            <div className="mt-3 space-y-3">
              {linhaSwitch(
                'Modo escuro',
                'Alterna a paleta do aplicativo',
                'temaEscuro',
                Moon,
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <Globe className="mt-0.5 h-4 w-4 text-[#3261AB]" />
                  <div>
                    <Label>Idioma</Label>
                    <p className="text-xs text-muted-foreground">
                      Português (Brasil)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Bell className="h-4 w-4" />
              Notificações
            </h3>
            <div className="mt-3 space-y-3">
              {linhaSwitch(
                'Push',
                'Receber alertas no dispositivo',
                'push',
                Bell,
              )}
              <Separator />
              {linhaSwitch(
                'E-mail',
                'Resumo e lembretes por e-mail',
                'email',
                Bell,
              )}
              <Separator />
              {linhaSwitch('Som', 'Sons de notificação', 'som', Bell)}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="dados" className="mt-4 space-y-3">
          <section className="rounded-xl border border-line bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Cloud className="h-4 w-4" />
              Sincronização
            </h3>
            <div className="mt-3 space-y-3">
              {linhaSwitch(
                'Sincronização automática',
                'Envia alterações quando houver conexão',
                'sincronizarAuto',
                Cloud,
              )}
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  toast.info('Sincronização executada no próximo acesso online.')
                }
              >
                <Cloud className="h-4 w-4" />
                Sincronizar agora
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Download className="h-4 w-4" />
              Armazenamento local
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Dados do perfil, biblioteca, versículos e chat ficam neste
              dispositivo.
            </p>
            <div className="mt-3 space-y-2">
              <Button variant="outline" className="w-full" onClick={exportarDados}>
                <Download className="h-4 w-4" />
                Exportar dados (JSON)
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={limparCache}
              >
                <Trash2 className="h-4 w-4" />
                Limpar cache local
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Shield className="h-4 w-4" />
              Privacidade e segurança
            </h3>
            <div className="mt-3 space-y-2">
              {linhaSwitch(
                'Bloqueio automático',
                'Pede acesso após alguns minutos inativo',
                'bloqueioAuto',
                Shield,
              )}
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() =>
                  toast.info('Política de Privacidade disponível no site.')
                }
              >
                Política de Privacidade
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => toast.info('Termos de Uso disponíveis no site.')}
              >
                Termos de Uso
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="sobre" className="mt-4 space-y-3">
          <section className="rounded-xl border border-line bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#3261AB]">
              <Info className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-primary">PastorHub</h3>
            <p className="text-sm text-muted-foreground">Versão 0.1.0</p>
            <Badge className="mt-2 bg-accent text-primary">Atualizado</Badge>
          </section>

          <section className="rounded-xl border border-line bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <HelpCircle className="h-4 w-4" />
              Ajuda e suporte
            </h3>
            <div className="mt-2 space-y-1">
              {[
                'Central de ajuda',
                'Tutoriais',
                'Reportar problema',
                'Fale conosco',
              ].map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => toast.info(`${item}: em breve no app.`)}
                >
                  {item}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </section>

          {onSair && (
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onSair}
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          )}
          <p className="text-center text-[11px] text-muted-foreground">
            © 2026 PastorHub · Licença MIT
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
