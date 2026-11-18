import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Plus, Video, ExternalLink, Search, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function VideosLinks() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const videos = [
    {
      id: 1,
      titulo: "Como Lidar com a Ansiedade",
      url: "https://youtube.com/watch?v=example1",
      categoria: "Aconselhamento",
      tags: ["Ansiedade", "Saúde Mental", "Paz"],
      visualizacoes: 1250,
      dataAdicionado: "2025-10-15",
    },
    {
      id: 2,
      titulo: "Casamento e Família na Bíblia",
      url: "https://youtube.com/watch?v=example2",
      categoria: "Família",
      tags: ["Casamento", "Família", "Relacionamentos"],
      visualizacoes: 890,
      dataAdicionado: "2025-10-12",
    },
    {
      id: 3,
      titulo: "Juventude com Propósito",
      url: "https://youtube.com/watch?v=example3",
      categoria: "Jovens",
      tags: ["Juventude", "Propósito", "Vocação"],
      visualizacoes: 2100,
      dataAdicionado: "2025-10-08",
    },
    {
      id: 4,
      titulo: "Oração que Transforma",
      url: "https://youtube.com/watch?v=example4",
      categoria: "Espiritualidade",
      tags: ["Oração", "Intimidade", "Poder"],
      visualizacoes: 1670,
      dataAdicionado: "2025-10-05",
    },
    {
      id: 5,
      titulo: "Finanças na Perspectiva Bíblica",
      url: "https://youtube.com/watch?v=example5",
      categoria: "Vida Prática",
      tags: ["Finanças", "Mordomia", "Prosperidade"],
      visualizacoes: 1340,
      dataAdicionado: "2025-10-01",
    },
  ];

  const categorias = ["Todos", "Aconselhamento", "Família", "Jovens", "Espiritualidade", "Vida Prática"];

  const filteredVideos = videos.filter((video) =>
    video.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Biblioteca de Vídeos</h2>
          <p className="text-muted-foreground">Recursos em vídeo para apoio pastoral</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Vídeo</DialogTitle>
              <DialogDescription>Adicione um link de vídeo à sua biblioteca</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo-video">Título do Vídeo</Label>
                <Input id="titulo-video" placeholder="Ex: Como vencer a depressão" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url-video">URL do Vídeo</Label>
                <Input id="url-video" type="url" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria-video">Categoria</Label>
                <Select>
                  <SelectTrigger id="categoria-video">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aconselhamento">Aconselhamento</SelectItem>
                    <SelectItem value="familia">Família</SelectItem>
                    <SelectItem value="jovens">Jovens</SelectItem>
                    <SelectItem value="espiritualidade">Espiritualidade</SelectItem>
                    <SelectItem value="vida-pratica">Vida Prática</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags-video">Tags (separadas por vírgula)</Label>
                <Input id="tags-video" placeholder="Ex: ansiedade, paz, saúde mental" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vídeos Disponíveis</CardTitle>
              <CardDescription>Organize e compartilhe recursos em vídeo</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vídeos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Todos">
            <TabsList className="w-full justify-start overflow-x-auto">
              {categorias.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categorias.map((categoria) => (
              <TabsContent key={categoria} value={categoria} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos
                    .filter((v) => categoria === "Todos" || v.categoria === categoria)
                    .map((video) => (
                      <Card key={video.id} className="overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Video className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{video.titulo}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {video.categoria}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {video.visualizacoes} views
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex gap-1 flex-wrap">
                            {video.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <ExternalLink className="w-3 h-3 mr-2" />
                              Abrir
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total de Vídeos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{videos.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Na biblioteca</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{categorias.length - 1}</p>
            <p className="text-sm text-muted-foreground mt-1">Organizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mais Visto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{videos.sort((a, b) => b.visualizacoes - a.visualizacoes)[0].titulo}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {videos.sort((a, b) => b.visualizacoes - a.visualizacoes)[0].visualizacoes} visualizações
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
