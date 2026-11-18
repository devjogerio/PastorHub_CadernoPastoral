import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, Calendar, Users, Video, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

export function Notificacoes() {
  const notificacoes = [
    {
      id: 1,
      tipo: "atendimento",
      titulo: "Atendimento em 30 minutos",
      descricao: "Aconselhamento com Maria Silva às 14:00",
      hora: "13:30",
      lida: false,
      prioridade: "alta",
    },
    {
      id: 2,
      tipo: "agenda",
      titulo: "Novo agendamento solicitado",
      descricao: "João Santos solicitou atendimento para amanhã",
      hora: "12:15",
      lida: false,
      prioridade: "media",
    },
    {
      id: 3,
      tipo: "palestra",
      titulo: "Lembrete: Palestra da Juventude",
      descricao: "Palestra 'Juventude e Propósito' amanhã às 19h",
      hora: "Ontem",
      lida: true,
      prioridade: "media",
    },
    {
      id: 4,
      tipo: "sistema",
      titulo: "Sincronização com Google Calendar",
      descricao: "Última sincronização realizada com sucesso",
      hora: "Ontem",
      lida: true,
      prioridade: "baixa",
    },
    {
      id: 5,
      tipo: "atendimento",
      titulo: "Atendimento concluído",
      descricao: "Pedro Oliveira - feedback disponível",
      hora: "2 dias atrás",
      lida: true,
      prioridade: "baixa",
    },
  ];

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "atendimento":
        return <Users className="w-4 h-4" />;
      case "agenda":
        return <Calendar className="w-4 h-4" />;
      case "palestra":
        return <Video className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "destructive";
      case "media":
        return "default";
      default:
        return "secondary";
    }
  };

  const configuracoes = [
    { id: "atendimentos", label: "Atendimentos próximos", descricao: "30 minutos antes", ativo: true },
    { id: "novos", label: "Novos agendamentos", descricao: "Quando alguém solicitar", ativo: true },
    { id: "palestras", label: "Palestras agendadas", descricao: "1 dia antes", ativo: true },
    { id: "sincronizacao", label: "Sincronização de calendário", descricao: "Diariamente", ativo: false },
    { id: "resumo", label: "Resumo diário", descricao: "Enviar às 8h", ativo: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2>Central de Notificações</h2>
        <p className="text-muted-foreground">Gerencie suas notificações e alertas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notificações Recentes</CardTitle>
                <CardDescription>Suas últimas atualizações</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificacoes.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border rounded-lg ${
                  !notif.lida ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${!notif.lida ? "bg-blue-100 dark:bg-blue-900" : "bg-muted"}`}>
                    {getIcon(notif.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={!notif.lida ? "" : "text-muted-foreground"}>
                        {notif.titulo}
                      </p>
                      <Badge variant={getPrioridadeColor(notif.prioridade)} className="text-xs">
                        {notif.prioridade}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.descricao}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{notif.hora}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Não lidas</span>
                </div>
                <span className="text-lg">
                  {notificacoes.filter((n) => !n.lida).length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Lidas</span>
                </div>
                <span className="text-lg">
                  {notificacoes.filter((n) => n.lida).length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Total</span>
                </div>
                <span className="text-lg">{notificacoes.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Personalize suas notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configuracoes.map((config) => (
                <div key={config.id} className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Label htmlFor={config.id} className="cursor-pointer">
                      {config.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{config.descricao}</p>
                  </div>
                  <Switch id={config.id} defaultChecked={config.ativo} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
