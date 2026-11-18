import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Sparkles, Download, Copy, RefreshCw, BookOpen } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner@2.0.3";

export function PalestrasIA() {
  const [tema, setTema] = useState("");
  const [duracao, setDuracao] = useState("");
  const [publico, setPublico] = useState("");
  const [conteudoGerado, setConteudoGerado] = useState("");
  const [loading, setLoading] = useState(false);

  const palestrasGeradas = [
    {
      id: 1,
      titulo: "Fé em Tempos Difíceis",
      data: "2025-10-20",
      publico: "Adultos",
      duracao: "30 min",
      topicos: ["Confiança em Deus", "Superação", "Esperança"],
    },
    {
      id: 2,
      titulo: "O Poder da Oração",
      data: "2025-10-15",
      publico: "Geral",
      duracao: "45 min",
      topicos: ["Oração", "Intimidade", "Comunhão"],
    },
    {
      id: 3,
      titulo: "Juventude e Propósito",
      data: "2025-10-10",
      publico: "Jovens",
      duracao: "40 min",
      topicos: ["Propósito", "Chamado", "Identidade"],
    },
  ];

  const handleGerarPalestra = () => {
    setLoading(true);
    // Simular geração de conteúdo por IA
    setTimeout(() => {
      const conteudoMock = `# ${tema || "Palestra Gerada"}

## Introdução (5 min)
- Boas-vindas e oração inicial
- Apresentação do tema e relevância para o público
- Versículo chave: "Tudo posso naquele que me fortalece" - Filipenses 4:13

## Desenvolvimento (${duracao === "30" ? "20" : duracao === "45" ? "30" : "25"} min)

### Ponto 1: Fundamento Bíblico
- Contexto histórico e aplicação atual
- Exemplos práticos da Escritura
- Testemunhos relacionados

### Ponto 2: Aplicação Prática
- Como viver este princípio no dia a dia
- Desafios comuns e soluções
- Ferramentas espirituais disponíveis

### Ponto 3: Transformação Pessoal
- O papel do Espírito Santo
- Passos práticos para mudança
- Compromisso com o crescimento

## Conclusão (5 min)
- Recapitulação dos pontos principais
- Chamado à ação
- Oração final e ministração

## Recursos Adicionais
- Versículos para estudo: Filipenses 4:13, Jeremias 29:11, Romanos 8:28
- Sugestões de leitura complementar
- Perguntas para reflexão em grupo

---
*Gerado por IA Pastoral - Personalize conforme sua necessidade*`;
      
      setConteudoGerado(conteudoMock);
      setLoading(false);
      toast("Palestra gerada com sucesso!");
    }, 2000);
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(conteudoGerado);
    toast("Conteúdo copiado para área de transferência!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Palestras e Ministrações com IA</h2>
        <p className="text-muted-foreground">Crie conteúdo pastoral com auxílio de inteligência artificial</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Gerador de Palestras
            </CardTitle>
            <CardDescription>Preencha os dados para gerar o conteúdo</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gerar">
              <TabsList className="w-full">
                <TabsTrigger value="gerar" className="flex-1">Gerar Novo</TabsTrigger>
                <TabsTrigger value="historico" className="flex-1">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gerar" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="tema">Tema da Palestra</Label>
                  <Input
                    id="tema"
                    placeholder="Ex: Fé em tempos difíceis"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duracao-select">Duração</Label>
                    <Select value={duracao} onValueChange={setDuracao}>
                      <SelectTrigger id="duracao-select">
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
                    <Label htmlFor="publico-select">Público-Alvo</Label>
                    <Select value={publico} onValueChange={setPublico}>
                      <SelectTrigger id="publico-select">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="jovens">Jovens</SelectItem>
                        <SelectItem value="adultos">Adultos</SelectItem>
                        <SelectItem value="criancas">Crianças</SelectItem>
                        <SelectItem value="idosos">Idosos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes-ia">Observações Adicionais (Opcional)</Label>
                  <Textarea
                    id="observacoes-ia"
                    placeholder="Ex: Incluir exemplos práticos, enfatizar esperança..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGerarPalestra}
                  disabled={loading || !tema || !duracao || !publico}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Palestra com IA
                    </>
                  )}
                </Button>

                {conteudoGerado && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Conteúdo Gerado</Label>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleCopiar}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{conteudoGerado}</pre>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="historico" className="mt-4">
                <div className="space-y-3">
                  {palestrasGeradas.map((palestra) => (
                    <div key={palestra.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="flex items-center gap-2">
                            {palestra.titulo}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Gerado em {palestra.data}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <BookOpen className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{palestra.publico}</Badge>
                        <Badge variant="outline">{palestra.duracao}</Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {palestra.topicos.map((topico, idx) => (
                          <Badge key={idx} variant="default" className="text-xs">
                            {topico}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dicas para IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  ✨ Seja específico no tema para melhores resultados
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  📖 Revise e personalize o conteúdo gerado
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  🎯 Adapte ao contexto da sua comunidade
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Biblioteca Bíblica
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                Ilustrações
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
