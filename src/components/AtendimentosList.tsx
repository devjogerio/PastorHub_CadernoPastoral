import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Plus, Search, FileText, Phone, Video as VideoIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
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
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function AtendimentosList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const atendimentos = [
    {
      id: 1,
      nome: "Maria Silva",
      data: "2025-10-29",
      tipo: "Aconselhamento",
      status: "Agendado",
      modalidade: "Presencial",
      motivo: "Questões familiares",
    },
    {
      id: 2,
      nome: "João Santos",
      data: "2025-10-29",
      tipo: "Visitação",
      status: "Concluído",
      modalidade: "Visitação",
      motivo: "Acompanhamento",
    },
    {
      id: 3,
      nome: "Ana Costa",
      data: "2025-10-30",
      tipo: "Oração",
      status: "Agendado",
      modalidade: "Online",
      motivo: "Intercessão",
    },
    {
      id: 4,
      nome: "Pedro Oliveira",
      data: "2025-10-28",
      tipo: "Aconselhamento",
      status: "Concluído",
      modalidade: "Telefone",
      motivo: "Direção espiritual",
    },
    {
      id: 5,
      nome: "Carla Mendes",
      data: "2025-10-31",
      tipo: "Aconselhamento",
      status: "Agendado",
      modalidade: "Presencial",
      motivo: "Conflitos conjugais",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado":
        return "default";
      case "Concluído":
        return "secondary";
      case "Cancelado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getModalidadeIcon = (modalidade: string) => {
    switch (modalidade) {
      case "Online":
        return <VideoIcon className="w-4 h-4" />;
      case "Telefone":
        return <Phone className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredAtendimentos = atendimentos.filter((atendimento) =>
    atendimento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atendimento.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Atendimentos Pastorais</h2>
          <p className="text-muted-foreground">Gerencie seus atendimentos e acompanhamentos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Atendimento Pastoral</DialogTitle>
              <DialogDescription>Registre um novo atendimento</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Pessoa</Label>
                <Input id="nome" placeholder="Digite o nome..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data-atend">Data</Label>
                  <Input id="data-atend" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora-atend">Hora</Label>
                  <Input id="hora-atend" type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo-atend">Tipo</Label>
                  <Select>
                    <SelectTrigger id="tipo-atend">
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
                  <Label htmlFor="modalidade">Modalidade</Label>
                  <Select>
                    <SelectTrigger id="modalidade">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo/Assunto</Label>
                <Input id="motivo" placeholder="Breve descrição do motivo..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" placeholder="Anotações adicionais..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Salvar Atendimento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Atendimentos</CardTitle>
              <CardDescription>Histórico e atendimentos agendados</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atendimentos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="agendados">Agendados</TabsTrigger>
              <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
            </TabsList>
            <TabsContent value="todos" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAtendimentos.map((atendimento) => (
                    <TableRow key={atendimento.id}>
                      <TableCell>{atendimento.nome}</TableCell>
                      <TableCell>{atendimento.data}</TableCell>
                      <TableCell>{atendimento.tipo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getModalidadeIcon(atendimento.modalidade)}
                          <span className="text-sm">{atendimento.modalidade}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{atendimento.motivo}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(atendimento.status)}>
                          {atendimento.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="agendados" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAtendimentos
                    .filter((a) => a.status === "Agendado")
                    .map((atendimento) => (
                      <TableRow key={atendimento.id}>
                        <TableCell>{atendimento.nome}</TableCell>
                        <TableCell>{atendimento.data}</TableCell>
                        <TableCell>{atendimento.tipo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getModalidadeIcon(atendimento.modalidade)}
                            <span className="text-sm">{atendimento.modalidade}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{atendimento.motivo}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Ver</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="concluidos" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAtendimentos
                    .filter((a) => a.status === "Concluído")
                    .map((atendimento) => (
                      <TableRow key={atendimento.id}>
                        <TableCell>{atendimento.nome}</TableCell>
                        <TableCell>{atendimento.data}</TableCell>
                        <TableCell>{atendimento.tipo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getModalidadeIcon(atendimento.modalidade)}
                            <span className="text-sm">{atendimento.modalidade}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{atendimento.motivo}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Ver</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
