import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, Calendar, Users, Video, CheckCircle2, Settings as SettingsIcon, ChevronRight, Clock } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner@2.0.3";

export function MobileNotificacoes() {
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
      titulo: "Novo agendamento",
      descricao: "João Santos solicitou atendimento",
      hora: "12:15",
      lida: false,
      prioridade: "media",
    },
    {
      id: 3,
      tipo: "palestra",
      titulo: "Lembrete: Palestra da Juventude",
      descricao: "Palestra amanhã às 19h",
      hora: "Ontem",
      lida: true,
      prioridade: "media",
    },
    {
      id: 4,
      tipo: "sistema",
      titulo: "Sincronização realizada",
      descricao: "Google Calendar atualizado",
      hora: "Ontem",
      lida: true,
      prioridade: "baixa",
    },
  ];

  const configuracoes = [
    { id: "atendimentos", label: "Atendimentos próximos", descricao: "30 min antes", ativo: true },
    { id: "novos", label: "Novos agendamentos", descricao: "Instantâneo", ativo: true },
    { id: "palestras", label: "Palestras agendadas", descricao: "1 dia antes", ativo: true },
    { id: "sincronizacao", label: "Sincronização", descricao: "Diariamente", ativo: false },
    { id: "resumo", label: "Resumo diário", descricao: "8h da manhã", ativo: true },
  ];

  const stats = [
    { title: "Não Lidas", value: notificacoes.filter(n => !n.lida).length.toString(), icon: Bell, color: "bg-[#002645]" },
    { title: "Hoje", value: "2", icon: Clock, color: "bg-[#95C121]" },
    { title: "Alta", value: "1", icon: Bell, color: "bg-red-500" },
    { title: "Total", value: notificacoes.length.toString(), icon: CheckCircle2, color: "bg-[#3261AB]" },
  ];

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "atendimento":
        return <Users className="w-5 h-5" />;
      case "agenda":
        return <Calendar className="w-5 h-5" />;
      case "palestra":
        return <Video className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
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

  const handleNotificacaoClick = (titulo: string) => {
    toast(`Detalhes: ${titulo}`);
  };

  const handleMarcarTodas = () => {
    toast("Todas as notificações marcadas como lidas");
  };

  const handleStatClick = (stat: any) => {
    toast(`${stat.title}: ${stat.value} notificações`);
  };

  const handleConfigClick = (label: string) => {
    toast(`Configuração: ${label}`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002645] to-[#3261AB] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl">Notificações</h2>
            <p className="text-sm opacity-90">
              {notificacoes.filter(n => !n.lida).length} não lidas
            </p>
          </div>
          <Avatar className="w-14 h-14 border-3 border-[#95C121] shadow-lg">
            <AvatarFallback className="bg-[#95C121] text-white text-lg">
              <Bell className="w-7 h-7" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-[#95C121]/30">
          <p className="text-sm opacity-90 mb-1">Central de Avisos</p>
          <p className="text-2xl">{notificacoes.length} notificações totais</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <button 
              key={index} 
              className="text-center active:scale-95 transition-transform"
              onClick={() => handleStatClick(stat)}
            >
              <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-lg">{stat.value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{stat.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-4">
        <Button 
          variant="outline" 
          className="w-full border-2 border-border hover:bg-[#95C121] hover:text-white hover:border-[#95C121]"
          onClick={handleMarcarTodas}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Marcar todas como lidas
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recentes" className="px-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="recentes">Recentes</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="recentes" className="space-y-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#002645]">Notificações Recentes</h3>
            <Button variant="ghost" size="sm" className="text-[#3261AB] hover:text-[#95C121]">
              Filtrar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {notificacoes.map((notif) => (
            <Card
              key={notif.id}
              className={`hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] ${
                !notif.lida ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 border-l-4 border-l-[#95C121]" : "border-l-4 border-l-gray-300"
              }`}
              onClick={() => handleNotificacaoClick(notif.titulo)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    !notif.lida
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {getIcon(notif.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={!notif.lida ? "" : "text-muted-foreground"}>
                        {notif.titulo}
                      </p>
                      <Badge variant={getPrioridadeColor(notif.prioridade)} className="text-xs flex-shrink-0">
                        {notif.prioridade}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notif.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground">{notif.hora}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {notificacoes.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-4 mt-4">
          <h3 className="mb-3 text-[#002645]">Preferências de Notificação</h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              {configuracoes.map((config) => (
                <div 
                  key={config.id} 
                  className="flex items-start justify-between gap-3 pb-4 border-b last:border-b-0 last:pb-0 cursor-pointer"
                  onClick={() => handleConfigClick(config.label)}
                >
                  <div className="flex-1">
                    <Label htmlFor={`mobile-${config.id}`} className="cursor-pointer">
                      {config.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{config.descricao}</p>
                  </div>
                  <Switch 
                    id={`mobile-${config.id}`} 
                    defaultChecked={config.ativo}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <h3 className="mb-3 text-[#002645] pt-2">Configurações Avançadas</h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-[#95C121] hover:text-white" 
                  size="sm"
                  onClick={() => toast("Abrindo configurações de som...")}
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Som das notificações
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-[#95C121] hover:text-white" 
                  size="sm"
                  onClick={() => toast("Configurando horário silencioso...")}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Horário silencioso
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-[#95C121] hover:text-white" 
                  size="sm"
                  onClick={() => toast("Configurando notificações por e-mail...")}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notificações por e-mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}