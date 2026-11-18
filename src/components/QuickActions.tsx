import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar, Sparkles, Cloud, BookOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SupabaseService } from '../lib/supabaseService';
import type { Sermon } from '../types';

/**
 * Exibe uma grade de cards de ações rápidas com acessibilidade,
 * feedback visual e modal de detalhamento por ação
 */
export function QuickActions() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [geradorParams, setGeradorParams] = useState({
    texto_biblico: 'João 3:16',
    tema: 'Amor de Deus',
    publico_alvo: 'Geral',
    tipo_sermao: 'Expositivo',
    titulo: '',
    tom: 'Encorajador',
  });

  const [history, setHistory] = useState<
    Array<{ id: string; title: string; date: string }>
  >([]);

  const actions = useMemo(
    () => [
      {
        id: 'novo-agendamento',
        title: 'Novo Agendamento',
        description: 'Criar um evento na agenda',
        icon: Calendar,
        perform: async () => {
          toast.info('Abra a Agenda para concluir o agendamento.');
          addHistory('Novo Agendamento');
        },
      },
      {
        id: 'gerar-sermao',
        title: 'Gerar Sermão com IA',
        description: 'Usa a IA para gerar um sermão',
        icon: Sparkles,
        perform: async () => {
          try {
            const sermon = await SupabaseService.generateSermonWithAI({
              texto_biblico: geradorParams.texto_biblico,
              tema: geradorParams.tema,
              publico_alvo: geradorParams.publico_alvo,
              tipo_sermao: geradorParams.tipo_sermao,
              titulo: geradorParams.titulo || undefined,
              tom: geradorParams.tom,
            });
            toast.success(`Sermão gerado: ${sermon.titulo || 'Sem título'}`);
            addHistory('Gerar Sermão com IA');
          } catch (e: any) {
            toast.error('Falha ao gerar sermão');
          }
        },
      },
      {
        id: 'abrir-caderno',
        title: 'Abrir Caderno do Pastor',
        description: 'Gerenciar biblioteca de sermões',
        icon: BookOpen,
        perform: async () => {
          toast.info('Use o menu principal para acessar o Caderno.');
          addHistory('Abrir Caderno do Pastor');
        },
      },
      {
        id: 'sincronizar',
        title: 'Sincronizar Dados',
        description: 'Atualiza dados entre offline e nuvem',
        icon: Cloud,
        perform: async () => {
          const ok = await SupabaseService.isAuthenticated();
          if (!ok) {
            toast.info('Faça login para sincronizar.');
            return;
          }
          toast.success('Sincronização iniciada no módulo Caderno.');
          addHistory('Sincronizar Dados');
        },
      },
    ],
    [geradorParams]
  );

  function addHistory(title: string) {
    const entry = {
      id: `${Date.now()}`,
      title,
      date: new Date().toLocaleString('pt-BR'),
    };
    const next = [entry, ...history].slice(0, 10);
    setHistory(next);
    try {
      localStorage.setItem(
        'pastorhub_quick_actions_history',
        JSON.stringify(next)
      );
    } catch {}
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pastorhub_quick_actions_history');
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  function openDetails(actionId: string) {
    setCurrentAction(actionId);
    setDialogOpen(true);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight')
      setActiveIndex((i) => Math.min(i + 1, actions.length - 1));
    if (e.key === 'ArrowLeft') setActiveIndex((i) => Math.max(i - 1, 0));
    if (e.key === 'Enter') {
      const act = actions[activeIndex];
      if (act) openDetails(act.id);
    }
  }

  return (
    <div
      ref={containerRef}
      className="space-y-3"
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-label="Ações rápidas"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {actions.map((a, idx) => {
          const Icon = a.icon;
          const isActive = idx === activeIndex;
          return (
            <Card
              key={a.id}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onFocus={() => setActiveIndex(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => openDetails(a.id)}
              className={`cursor-pointer transition-all duration-200 border-l-4 ${
                isActive
                  ? 'border-l-[#95C121] shadow-md'
                  : 'border-l-transparent'
              } focus:outline-none focus:ring-2 focus:ring-[#95C121]`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#002645]" />
                  {a.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{a.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {currentAction && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {actions.find((x) => x.id === currentAction)?.title}
                </DialogTitle>
                <DialogDescription>
                  {actions.find((x) => x.id === currentAction)?.description}
                </DialogDescription>
              </DialogHeader>

              {currentAction === 'gerar-sermao' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs" htmlFor="qa-texto-biblico">
                        Texto bíblico
                      </label>
                      <Input
                        id="qa-texto-biblico"
                        value={geradorParams.texto_biblico}
                        onChange={(e) =>
                          setGeradorParams({
                            ...geradorParams,
                            texto_biblico: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs" htmlFor="qa-tema">
                        Tema
                      </label>
                      <Input
                        id="qa-tema"
                        value={geradorParams.tema}
                        onChange={(e) =>
                          setGeradorParams({
                            ...geradorParams,
                            tema: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs" htmlFor="qa-publico">
                        Público-alvo
                      </label>
                      <Input
                        id="qa-publico"
                        value={geradorParams.publico_alvo}
                        onChange={(e) =>
                          setGeradorParams({
                            ...geradorParams,
                            publico_alvo: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs" htmlFor="qa-tipo">
                        Tipo de sermão
                      </label>
                      <Select
                        value={geradorParams.tipo_sermao}
                        onValueChange={(v) =>
                          setGeradorParams({ ...geradorParams, tipo_sermao: v })
                        }
                      >
                        <SelectTrigger id="qa-tipo">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Expositivo">Expositivo</SelectItem>
                          <SelectItem value="Temático">Temático</SelectItem>
                          <SelectItem value="Textual">Textual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs" htmlFor="qa-tom">
                        Tom
                      </label>
                      <Input
                        id="qa-tom"
                        value={geradorParams.tom}
                        onChange={(e) =>
                          setGeradorParams({
                            ...geradorParams,
                            tom: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs" htmlFor="qa-titulo">
                        Título (opcional)
                      </label>
                      <Input
                        id="qa-titulo"
                        value={geradorParams.titulo}
                        onChange={(e) =>
                          setGeradorParams({
                            ...geradorParams,
                            titulo: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        actions.find((x) => x.id === 'gerar-sermao')?.perform()
                      }
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Gerar Sermão
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline">Fechar</Button>
                    </DialogClose>
                  </div>
                </div>
              )}

              {currentAction !== 'gerar-sermao' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Veja detalhes e execute a ação. O histórico abaixo registra
                    as execuções.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        actions.find((x) => x.id === currentAction)?.perform()
                      }
                    >
                      Ativar
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline">Fechar</Button>
                    </DialogClose>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-sm mb-2">Histórico de uso</h4>
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Sem registros recentes
                  </p>
                ) : (
                  <div className="space-y-1">
                    {history.map((h) => (
                      <div
                        key={h.id}
                        className="text-xs text-muted-foreground flex justify-between"
                      >
                        <span>{h.title}</span>
                        <span>{h.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
