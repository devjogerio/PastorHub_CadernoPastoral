import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Search,
  X,
  Calendar,
  Users,
  BookOpen,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface MobileSearchProps {
  onClose: () => void;
}

export function MobileSearch({ onClose }: MobileSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - substituir por dados reais
  const resultados = {
    sermoes: [
      { id: 1, titulo: "Fé que Move Montanhas", texto: "Mateus 17:20", data: "15 Nov", pregado: true },
      { id: 2, titulo: "O Amor de Deus", texto: "João 3:16", data: "22 Nov", pregado: false },
    ],
    atendimentos: [
      { id: 1, nome: "Maria Silva", tipo: "Aconselhamento", data: "Hoje, 14:00" },
      { id: 2, nome: "João Santos", tipo: "Visitação", data: "Amanhã, 10:00" },
    ],
    agenda: [
      { id: 1, titulo: "Palestra Juventude", tipo: "Palestra", data: "25 Nov, 19:00" },
      { id: 2, titulo: "Culto Principal", tipo: "Culto", data: "26 Nov, 19:00" },
    ],
  };

  const filteredResults = {
    sermoes: resultados.sermoes.filter(
      (s) =>
        s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.texto.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    atendimentos: resultados.atendimentos.filter(
      (a) =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    agenda: resultados.agenda.filter(
      (e) =>
        e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  const totalResults =
    filteredResults.sermoes.length +
    filteredResults.atendimentos.length +
    filteredResults.agenda.length;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-[#002645] to-[#3261AB] p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-[#95C121] flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-white/60" />
            <Input
              autoFocus
              placeholder="Buscar sermões, atendimentos, agenda..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-[#95C121]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {searchTerm && (
          <p className="text-sm text-white/80 mt-3">
            {totalResults} resultado{totalResults !== 1 ? "s" : ""} encontrado{totalResults !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto pb-6">
        {!searchTerm ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg mb-2">Busca Global</h3>
            <p className="text-sm text-muted-foreground">
              Procure por sermões, atendimentos, eventos e muito mais
            </p>
          </div>
        ) : totalResults === 0 ? (
          // No results
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg mb-2">Nenhum resultado</h3>
            <p className="text-sm text-muted-foreground">
              Tente usar outras palavras-chave
            </p>
          </div>
        ) : (
          // Results tabs
          <Tabs defaultValue="todos" className="px-4 mt-4">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="todos" className="text-xs">
                Todos ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="sermoes" className="text-xs">
                Sermões ({filteredResults.sermoes.length})
              </TabsTrigger>
              <TabsTrigger value="atendimentos" className="text-xs">
                Atend. ({filteredResults.atendimentos.length})
              </TabsTrigger>
              <TabsTrigger value="agenda" className="text-xs">
                Agenda ({filteredResults.agenda.length})
              </TabsTrigger>
            </TabsList>

            {/* Todos os resultados */}
            <TabsContent value="todos" className="space-y-4 mt-4">
              {/* Sermões */}
              {filteredResults.sermoes.length > 0 && (
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Sermões
                  </h4>
                  <div className="space-y-2">
                    {filteredResults.sermoes.map((sermao) => (
                      <Card key={sermao.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium mb-1">{sermao.titulo}</p>
                              <p className="text-sm text-muted-foreground">{sermao.texto}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={sermao.pregado ? "secondary" : "default"}
                                className="text-xs"
                              >
                                {sermao.pregado ? "Pregado" : "Aguardando"}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Atendimentos */}
              {filteredResults.atendimentos.length > 0 && (
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Atendimentos
                  </h4>
                  <div className="space-y-2">
                    {filteredResults.atendimentos.map((atendimento) => (
                      <Card key={atendimento.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>
                                {atendimento.nome.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{atendimento.nome}</p>
                              <p className="text-sm text-muted-foreground">{atendimento.tipo}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{atendimento.data}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda */}
              {filteredResults.agenda.length > 0 && (
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Agenda
                  </h4>
                  <div className="space-y-2">
                    {filteredResults.agenda.map((evento) => (
                      <Card key={evento.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium mb-1">{evento.titulo}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{evento.data}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {evento.tipo}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Apenas Sermões */}
            <TabsContent value="sermoes" className="space-y-2 mt-4">
              {filteredResults.sermoes.map((sermao) => (
                <Card key={sermao.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium mb-1">{sermao.titulo}</p>
                        <p className="text-sm text-muted-foreground">{sermao.texto}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={sermao.pregado ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {sermao.pregado ? "Pregado" : "Aguardando"}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Apenas Atendimentos */}
            <TabsContent value="atendimentos" className="space-y-2 mt-4">
              {filteredResults.atendimentos.map((atendimento) => (
                <Card key={atendimento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {atendimento.nome.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{atendimento.nome}</p>
                        <p className="text-sm text-muted-foreground">{atendimento.tipo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{atendimento.data}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Apenas Agenda */}
            <TabsContent value="agenda" className="space-y-2 mt-4">
              {filteredResults.agenda.map((evento) => (
                <Card key={evento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium mb-1">{evento.titulo}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{evento.data}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {evento.tipo}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
