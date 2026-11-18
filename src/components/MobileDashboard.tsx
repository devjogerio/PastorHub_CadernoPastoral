import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Users, Video, Bell, Plus, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner@2.0.3";

export function MobileDashboard() {
  const stats = [
    { title: "Hoje", value: "3", icon: Users, color: "bg-[#002645]" },
    { title: "Semana", value: "12", icon: Calendar, color: "bg-[#95C121]" },
    { title: "Palestras", value: "5", icon: Video, color: "bg-[#3261AB]" },
    { title: "Alertas", value: "2", icon: Bell, color: "bg-[#95C121]" },
  ];

  const proximosAtendimentos = [
    { nome: "Maria Silva", hora: "14:00", tipo: "Aconselhamento", status: "Em 30min" },
    { nome: "João Santos", hora: "16:00", tipo: "Visitação", status: "Em 2h" },
    { nome: "Ana Costa", hora: "18:00", tipo: "Oração", status: "Hoje" },
  ];

  const handleStatClick = (stat: any) => {
    toast(`Visualizando ${stat.title}: ${stat.value} itens`);
  };

  const handleActionClick = (action: string) => {
    toast(`Abrindo ${action}...`);
  };

  const handleAtendimentoClick = (nome: string) => {
    toast(`Detalhes de ${nome}`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002645] to-[#3261AB] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Bem-vindo,</p>
            <h2 className="text-2xl">Pastor Silva</h2>
          </div>
          <Avatar className="w-14 h-14 border-3 border-[#95C121] shadow-lg">
            <AvatarFallback className="bg-[#95C121] text-white text-lg">PS</AvatarFallback>
          </Avatar>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-[#95C121]/30">
          <p className="text-sm opacity-90 mb-1">Hoje - Segunda, 8 de Dezembro</p>
          <p className="text-2xl">3 atendimentos agendados</p>
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

      {/* Ações Rápidas */}
      <div className="px-4">
        <h3 className="mb-3 text-[#002645]">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => handleActionClick("Novo Agendamento")}
            className="h-20 flex-col gap-2 bg-white hover:bg-[#95C121] hover:text-white border-2 border-border hover:border-[#95C121] transition-all shadow-sm" 
            variant="outline"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Novo Agendamento</span>
          </Button>
          <Button 
            onClick={() => handleActionClick("Atendimento")}
            className="h-20 flex-col gap-2 bg-white hover:bg-[#95C121] hover:text-white border-2 border-border hover:border-[#95C121] transition-all shadow-sm" 
            variant="outline"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Atendimento</span>
          </Button>
          <Button 
            onClick={() => handleActionClick("Sermão IA")}
            className="h-20 flex-col gap-2 bg-white hover:bg-[#95C121] hover:text-white border-2 border-border hover:border-[#95C121] transition-all shadow-sm" 
            variant="outline"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">Sermão IA</span>
          </Button>
          <Button 
            onClick={() => handleActionClick("Biblioteca")}
            className="h-20 flex-col gap-2 bg-white hover:bg-[#95C121] hover:text-white border-2 border-border hover:border-[#95C121] transition-all shadow-sm" 
            variant="outline"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Biblioteca</span>
          </Button>
        </div>
      </div>

      {/* Próximos Atendimentos */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[#002645]">Próximos Atendimentos</h3>
          <Button variant="ghost" size="sm" className="text-[#3261AB] hover:text-[#95C121]">
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-3">
          {proximosAtendimentos.map((atendimento, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow border-l-4 border-l-[#95C121] cursor-pointer active:scale-[0.98]"
              onClick={() => handleAtendimentoClick(atendimento.nome)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-[#002645]/10">
                      <AvatarFallback className="bg-[#002645] text-white">{atendimento.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{atendimento.nome}</p>
                      <p className="text-sm text-muted-foreground">{atendimento.tipo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#002645]">{atendimento.hora}</p>
                    <Badge variant="secondary" className="text-xs mt-1 bg-[#95C121]/10 text-[#95C121] border-[#95C121]/20">
                      {atendimento.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}