import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar as CalendarIcon, Plus, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function AgendaCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  const agendamentos = [
    { id: 1, data: "2025-10-29", hora: "14:00", titulo: "Aconselhamento - Maria Silva", tipo: "Atendimento" },
    { id: 2, data: "2025-10-29", hora: "16:00", titulo: "Visitação - João Santos", tipo: "Visitação" },
    { id: 3, data: "2025-10-30", hora: "10:00", titulo: "Palestra - Juventude", tipo: "Palestra" },
    { id: 4, data: "2025-10-31", hora: "19:00", titulo: "Culto Principal", tipo: "Culto" },
  ];

  const sincronizacoes = [
    { nome: "Google Calendar", status: "conectado", icone: "🔵" },
    { nome: "Microsoft Outlook", status: "desconectado", icone: "🔷" },
    { nome: "Apple Calendar", status: "desconectado", icone: "🍎" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Agenda e Calendário</h2>
          <p className="text-muted-foreground">Gerencie seus compromissos pastorais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Compromisso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Compromisso</DialogTitle>
              <DialogDescription>Adicione um novo evento à sua agenda</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" placeholder="Ex: Aconselhamento com..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input id="hora" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="visitacao">Visitação</SelectItem>
                    <SelectItem value="palestra">Palestra</SelectItem>
                    <SelectItem value="culto">Culto</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" placeholder="Detalhes do compromisso..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Visualize seus compromissos mensais</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sincronização</CardTitle>
              <CardDescription>Conecte seus calendários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sincronizacoes.map((sinc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sinc.icone}</span>
                    <div>
                      <p className="text-sm">{sinc.nome}</p>
                      <p className="text-xs text-muted-foreground">{sinc.status}</p>
                    </div>
                  </div>
                  <Button size="sm" variant={sinc.status === "conectado" ? "outline" : "default"}>
                    <LinkIcon className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agendamentos.slice(0, 4).map((evento) => (
                <div key={evento.id} className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-start justify-between">
                    <p className="text-sm">{evento.titulo}</p>
                    <Badge variant="outline" className="text-xs">{evento.tipo}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{evento.data} às {evento.hora}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
