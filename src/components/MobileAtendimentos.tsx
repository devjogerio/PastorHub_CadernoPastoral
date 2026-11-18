import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Plus, Search, Phone, Video as VideoIcon, MapPin, ChevronRight, Users, Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner@2.0.3";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "./ui/sheet";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function MobileAtendimentos() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const atendimentos = [
    {
      id: 1,
      nome: "Maria Silva",
      data: "Hoje, 14:00",
      tipo: "Aconselhamento",
      status: "Agendado",
      modalidade: "Presencial",
      motivo: "Questões familiares",
    },
    {
      id: 2,
      nome: "João Santos",
      data: "Hoje, 16:00",
      tipo: "Visitação",
      status: "Agendado",
      modalidade: "Visitação",
      motivo: "Acompanhamento pós-cirurgia",
    },
    {
      id: 3,
      nome: "Ana Costa",
      data: "Amanhã, 10:00",
      tipo: "Oração",
      status: "Agendado",
      modalidade: "Online",
      motivo: "Intercessão familiar",
    },
    {
      id: 4,
      nome: "Pedro Oliveira",
      data: "Ontem",
      tipo: "Aconselhamento",
      status: "Concluído",
      modalidade: "Telefone",
      motivo: "Direção espiritual",
    },
    {
      id: 5,
      nome: "Carla Mendes",
      data: "31 Out",
      tipo: "Aconselhamento",
      status: "Agendado",
      modalidade: "Presencial",
      motivo: "Conflitos conjugais",
    },
  ];

  const stats = [
    { title: "Hoje", value: "2", icon: Clock, color: "bg-[#002645]" },
    { title: "Semana", value: "8", icon: Calendar, color: "bg-[#95C121]" },
    { title: "Agendados", value: "4", icon: Users, color: "bg-[#3261AB]" },
    { title: "Concluídos", value: "15", icon: Users, color: "bg-[#95C121]" },
  ];

  const getModalidadeIcon = (modalidade: string) => {
    switch (modalidade) {
      case "Online":
        return <VideoIcon className="w-4 h-4 text-purple-500" />;
      case "Telefone":
        return <Phone className="w-4 h-4 text-blue-500" />;
      default:
        return <MapPin className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Agendado" ? "default" : "secondary";
  };

  const filteredAtendimentos = atendimentos.filter((atendimento) =>
    atendimento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atendimento.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAtendimentoClick = (nome: string) => {
    toast(`Detalhes de ${nome}`);
  };

  const handleStatClick = (stat: any) => {
    toast(`${stat.title}: ${stat.value} atendimentos`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002645] to-[#3261AB] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl">Atendimentos</h2>
            <p className="text-sm opacity-90">Gestão pastoral</p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="bg-[#95C121] hover:bg-[#95C121]/90 text-white border-none">
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader>
                <SheetTitle>Novo Atendimento</SheetTitle>
                <SheetDescription>Registre um atendimento pastoral</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-2">
                  <Label htmlFor="nome-atend">Nome da Pessoa</Label>
                  <Input id="nome-atend" placeholder="Digite o nome..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-atend-mobile">Data</Label>
                    <Input id="data-atend-mobile" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora-atend-mobile">Hora</Label>
                    <Input id="hora-atend-mobile" type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo-atend-mobile">Tipo</Label>
                  <Select>
                    <SelectTrigger id="tipo-atend-mobile">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aconselhamento">Aconselhamento</SelectItem>
                      <SelectItem value="visitacao">Visitação</SelectItem>
                      <SelectItem value="oracao">Oração</SelectItem>
                      <SelectItem value="discipulado">Discipulado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modalidade-mobile">Modalidade</Label>
                  <Select>
                    <SelectTrigger id="modalidade-mobile">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="visitacao">Visitação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivo-mobile">Motivo</Label>
                  <Input id="motivo-mobile" placeholder="Breve descrição..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obs-atend-mobile">Observações</Label>
                  <Textarea id="obs-atend-mobile" placeholder="Anotações..." rows={4} />
                </div>
              </div>
              <SheetFooter>
                <Button className="w-full" onClick={() => setSheetOpen(false)}>
                  Salvar Atendimento
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-[#95C121]/30">
          <p className="text-sm opacity-90 mb-1">Hoje - Segunda, 8 de Dezembro</p>
          <p className="text-2xl">2 atendimentos agendados</p>
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

      {/* Search */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atendimentos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos" className="px-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="agendados">Agendados</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#002645]">Todos os Atendimentos</h3>
            <Button variant="ghost" size="sm" className="text-[#3261AB] hover:text-[#95C121]">
              Filtros
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {filteredAtendimentos.map((atendimento) => (
            <Card 
              key={atendimento.id}
              className="hover:shadow-md transition-shadow border-l-4 border-l-[#95C121] cursor-pointer active:scale-[0.98]"
              onClick={() => handleAtendimentoClick(atendimento.nome)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-12 h-12 border-2 border-[#002645]/10">
                    <AvatarFallback className="bg-[#002645] text-white">
                      {atendimento.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p>{atendimento.nome}</p>
                        <p className="text-sm text-muted-foreground">{atendimento.data}</p>
                      </div>
                      <Badge variant={getStatusColor(atendimento.status)} className="text-xs bg-[#95C121]/10 text-[#95C121] border-[#95C121]/20">
                        {atendimento.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {atendimento.tipo}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getModalidadeIcon(atendimento.modalidade)}
                        <span className="text-xs text-muted-foreground">{atendimento.modalidade}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 truncate">
                      {atendimento.motivo}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="agendados" className="space-y-3 mt-4">
          <h3 className="mb-3 text-[#002645]">Próximos Atendimentos</h3>
          {filteredAtendimentos
            .filter((a) => a.status === "Agendado")
            .map((atendimento) => (
              <Card 
                key={atendimento.id}
                className="hover:shadow-md transition-shadow border-l-4 border-l-[#95C121] cursor-pointer active:scale-[0.98]"
                onClick={() => handleAtendimentoClick(atendimento.nome)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-12 h-12 border-2 border-[#002645]/10">
                      <AvatarFallback className="bg-[#002645] text-white">
                        {atendimento.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p>{atendimento.nome}</p>
                      <p className="text-sm text-muted-foreground">{atendimento.data}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {atendimento.tipo}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getModalidadeIcon(atendimento.modalidade)}
                          <span className="text-xs text-muted-foreground">{atendimento.modalidade}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="concluidos" className="space-y-3 mt-4">
          <h3 className="mb-3 text-[#002645]">Histórico de Atendimentos</h3>
          {filteredAtendimentos
            .filter((a) => a.status === "Concluído")
            .map((atendimento) => (
              <Card 
                key={atendimento.id}
                className="hover:shadow-md transition-shadow border-l-4 border-l-gray-300 cursor-pointer active:scale-[0.98]"
                onClick={() => handleAtendimentoClick(atendimento.nome)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-12 h-12 border-2 border-gray-200">
                      <AvatarFallback className="bg-gray-400 text-white">
                        {atendimento.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground">{atendimento.nome}</p>
                      <p className="text-sm text-muted-foreground">{atendimento.data}</p>
                      <Badge variant="outline" className="text-xs mt-2">
                        {atendimento.tipo}
                      </Badge>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}