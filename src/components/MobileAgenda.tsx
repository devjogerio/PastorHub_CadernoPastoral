import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Plus, Clock, MapPin, Phone, Video as VideoIcon, ChevronRight } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function MobileAgenda() {
  const [sheetOpen, setSheetOpen] = useState(false);

  const eventos = [
    { id: 1, data: "Hoje, 14:00", titulo: "Maria Silva", tipo: "Aconselhamento", local: "Presencial", cor: "bg-blue-500" },
    { id: 2, data: "Hoje, 16:00", titulo: "João Santos", tipo: "Visitação", local: "Casa", cor: "bg-green-500" },
    { id: 3, data: "Hoje, 18:00", titulo: "Ana Costa", tipo: "Oração", local: "Online", cor: "bg-purple-500" },
    { id: 4, data: "Amanhã, 10:00", titulo: "Palestra Juventude", tipo: "Palestra", local: "Igreja", cor: "bg-orange-500" },
    { id: 5, data: "Amanhã, 19:00", titulo: "Culto Principal", tipo: "Culto", local: "Igreja", cor: "bg-red-500" },
  ];

  const sincronizacoes = [
    { nome: "Google Calendar", status: "Conectado", icone: "🔵" },
    { nome: "Outlook", status: "Desconectado", icone: "🔷" },
    { nome: "Apple Calendar", status: "Desconectado", icone: "🍎" },
  ];

  const stats = [
    { title: "Hoje", value: "3", icon: Calendar, color: "bg-[#002645]" },
    { title: "Semana", value: "12", icon: Clock, color: "bg-[#95C121]" },
    { title: "Online", value: "5", icon: VideoIcon, color: "bg-[#3261AB]" },
    { title: "Presencial", value: "7", icon: MapPin, color: "bg-[#95C121]" },
  ];

  const getLocalIcon = (local: string) => {
    if (local.includes("Online")) return <VideoIcon className="w-4 h-4" />;
    if (local.includes("Casa")) return <MapPin className="w-4 h-4" />;
    if (local.includes("Telefone")) return <Phone className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const handleEventoClick = (titulo: string) => {
    toast(`Detalhes do evento: ${titulo}`);
  };

  const handleSyncClick = (nome: string, status: string) => {
    if (status === "Conectado") {
      toast(`${nome} já está conectado`);
    } else {
      toast(`Conectando com ${nome}...`);
    }
  };

  const handleStatClick = (stat: any) => {
    toast(`${stat.title}: ${stat.value} eventos`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002645] to-[#3261AB] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl">Agenda</h2>
            <p className="text-sm opacity-90">Seus compromissos</p>
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
                <SheetTitle>Novo Compromisso</SheetTitle>
                <SheetDescription>Adicione um evento à sua agenda</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-2">
                  <Label htmlFor="titulo-mobile">Título</Label>
                  <Input id="titulo-mobile" placeholder="Ex: Aconselhamento..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-mobile">Data</Label>
                    <Input id="data-mobile" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora-mobile">Hora</Label>
                    <Input id="hora-mobile" type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo-mobile">Tipo</Label>
                  <Select>
                    <SelectTrigger id="tipo-mobile">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atendimento">Atendimento</SelectItem>
                      <SelectItem value="visitacao">Visitação</SelectItem>
                      <SelectItem value="palestra">Palestra</SelectItem>
                      <SelectItem value="culto">Culto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local-mobile">Local</Label>
                  <Select>
                    <SelectTrigger id="local-mobile">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="visitacao">Visitação</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obs-mobile">Observações</Label>
                  <Textarea id="obs-mobile" placeholder="Detalhes..." rows={3} />
                </div>
              </div>
              <SheetFooter>
                <Button className="w-full" onClick={() => setSheetOpen(false)}>
                  Salvar Compromisso
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-[#95C121]/30">
          <p className="text-sm opacity-90 mb-1">Hoje - Segunda, 8 de Dezembro</p>
          <p className="text-2xl">3 eventos agendados</p>
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

      {/* Tabs */}
      <Tabs defaultValue="eventos" className="px-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="sync">Sincronização</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="space-y-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#002645]">Próximos Eventos</h3>
            <Button variant="ghost" size="sm" className="text-[#3261AB] hover:text-[#95C121]">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {eventos.map((evento) => (
            <Card 
              key={evento.id} 
              className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] border-l-4"
              style={{ borderLeftColor: evento.cor.replace('bg-', '#') }}
              onClick={() => handleEventoClick(evento.titulo)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p>{evento.titulo}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {evento.tipo}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{evento.data}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getLocalIcon(evento.local)}
                        <span>{evento.local}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sync" className="space-y-3 mt-4">
          <h3 className="mb-3 text-[#002645]">Suas Integrações</h3>
          {sincronizacoes.map((sinc, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
              onClick={() => handleSyncClick(sinc.nome, sinc.status)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#002645] to-[#3261AB] rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{sinc.icone}</span>
                    </div>
                    <div>
                      <p>{sinc.nome}</p>
                      <p className="text-sm text-muted-foreground">{sinc.status}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={sinc.status === "Conectado" ? "outline" : "default"}
                    className={sinc.status === "Conectado" ? "border-[#95C121] text-[#95C121]" : "bg-[#95C121] hover:bg-[#95C121]/90"}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleSyncClick(sinc.nome, sinc.status);
                    }}
                  >
                    {sinc.status === "Conectado" ? "Conectado" : "Conectar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
