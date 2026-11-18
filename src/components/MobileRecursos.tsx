import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Sparkles, Video, BookOpen, Download, Copy, Plus, ExternalLink, ChevronRight, Calendar, Users } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner@2.0.3";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "./ui/sheet";

export function MobileRecursos() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [palestrasSheet, setPalestrasSheet] = useState(false);

  const videos = [
    {
      id: 1,
      titulo: "Como Lidar com a Ansiedade",
      categoria: "Aconselhamento",
      visualizacoes: 1250,
    },
    {
      id: 2,
      titulo: "Casamento e Família",
      categoria: "Família",
      visualizacoes: 890,
    },
    {
      id: 3,
      titulo: "Juventude com Propósito",
      categoria: "Jovens",
      visualizacoes: 2100,
    },
  ];

  const palestras = [
    {
      id: 1,
      titulo: "Fé em Tempos Difíceis",
      publico: "Adultos",
      duracao: "30 min",
    },
    {
      id: 2,
      titulo: "O Poder da Oração",
      publico: "Geral",
      duracao: "45 min",
    },
    {
      id: 3,
      titulo: "Juventude e Propósito",
      publico: "Jovens",
      duracao: "40 min",
    },
  ];

  const stats = [
    { title: "Palestras", value: palestras.length.toString(), icon: Sparkles, color: "bg-[#002645]" },
    { title: "Vídeos", value: videos.length.toString(), icon: Video, color: "bg-[#95C121]" },
    { title: "Views", value: "4.2K", icon: Users, color: "bg-[#3261AB]" },
    { title: "Salvos", value: "12", icon: BookOpen, color: "bg-[#95C121]" },
  ];

  const handleGerarPalestra = () => {
    toast("Palestra gerada com sucesso!");
    setPalestrasSheet(false);
  };

  const handlePalestraClick = (titulo: string) => {
    toast(`Abrindo: ${titulo}`);
  };

  const handleVideoClick = (titulo: string) => {
    toast(`Reproduzindo: ${titulo}`);
  };

  const handleStatClick = (stat: any) => {
    toast(`${stat.title}: ${stat.value}`);
  };

  const handleActionClick = (action: string) => {
    toast(`Abrindo ${action}...`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002645] to-[#3261AB] text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl">Recursos Pastorais</h2>
            <p className="text-sm opacity-90">Palestras, vídeos e materiais</p>
          </div>
          <Avatar className="w-14 h-14 border-3 border-[#95C121] shadow-lg">
            <AvatarFallback className="bg-[#95C121] text-white text-lg">
              <BookOpen className="w-7 h-7" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-[#95C121]/30">
          <p className="text-sm opacity-90 mb-1">Biblioteca Digital</p>
          <p className="text-2xl">{palestras.length + videos.length} recursos disponíveis</p>
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

      {/* Quick Actions */}
      <div className="px-4">
        <h3 className="mb-3 text-[#002645]">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <Sheet open={palestrasSheet} onOpenChange={setPalestrasSheet}>
            <SheetTrigger asChild>
              <Button className="h-20 flex-col gap-2 bg-white hover:bg-[#95C121] hover:text-white border-2 border-border hover:border-[#95C121] transition-all shadow-sm" variant="outline">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs">Gerar Palestra IA</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Gerar Palestra com IA
                </SheetTitle>
                <SheetDescription>Crie conteúdo pastoral personalizado</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-2">
                  <Label htmlFor="tema-ia">Tema da Palestra</Label>
                  <Input id="tema-ia" placeholder="Ex: Fé em tempos difíceis" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duracao-ia">Duração</Label>
                    <Select>
                      <SelectTrigger id="duracao-ia">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publico-ia">Público</Label>
                    <Select>
                      <SelectTrigger id="publico-ia">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="jovens">Jovens</SelectItem>
                        <SelectItem value="adultos">Adultos</SelectItem>
                        <SelectItem value="idosos">Idosos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obs-ia">Observações</Label>
                  <Textarea
                    id="obs-ia"
                    placeholder="Ex: Incluir exemplos práticos..."
                    rows={3}
                  />
                </div>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm">💡 Dicas</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Seja específico no tema</li>
                    <li>• Revise e personalize o conteúdo</li>
                    <li>• Adapte ao seu contexto</li>
                  </ul>
                </div>
              </div>
              <SheetFooter>
                <Button className="w-full" onClick={handleGerarPalestra}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Palestra
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="h-20 flex-col gap-2 bg-white hover:bg-[#95C121] hover:text-white border-2 border-border hover:border-[#95C121] transition-all shadow-sm" variant="outline">
                <Video className="w-5 h-5" />
                <span className="text-xs">Adicionar Vídeo</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Adicionar Vídeo</SheetTitle>
                <SheetDescription>Adicione um link de vídeo à biblioteca</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo-video-mobile">Título</Label>
                  <Input id="titulo-video-mobile" placeholder="Título do vídeo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url-video-mobile">URL</Label>
                  <Input id="url-video-mobile" type="url" placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria-video-mobile">Categoria</Label>
                  <Select>
                    <SelectTrigger id="categoria-video-mobile">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aconselhamento">Aconselhamento</SelectItem>
                      <SelectItem value="familia">Família</SelectItem>
                      <SelectItem value="jovens">Jovens</SelectItem>
                      <SelectItem value="espiritualidade">Espiritualidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags-video-mobile">Tags</Label>
                  <Input id="tags-video-mobile" placeholder="Ex: ansiedade, paz" />
                </div>
              </div>
              <SheetFooter>
                <Button className="w-full" onClick={() => setSheetOpen(false)}>
                  Adicionar à Biblioteca
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="palestras" className="px-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="palestras">Palestras IA</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
        </TabsList>

        <TabsContent value="palestras" className="space-y-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#002645]">Minhas Palestras</h3>
            <Button variant="ghost" size="sm" className="text-[#3261AB] hover:text-[#95C121]">
              Ver todas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {palestras.map((palestra) => (
            <Card 
              key={palestra.id}
              className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500 cursor-pointer active:scale-[0.98]"
              onClick={() => handlePalestraClick(palestra.titulo)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p>{palestra.titulo}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs bg-[#95C121]/10 text-[#95C121] border-[#95C121]/20">
                        {palestra.publico}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {palestra.duracao}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="videos" className="space-y-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#002645]">Biblioteca de Vídeos</h3>
            <Button variant="ghost" size="sm" className="text-[#3261AB] hover:text-[#95C121]">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {videos.map((video) => (
            <Card 
              key={video.id}
              className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 cursor-pointer active:scale-[0.98]"
              onClick={() => handleVideoClick(video.titulo)}
            >
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center rounded-t-lg">
                  <Video className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="p-4">
                  <p>{video.titulo}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs bg-[#95C121]/10 text-[#95C121] border-[#95C121]/20">
                      {video.categoria}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {video.visualizacoes} views
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}