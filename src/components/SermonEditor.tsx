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
import { Save, X, Calendar, MapPin, Tag, BookOpen, Copy, Share2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { toast } from "sonner@2.0.3";
import type { Sermon } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { sanitizeHtml } from "../lib/sanitize";

interface SermonEditorProps {
  sermon: Sermon;
  onSave: (sermon: Sermon) => void;
  onCancel: () => void;
}

export function SermonEditor({ sermon, onSave, onCancel }: SermonEditorProps) {
  const [editedSermon, setEditedSermon] = useState<Sermon>(sermon);
  const [activeTab, setActiveTab] = useState("visualizar");

  const handleInputChange = (field: keyof Sermon, value: any) => {
    setEditedSermon(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Persiste o HTML já sanitizado: o conteúdo pode vir de importação ou IA.
    onSave({
      ...editedSermon,
      conteudo_html: sanitizeHtml(editedSermon.conteudo_html),
    });
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(editedSermon.conteudo_plain);
    toast.success("Conteúdo copiado!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: editedSermon.titulo,
        text: editedSermon.conteudo_plain.substring(0, 500) + "...",
      });
    } else {
      toast.info("Compartilhamento não disponível neste dispositivo");
    }
  };

  const renderHtmlContent = () => {
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(editedSermon.conteudo_html),
        }}
      />
    );
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#002645]" />
          Editar Sermão
        </SheetTitle>
        <SheetDescription>
          {editedSermon.titulo}
        </SheetDescription>
      </SheetHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visualizar">Visualizar</TabsTrigger>
          <TabsTrigger value="editar">Editar</TabsTrigger>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
        </TabsList>

        {/* Tab: Visualizar */}
        <TabsContent value="visualizar" className="space-y-4 mt-4 overflow-y-auto max-h-[calc(95vh-280px)]">
          <div className="space-y-4">
            {/* Header do Sermão */}
            <div className="bg-gradient-to-br from-[#002645] to-[#3261AB] rounded-lg p-4 text-white">
              <h2 className="text-white mb-2">{editedSermon.titulo}</h2>
              <p className="text-sm text-blue-100">{editedSermon.texto_biblico}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-[#95C121] border-[#95C121]">
                  {editedSermon.tipo_sermao}
                </Badge>
                <Badge variant="outline" className="border-white text-white">
                  {editedSermon.publico_alvo}
                </Badge>
                {editedSermon.status_pregado && (
                  <Badge className="bg-green-500 border-green-500">
                    ✓ Pregado
                  </Badge>
                )}
              </div>
            </div>

            {/* Informações de Pregação */}
            {editedSermon.status_pregado && (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 space-y-2 border border-green-200 dark:border-green-900">
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <strong>Pregado em:</strong> {new Date(editedSermon.data_pregado!).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                {editedSermon.local_pregado && (
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <strong>Local:</strong> {editedSermon.local_pregado}
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {editedSermon.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            <Separator />

            {/* Conteúdo do Sermão */}
            <div className="bg-background rounded-lg p-4 border">
              {renderHtmlContent()}
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleCopyContent} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copiar Texto
              </Button>
              <Button variant="outline" onClick={handleShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Editar */}
        <TabsContent value="editar" className="space-y-4 mt-4 overflow-y-auto max-h-[calc(95vh-280px)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-titulo">Título</Label>
              <Input
                id="edit-titulo"
                value={editedSermon.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-texto">Texto Bíblico</Label>
              <Input
                id="edit-texto"
                value={editedSermon.texto_biblico}
                onChange={(e) => handleInputChange("texto_biblico", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tema">Tema</Label>
                <Input
                  id="edit-tema"
                  value={editedSermon.tema}
                  onChange={(e) => handleInputChange("tema", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo</Label>
                <Select 
                  value={editedSermon.tipo_sermao} 
                  onValueChange={(value) => handleInputChange("tipo_sermao", value)}
                >
                  <SelectTrigger id="edit-tipo">
                    <SelectValue />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-publico">Público-Alvo</Label>
              <Select 
                value={editedSermon.publico_alvo} 
                onValueChange={(value) => handleInputChange("publico_alvo", value)}
              >
                <SelectTrigger id="edit-publico">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral</SelectItem>
                  <SelectItem value="Igreja Local">Igreja Local</SelectItem>
                  <SelectItem value="Jovens">Jovens</SelectItem>
                  <SelectItem value="Adultos">Adultos</SelectItem>
                  <SelectItem value="Idosos">Idosos</SelectItem>
                  <SelectItem value="Crianças">Crianças</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="edit-tags"
                value={editedSermon.tags.join(", ")}
                onChange={(e) => handleInputChange("tags", e.target.value.split(",").map(t => t.trim()))}
                placeholder="fé, milagres, marcos"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="edit-conteudo">Conteúdo (HTML)</Label>
              <p className="text-xs text-muted-foreground">
                Você pode editar o HTML diretamente. Use tags como &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
              </p>
              <Textarea
                id="edit-conteudo"
                value={editedSermon.conteudo_html}
                onChange={(e) => {
                  handleInputChange("conteudo_html", e.target.value);
                  handleInputChange("conteudo_plain", e.target.value.replace(/<[^>]*>/g, ''));
                }}
                rows={20}
                className="font-mono text-xs"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
              <p className="text-xs">
                💡 <strong>Dica:</strong> Edite com cuidado. As alterações no HTML afetarão a visualização do sermão.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Detalhes */}
        <TabsContent value="detalhes" className="space-y-4 mt-4 overflow-y-auto max-h-[calc(95vh-280px)]">
          <div className="space-y-4">
            {/* Status de Pregação */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status-pregado">Status de Pregação</Label>
                  <p className="text-xs text-muted-foreground">
                    Marque como pregado quando utilizar este sermão
                  </p>
                </div>
                <Switch
                  id="status-pregado"
                  checked={editedSermon.status_pregado}
                  onCheckedChange={(checked) => {
                    handleInputChange("status_pregado", checked);
                    if (checked && !editedSermon.data_pregado) {
                      handleInputChange("data_pregado", new Date().toISOString().split('T')[0]);
                    }
                  }}
                />
              </div>
            </div>

            {/* Detalhes da Pregação (se marcado como pregado) */}
            {editedSermon.status_pregado && (
              <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <h3 className="text-sm">Detalhes da Pregação</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="data-pregado">Data da Pregação</Label>
                  <Input
                    id="data-pregado"
                    type="date"
                    value={editedSermon.data_pregado || ""}
                    onChange={(e) => handleInputChange("data_pregado", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local-pregado">Local da Pregação</Label>
                  <Input
                    id="local-pregado"
                    placeholder="Ex: Igreja Sede, Culto da Juventude"
                    value={editedSermon.local_pregado}
                    onChange={(e) => handleInputChange("local_pregado", e.target.value)}
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Metadados */}
            <div className="space-y-3">
              <h3 className="text-sm">Informações do Sermão</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{editedSermon.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>
                    {new Date(editedSermon.data_criacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Palavras:</span>
                  <span>{editedSermon.conteudo_plain.split(/\s+/).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Caracteres:</span>
                  <span>{editedSermon.conteudo_plain.length}</span>
                </div>
              </div>
            </div>

            {/* Notas de Uso */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-sm">📝 Sobre este sermão</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Sermões podem ser editados a qualquer momento</li>
                <li>• Marque como pregado para controle do seu histórico</li>
                <li>• As tags ajudam na busca e organização</li>
                <li>• Use o botão copiar para transferir o conteúdo</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <SheetFooter className="gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSave} className="flex-1 bg-[#002645] hover:bg-[#95C121]">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </SheetFooter>
    </>
  );
}