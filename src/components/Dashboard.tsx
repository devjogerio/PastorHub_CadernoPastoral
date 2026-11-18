import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Calendar, Users, Video, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { QuickActions } from './QuickActions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';

type Atendimento = {
  nome: string;
  hora: string;
  tipo: 'Aconselhamento' | 'Visitação' | 'Oração';
  status: 'confirmado' | 'pendente';
};

export function Dashboard() {
  const stats = [
    {
      title: 'Atendimentos Hoje',
      value: '3',
      icon: Users,
      trend: '+2 esta semana',
    },
    {
      title: 'Agenda do Mês',
      value: '24',
      icon: Calendar,
      trend: '12 concluídos',
    },
    {
      title: 'Palestras Agendadas',
      value: '5',
      icon: Video,
      trend: '+1 esta semana',
    },
    {
      title: 'Taxa de Presença',
      value: '94%',
      icon: TrendingUp,
      trend: '+5% vs mês anterior',
    },
  ];

  const initialAtendimentos: Atendimento[] = [
    {
      nome: 'Maria Silva',
      hora: '14:00',
      tipo: 'Aconselhamento',
      status: 'confirmado',
    },
    {
      nome: 'João Santos',
      hora: '16:00',
      tipo: 'Visitação',
      status: 'pendente',
    },
    { nome: 'Ana Costa', hora: '18:00', tipo: 'Oração', status: 'confirmado' },
  ];

  const [atendimentos, setAtendimentos] =
    useState<Atendimento[]>(initialAtendimentos);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<'view' | 'edit'>('view');
  const [form, setForm] = useState<Atendimento>({
    nome: '',
    hora: '',
    tipo: 'Aconselhamento',
    status: 'pendente',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pastorhub_atendimentos');
      if (raw) setAtendimentos(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'pastorhub_atendimentos',
        JSON.stringify(atendimentos)
      );
    } catch {}
  }, [atendimentos]);

  function openModal(index: number, mode: 'view' | 'edit') {
    setSelectedIndex(index);
    setForm(atendimentos[index]);
    setEditMode(mode);
    setModalOpen(true);
  }

  function validateForm(a: Atendimento): string | null {
    if (!a.nome.trim()) return 'Nome é obrigatório';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(a.hora))
      return 'Hora inválida (HH:MM)';
    if (!a.tipo) return 'Tipo é obrigatório';
    return null;
  }

  function saveChanges() {
    const nomeEl = document.getElementById(
      'atendimento-nome'
    ) as HTMLInputElement | null;
    const horaEl = document.getElementById(
      'atendimento-hora'
    ) as HTMLInputElement | null;
    const toSave: Atendimento = {
      ...form,
      nome: nomeEl?.value ?? form.nome,
      hora: horaEl?.value ?? form.hora,
    };
    const error = validateForm(toSave);
    if (error) {
      toast.error(error);
      return;
    }
    if (selectedIndex === null) return;
    const next = atendimentos.slice();
    next[selectedIndex] = { ...toSave };
    setAtendimentos(next);
    try {
      localStorage.setItem('pastorhub_atendimentos', JSON.stringify(next));
    } catch {}
    toast.success('Atendimento atualizado');
    setModalOpen(false);
  }

  function cancelChanges() {
    setModalOpen(false);
    toast.info('Alterações canceladas');
  }

  function toggleStatus(index: number) {
    const next = atendimentos.slice();
    next[index] = {
      ...next[index],
      status: next[index].status === 'confirmado' ? 'pendente' : 'confirmado',
    };
    setAtendimentos(next);
    toast.success('Status atualizado');
  }

  function cancelAppointment(index: number) {
    const next = atendimentos.slice();
    next.splice(index, 1);
    setAtendimentos(next);
    toast.success('Atendimento cancelado');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral da sua agenda pastoral
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Atendimentos</CardTitle>
            <CardDescription>Hoje - 29 de Outubro, 2025</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {atendimentos.map((atendimento, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate" data-testid={`atd-nome-${index}`}>
                    {atendimento.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {atendimento.tipo}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{atendimento.hora}</span>
                  <Badge
                    variant={
                      atendimento.status === 'confirmado'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {atendimento.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Button
                    data-testid={`atd-ver-btn-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(index, 'view')}
                  >
                    Ver
                  </Button>
                  <Button
                    data-testid={`atd-editar-btn-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(index, 'edit')}
                  >
                    Editar
                  </Button>
                  <Button
                    data-testid={`atd-toggle-btn-${index}`}
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleStatus(index)}
                  >
                    {atendimento.status === 'confirmado'
                      ? 'Pendente'
                      : 'Confirmar'}
                  </Button>
                  <Button
                    data-testid={`atd-cancelar-btn-${index}`}
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelAppointment(index)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atendimento</DialogTitle>
            <DialogDescription>
              Visualize e edite as informações do atendimento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div
              id="atendimento-grid"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div>
                <label className="text-xs" htmlFor="atendimento-nome">
                  Nome
                </label>
                <Input
                  id="atendimento-nome"
                  value={form.nome}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  disabled={editMode === 'view'}
                />
              </div>
              <div>
                <label className="text-xs" htmlFor="atendimento-hora">
                  Hora (HH:MM)
                </label>
                <Input
                  id="atendimento-hora"
                  value={form.hora}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, hora: e.target.value }))
                  }
                  disabled={editMode === 'view'}
                />
              </div>
              <div>
                <label className="text-xs" htmlFor="atendimento-tipo">
                  Tipo
                </label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      tipo: v as Atendimento['tipo'],
                    }))
                  }
                  disabled={editMode === 'view'}
                >
                  <SelectTrigger id="atendimento-tipo">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aconselhamento">
                      Aconselhamento
                    </SelectItem>
                    <SelectItem value="Visitação">Visitação</SelectItem>
                    <SelectItem value="Oração">Oração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs" htmlFor="atendimento-status">
                  Status
                </label>
                <Badge
                  id="atendimento-status"
                  variant={
                    form.status === 'confirmado' ? 'default' : 'secondary'
                  }
                >
                  {form.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editMode === 'edit' ? (
                <>
                  <Button data-testid="modal-salvar-btn" onClick={saveChanges}>
                    Salvar
                  </Button>
                  <DialogClose asChild>
                    <Button
                      data-testid="modal-cancelar-btn"
                      variant="outline"
                      onClick={cancelChanges}
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                </>
              ) : (
                <>
                  <Button
                    data-testid="modal-editar-btn"
                    onClick={() => setEditMode('edit')}
                  >
                    Editar
                  </Button>
                  <DialogClose asChild>
                    <Button data-testid="modal-fechar-btn" variant="outline">
                      Fechar
                    </Button>
                  </DialogClose>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
