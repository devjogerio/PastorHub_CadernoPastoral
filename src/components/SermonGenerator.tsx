import { useState } from "react";
import { Button } from "./ui/button";
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
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "./ui/sheet";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { Sermon } from "../types";

interface SermonGeneratorProps {
  onSermonCreated: (sermon: Sermon) => void;
  onCancel: () => void;
}

export function SermonGenerator({ onSermonCreated, onCancel }: SermonGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    texto_biblico: "",
    tema: "",
    publico_alvo: "",
    tipo_sermao: "",
    tom: "",
    observacoes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSermonWithAI = async () => {
    // Validação
    if (!formData.texto_biblico || !formData.tema || !formData.publico_alvo || !formData.tipo_sermao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      // System prompt otimizado para sermões
      const systemPrompt = `Você é um assistente teológico sábio e experiente, especializado em hermenêutica bíblica e homilética reformada. 
Sua tarefa é criar esboços de sermões estruturados, fiéis às escrituras, biblicamente sólidos e inspiradores.
Use linguagem pastoral acessível, mas teologicamente profunda.`;

      // User prompt personalizado
      const userPrompt = `Crie um esboço completo de sermão ${formData.tipo_sermao} baseado em ${formData.texto_biblico} com o tema "${formData.tema}".

Público-alvo: ${formData.publico_alvo}
Tom desejado: ${formData.tom || "encorajador e pastoral"}
${formData.observacoes ? `Observações especiais: ${formData.observacoes}` : ""}

Estruture o sermão da seguinte forma:

**TÍTULO**: Crie um título impactante e relevante

**TEXTO BÍBLICO**: ${formData.texto_biblico}

**INTRODUÇÃO**:
- Comece com uma ilustração contemporânea ou histórica relevante
- Contextualize o texto bíblico (autor, audiência, contexto histórico)
- Apresente o tema central de forma clara

**DESENVOLVIMENTO** (3 pontos principais):

**I. [Primeiro Ponto Principal]**
   - Exposição do texto bíblico
   - Referências cruzadas relevantes
   - Aplicação prática
   - Ilustração contextualizada

**II. [Segundo Ponto Principal]**
   - Exposição do texto bíblico
   - Referências cruzadas relevantes
   - Aplicação prática
   - Ilustração contextualizada

**III. [Terceiro Ponto Principal]**
   - Exposição do texto bíblico
   - Referências cruzadas relevantes
   - Aplicação prática
   - Ilustração contextualizada

**CONCLUSÃO**:
- Recapitule os pontos principais
- Faça um apelo prático e transformador
- Termine com esperança e encorajamento

**REFERÊNCIAS BÍBLICAS ADICIONAIS**:
Liste 5-7 textos relacionados para aprofundamento

Use formatação HTML simples (h2, h3, p, strong, em, ul, li) para estruturar o conteúdo.`;

      // NOTA: Para integração real com OpenAI, você precisará:
      // 1. Configurar a API Key no backend (Supabase Edge Functions ou similar)
      // 2. Fazer a chamada para o backend que então chamará a OpenAI
      // 3. Nunca expor a API Key no frontend
      
      // Simulação de chamada à API (substituir por chamada real)
      const response = await simulateOpenAICall(systemPrompt, userPrompt);

      // Criar objeto do sermão
      const newSermon: Sermon = {
        id: Date.now().toString(),
        titulo: formData.titulo || extractTitleFromResponse(response),
        texto_biblico: formData.texto_biblico,
        tema: formData.tema,
        publico_alvo: formData.publico_alvo,
        tipo_sermao: formData.tipo_sermao,
        conteudo_html: response,
        conteudo_plain: stripHtml(response),
        tags: generateTags(formData.tema, formData.texto_biblico),
        data_criacao: new Date().toISOString().split('T')[0],
        data_pregado: null,
        status_pregado: false,
        local_pregado: "",
      };

      onSermonCreated(newSermon);
      toast.success("Sermão gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar sermão:", error);
      toast.error("Erro ao gerar sermão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para simular chamada à OpenAI (SUBSTITUIR por chamada real)
  const simulateOpenAICall = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Retorna um sermão de exemplo formatado
    return `<h2>A Fé Que Transforma Montanhas</h2>

<p><strong>Texto Bíblico:</strong> ${formData.texto_biblico}</p>

<h3>Introdução</h3>
<p>Em uma época marcada por incertezas e desafios aparentemente intransponíveis, Jesus nos convida a uma jornada de fé extraordinária. O texto de hoje nos revela não apenas o poder da fé, mas sua natureza transformadora que pode literalmente mover montanhas em nossas vidas.</p>

<p>No contexto bíblico, Jesus havia acabado de amaldiçoar uma figueira, demonstrando seu poder sobre a criação. Os discípulos, admirados, questionaram como aquilo aconteceu. A resposta de Jesus vai muito além do milagre observado - Ele nos ensina sobre o princípio fundamental da fé que opera maravilhas.</p>

<h3>I. A Natureza da Fé Genuína</h3>
<p>A fé bíblica não é um sentimento vago ou esperança ingênua. É uma confiança sólida, fundamentada no caráter e nas promessas de Deus. Jesus nos ensina que a fé genuína tem características específicas:</p>

<ul>
<li><strong>É direcionada a Deus:</strong> "Tende fé em Deus" - não em nós mesmos ou em circunstâncias</li>
<li><strong>É ativa e declarativa:</strong> "Diga a este monte" - a fé se expressa em palavras e ações</li>
<li><strong>É livre de dúvidas:</strong> "E não duvidar no coração" - confiança total no poder de Deus</li>
</ul>

<p><em>Referências cruzadas: Hebreus 11:1, Tiago 1:6-8, Romanos 10:17</em></p>

<p><strong>Aplicação:</strong> Em que áreas de sua vida você tem colocado sua confiança? Sua fé está ancorada no caráter imutável de Deus ou nas circunstâncias mutáveis?</p>

<p><strong>Ilustração:</strong> Como um alpinista confia na segurança de sua corda para escalar, nossa fé deve estar firmemente ancorada em Deus, permitindo-nos enfrentar as "escaladas" mais desafiadoras da vida.</p>

<h3>II. O Poder da Oração com Fé</h3>
<p>Jesus conecta diretamente a fé com a oração. Não são elementos separados, mas intimamente entrelaçados. A oração é o veículo através do qual nossa fé é expressa e ativada.</p>

<ul>
<li><strong>Oração específica:</strong> "Tudo quanto em oração pedirdes" - seja específico em suas petições</li>
<li><strong>Expectativa confiante:</strong> "Crede que recebestes" - ore com a certeza de que Deus ouve e responde</li>
<li><strong>Tempo presente da fé:</strong> A fé opera no presente, não apenas no futuro</li>
</ul>

<p><em>Referências cruzadas: Filipenses 4:6-7, 1 João 5:14-15, Mateus 7:7-11</em></p>

<p><strong>Aplicação:</strong> Suas orações refletem fé genuína ou mera repetição de palavras? Você ora esperando resposta ou apenas cumprindo um ritual?</p>

<p><strong>Ilustração:</strong> Um agricultor que planta sementes demonstra fé na colheita futura. Ele não espera ver os frutos imediatamente, mas age com a certeza de que a semente germinará. Nossa oração deve ter essa mesma qualidade de fé.</p>

<h3>III. Removendo as Montanhas da Vida</h3>
<p>As "montanhas" em nossas vidas representam obstáculos aparentemente impossíveis: crises, relacionamentos quebrados, desafios financeiros, enfermidades, ou barreiras espirituais. Jesus nos assegura que a fé tem poder para remover esses obstáculos.</p>

<ul>
<li><strong>Identificação:</strong> Reconheça qual é a "montanha" em sua vida</li>
<li><strong>Confrontação:</strong> Não ignore o problema, mas enfrente-o com fé</li>
<li><strong>Declaração:</strong> Fale à montanha com autoridade baseada nas promessas de Deus</li>
<li><strong>Persistência:</strong> Mantenha sua fé mesmo quando a resposta demora</li>
</ul>

<p><em>Referências cruzadas: 2 Coríntios 5:7, Isaías 40:31, Salmo 121:1-2</em></p>

<p><strong>Aplicação:</strong> Qual montanha você precisa confrontar hoje com fé? Que passo de fé Deus está pedindo que você dê?</p>

<p><strong>Ilustração:</strong> A história de David e Golias nos mostra que quando enfrentamos nossos gigantes com fé em Deus, o impossível se torna possível. David não focou no tamanho do gigante, mas no poder do Deus a quem servia.</p>

<h3>Conclusão</h3>
<p>Jesus nos convida hoje a uma fé que não apenas crê em teoria, mas age em poder. Uma fé que não é abalada pelas circunstâncias porque está fundamentada em quem Deus é. Uma fé que ora com expectativa, crendo que Deus é poderoso para fazer infinitamente mais do que pedimos ou pensamos.</p>

<p>As montanhas em sua vida não precisam ser permanentes. Com fé em Deus, oração perseverante e obediência à Sua palavra, você verá essas barreiras sendo removidas. Não pela sua força, mas pelo poder de Deus operando através da sua fé.</p>

<p><strong>Apelo Prático:</strong></p>
<ul>
<li>Esta semana, identifique uma "montanha" em sua vida e comece a orar especificamente sobre ela</li>
<li>Declare diariamente as promessas de Deus sobre sua situação</li>
<li>Dê um passo de fé prático, mesmo que pequeno, na direção da vitória</li>
<li>Compartilhe com alguém de confiança para que orem com você</li>
</ul>

<p>Lembre-se: a fé não é ausência de dúvidas, mas a escolha de confiar em Deus apesar delas. Hoje, faça essa escolha e veja Deus mover montanhas em sua vida!</p>

<h3>Referências Bíblicas Adicionais para Estudo</h3>
<ul>
<li>Hebreus 11:1-6 - A galeria da fé</li>
<li>Tiago 2:14-26 - Fé e obras</li>
<li>Mateus 17:20 - Fé como grão de mostarda</li>
<li>Romanos 4:18-21 - A fé de Abraão</li>
<li>2 Coríntios 4:13 - O espírito de fé</li>
<li>1 Pedro 1:6-9 - Fé provada</li>
<li>Efésios 6:16 - O escudo da fé</li>
</ul>`;
  };

  const extractTitleFromResponse = (html: string): string => {
    const match = html.match(/<h2>(.*?)<\/h2>/);
    return match ? match[1] : "Novo Sermão";
  };

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').substring(0, 500);
  };

  const generateTags = (tema: string, texto: string): string[] => {
    const tags: string[] = [];
    tags.push(tema.toLowerCase());
    
    const livro = texto.split(' ')[0].toLowerCase();
    tags.push(livro);
    
    return tags;
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Gerar Sermão com IA
        </SheetTitle>
        <SheetDescription>
          Crie um sermão estruturado usando Inteligência Artificial
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4 py-6 overflow-y-auto max-h-[calc(95vh-180px)]">
        {/* Campos Obrigatórios */}
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm">Campos obrigatórios</p>
          
          <div className="space-y-2">
            <Label htmlFor="texto-biblico">
              Texto Bíblico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="texto-biblico"
              placeholder="Ex: Marcos 11:22-24"
              value={formData.texto_biblico}
              onChange={(e) => handleInputChange("texto_biblico", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema">
              Tema Central <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tema"
              placeholder="Ex: Fé, Amor, Santidade"
              value={formData.tema}
              onChange={(e) => handleInputChange("tema", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-sermao">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.tipo_sermao} onValueChange={(value) => handleInputChange("tipo_sermao", value)}>
                <SelectTrigger id="tipo-sermao">
                  <SelectValue placeholder="Escolha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Expositivo">Expositivo</SelectItem>
                  <SelectItem value="Temático">Temático</SelectItem>
                  <SelectItem value="Textual">Textual</SelectItem>
                  <SelectItem value="Narrativo">Narrativo</SelectItem>
                  <SelectItem value="Evangelístico">Evangelístico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publico">
                Público <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.publico_alvo} onValueChange={(value) => handleInputChange("publico_alvo", value)}>
                <SelectTrigger id="publico">
                  <SelectValue placeholder="Escolha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral</SelectItem>
                  <SelectItem value="Igreja Local">Igreja Local</SelectItem>
                  <SelectItem value="Jovens">Jovens</SelectItem>
                  <SelectItem value="Adultos">Adultos</SelectItem>
                  <SelectItem value="Idosos">Idosos</SelectItem>
                  <SelectItem value="Crianças">Crianças</SelectItem>
                  <SelectItem value="Não Crentes">Não Crentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Campos Opcionais */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Campos opcionais (para personalização)</p>
          
          <div className="space-y-2">
            <Label htmlFor="titulo-custom">Título Personalizado (opcional)</Label>
            <Input
              id="titulo-custom"
              placeholder="Deixe em branco para a IA sugerir"
              value={formData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tom">Tom do Sermão (opcional)</Label>
            <Select value={formData.tom} onValueChange={(value) => handleInputChange("tom", value)}>
              <SelectTrigger id="tom">
                <SelectValue placeholder="Selecione o tom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Encorajador">Encorajador</SelectItem>
                <SelectItem value="Desafiador">Desafiador</SelectItem>
                <SelectItem value="Consolador">Consolador</SelectItem>
                <SelectItem value="Evangelístico">Evangelístico</SelectItem>
                <SelectItem value="Profético">Profético</SelectItem>
                <SelectItem value="Pastoral">Pastoral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Especiais</Label>
            <Textarea
              id="observacoes"
              placeholder="Ex: Incluir ilustrações sobre família, enfatizar aplicação prática, usar linguagem jovem..."
              rows={4}
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
            />
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#95C121]" />
            <p className="text-sm">Dicas para melhores resultados</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-6">
            <li>• Seja específico no tema central do sermão</li>
            <li>• Indique o contexto do público-alvo</li>
            <li>• Use as observações para personalizar o conteúdo</li>
            <li>• Após gerar, você pode editar e refinar o texto</li>
            <li>• A IA é uma ferramenta de auxílio, sempre revise o conteúdo teológico</li>
          </ul>
        </div>

        {/* Nota sobre API */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 space-y-2 border border-yellow-200 dark:border-yellow-900">
          <p className="text-sm">⚠️ Integração com OpenAI</p>
          <p className="text-xs text-muted-foreground">
            Para usar a geração real com IA, você precisará configurar sua API Key da OpenAI no backend.
            Por enquanto, este é um protótipo funcional com conteúdo de exemplo.
          </p>
        </div>
      </div>

      <SheetFooter className="gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
          Cancelar
        </Button>
        <Button
          onClick={generateSermonWithAI}
          disabled={loading}
          className="flex-1 bg-[#002645] hover:bg-[#95C121]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Sermão
            </>
          )}
        </Button>
      </SheetFooter>
    </>
  );
}
