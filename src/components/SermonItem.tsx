// Importa componentes de UI do pacote local (botões, badges, cards, menus)
import { Button } from './ui/button';
import { Badge } from './ui/badge';
// Importa ícones da biblioteca lucide-react para uso na interface
import {
  Edit,
  Trash2,
  Check,
  X,
  Calendar,
  Download,
  MoreVertical,
} from 'lucide-react';
// Importa componentes de Card para estrutura visual do item
import { Card, CardContent } from './ui/card';
// Importa componentes de Dropdown Menu para ações secundárias
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
// Importa componentes de Alert Dialog para confirmação de exclusão
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
// Importa o tipo Sermon centralizado
import { Sermon } from '../types';

// Define a interface de props para o componente SermonItem
interface SermonItemProps {
  sermon: Sermon; // O objeto sermão a ser exibido
  onEdit: (sermon: Sermon) => void; // Função callback para editar
  onDelete: (id: string) => void; // Função callback para deletar
  onTogglePregado: (id: string, currentStatus: boolean) => void; // Função callback para alterar status de pregado
  onExportPDF: (sermon: Sermon) => void; // Função callback para exportar PDF
  onDownloadText: (sermon: Sermon) => void; // Função callback para baixar texto
}

// Componente funcional que renderiza um item individual de sermão na lista
export function SermonItem({
  sermon,
  onEdit,
  onDelete,
  onTogglePregado,
  onExportPDF,
  onDownloadText,
}: SermonItemProps) {
  return (
    // Card container com overflow hidden para manter bordas arredondadas
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          {/* Cabeçalho do card com título e badge de status */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              {/* Título do sermão truncado se muito longo */}
              <h3 className="truncate">{sermon.titulo}</h3>
              {/* Texto bíblico de referência */}
              <p className="text-sm text-muted-foreground">
                {sermon.texto_biblico}
              </p>
            </div>
            {/* Exibe badge verde se o sermão já foi pregado */}
            {sermon.status_pregado && (
              <Badge className="bg-[#95C121] text-white flex-shrink-0">
                <Check className="w-3 h-3 mr-1" />
                Pregado
              </Badge>
            )}
          </div>

          {/* Tags e metadados do sermão */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {sermon.tipo_sermao}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {sermon.publico_alvo}
            </Badge>
            {/* Renderiza as primeiras 2 tags */}
            {sermon.tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Informações de data e local se pregado */}
          {sermon.data_pregado && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3 h-3" />
              Pregado em{' '}
              {new Date(sermon.data_pregado).toLocaleDateString('pt-BR')}
              {sermon.local_pregado && ` - ${sermon.local_pregado}`}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2">
            {/* Botão de Editar */}
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(sermon)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            {/* Botão de Pregar/Desmarcar com estilo condicional */}
            <Button
              size="sm"
              variant={sermon.status_pregado ? 'outline' : 'default'}
              className={
                sermon.status_pregado ? '' : 'bg-[#95C121] hover:bg-[#002645]'
              }
              onClick={() => onTogglePregado(sermon.id, sermon.status_pregado)}
            >
              {sermon.status_pregado ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Desmarcar
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Pregar
                </>
              )}
            </Button>

            {/* Menu Dropdown para ações extras */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" aria-label="Mais opções">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExportPDF(sermon)}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownloadText(sermon)}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar TXT
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Diálogo de confirmação para exclusão */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Sermão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir &quot;{sermon.titulo}
                        &quot;? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => onDelete(sermon.id)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
