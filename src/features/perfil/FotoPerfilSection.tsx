import { useEffect, useState } from 'react';
import { Camera, Edit3, ImagePlus, Loader2, Trash2, ZoomIn } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { iniciais } from '../../lib/format';
import {
  validarFotoPerfil,
  criarPreview,
  revogarPreview,
} from '../../lib/fotoPerfil';
import type { PerfilUsuario } from '../../lib/perfil';

/* ============================================================
   Foto de perfil — exibição com ações claras (alterar / galeria /
   câmera / remover), visualização ampliada, confirmação de upload
   com feedback visual. Semânticas baseadas no app: avatares em
   gradientes do brand, botões outline w-full, cards white.
   ============================================================ */

interface FotoAvatarProps {
  url?: string | null;
  iniciaisTexto: string;
  classe?: string;
}

/** Círculo de foto/iniciais tolerante a falhas de imagem (servidor/localStorage). */
function FotoAvatar({ url, iniciaisTexto, classe = '' }: FotoAvatarProps) {
  const [erroImagem, setErroImagem] = useState(false);
  if (url && !erroImagem) {
    return (
      <img
        src={url}
        alt="Foto do perfil"
        className={`object-cover ${classe}`}
        onError={() => setErroImagem(true)}
      />
    );
  }
  return (
    <span
      className={`bg-gradient-to-br from-primary to-[#3261AB] text-white ${classe}`}
      data-testid="avatar-iniciais"
    >
      {iniciaisTexto}
    </span>
  );
}

interface FotoPerfilSectionProps {
  perfil: PerfilUsuario;
  onAtualizar: (perfilAtualizado: PerfilUsuario) => void;
  /** Abre o modal com o card "Meu perfil" (artigo fora da renderização direta). */
  onEditarPerfil?: () => void;
}

export function FotoPerfilSection({
  perfil,
  onAtualizar,
  onEditarPerfil,
}: FotoPerfilSectionProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ampliar, setAmpliar] = useState(false);

  // Limpa o preview do arquivo selecionado quando seleção ou upload finaliza.
  useEffect(() => () => revogarPreview(previewUrl), [previewUrl]);

  const urlAvatar = arquivo ? previewUrl : perfil.fotoUrl;
  const mostrarSpinner = enviando && !arquivo;

  const handleArquivo = (arquivo: File) => {
    setErro('');
    const validacao = validarFotoPerfil(arquivo);
    if (validacao) {
      setErro(validacao);
      toast.error(validacao);
      return;
    }
    if (previewUrl) revogarPreview(previewUrl);
    setArquivo(arquivo);
    setPreviewUrl(criarPreview(arquivo));
  };

  /* Input de arquivo criado sob demanda (galeria/câmera): nenhum input
     fixo permanece no DOM. O elemento é removido ao confirmar ou
     cancelar a seleção, sem deixar vestígios. */
  const selecionarArquivo = (
    aceitos: string,
    rotulo: string,
    capturar?: boolean,
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = aceitos;
    input.setAttribute('aria-label', rotulo);
    input.style.display = 'none';
    if (capturar) input.setAttribute('capture', 'environment');
    const limpar = () => input.remove();
    input.addEventListener('change', () => {
      const escolhido = input.files?.[0];
      limpar();
      if (escolhido) {
        handleArquivo(escolhido);
        toast.info(`${rotulo}: imagem selecionada`);
      }
    });
    input.addEventListener('cancel', limpar);
    document.body.appendChild(input);
    input.click();
  };

  const fazerUpload = () => {
    const validacao = arquivo ? validarFotoPerfil(arquivo) : null;
    if (!arquivo || validacao) {
      setErro(validacao ?? 'Nenhuma imagem selecionada.');
      toast.error(erro || 'Nenhuma imagem selecionada.');
      return;
    }
    setEnviando(true);
    try {
      onAtualizar({ ...perfil, fotoUrl: previewUrl });
      setArquivo(null);
      setPreviewUrl(null);
      toast.success('Foto atualizada!');
    } catch (erro) {
      setErro(String(erro).slice(0, 120));
      toast.error('Não foi possível salvar a foto.');
    } finally {
      setEnviando(false);
    }
  };

  const removerFoto = () => {
    setArquivo(null);
    setPreviewUrl(null);
    if (perfil.fotoUrl) {
      onAtualizar({ ...perfil, fotoUrl: null });
      toast.success('Foto removida.');
    } else {
      toast.info('Nenhuma foto de perfil definida.');
    }
  };

  const abrirGaleria = () =>
    selecionarArquivo(
      'image/jpeg, image/jpg, image/png, image/webp, image/gif',
      'Galeria',
    );
  const abrirCamera = () => selecionarArquivo('image/*', 'Câmera', true);

  const statusTexto = arquivo
    ? 'Nova foto selecionada — revise e confirme o upload'
    : perfil.fotoUrl
      ? 'Foto atual ativa — alterações só aplicam na confirmação'
      : 'Nenhuma foto definida — iniciais serão exibidas';

  return (
    <article
      className="group space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
      data-testid="foto-perfil-section"
    >
      <div>
        <h3 className="text-base font-semibold text-primary">Foto do perfil</h3>
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: JPEG, PNG ou WebP · Tamanho máximo: 4 MB
        </p>
      </div>

      {erro && (
        <p role="alert" className="text-xs font-medium text-destructive">{erro}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-2 items-center">
        {/* Visualização — grande, clicável para alterar */}
        <div className="relative mx-auto lg:mx-0" data-testid="avatar-card">
          <button
            type="button"
            onClick={abrirGaleria}
            aria-label="Alterar foto do perfil"
            className="relative block rounded-full"
            data-testid="botao-alterar-foto"
          >
            <FotoAvatar
              url={urlAvatar}
              iniciaisTexto={iniciais(perfil.nome)}
              classe="h-36 w-36 rounded-full text-3xl sm:h-40 sm:w-40 sm:text-3.5xl"
            />
            {mostrarSpinner && (
              <Loader2 className="absolute inset-0 m-auto h-9 w-9 animate-spin text-primary" />
            )}
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-white p-1.5 shadow-md">
              <Edit3 className="h-4 w-4 text-[#3261AB]" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAmpliar(true)}
            aria-label="Visualizar foto em tamanho ampliado"
            data-testid="botao-ampliar-foto"
            className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow transition-all hover:bg-[#3261AB]/90"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={abrirGaleria}
              data-testid="btn-escolher-galeria"
            >
              <ImagePlus className="h-4 w-4 shrink-0" />
              Escolher da galeria
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={abrirCamera}
              data-testid="btn-tirar-foto"
            >
              <Camera className="h-4 w-4 shrink-0" />
              Tirar foto
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={removerFoto}
            disabled={!arquivo && !perfil.fotoUrl}
            data-testid="btn-remover-foto"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            Remover foto
          </Button>

          <Button
            className="w-full justify-start bg-accent text-primary hover:bg-accent/90"
            onClick={fazerUpload}
            disabled={enviando || !arquivo}
            data-testid="btn-confirmar-alteracao"
          >
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando…
              </>
            ) : (
              'Confirmar alteração'
            )}
          </Button>

          {onEditarPerfil && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onEditarPerfil}
              data-testid="btn-editar-perfil"
            >
              <Edit3 className="h-4 w-4 shrink-0" />
              Editar perfil
            </Button>
          )}

          <p
            aria-live="polite"
            className="text-[11px] text-muted-foreground"
            data-testid="status-foto"
          >
            {statusTexto}
          </p>
        </div>
      </div>

      {/* Zoom em diálogo — visualização ampliada */}
      <Dialog open={ampliar} onOpenChange={setAmpliar}>
        <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Foto ampliada</DialogTitle>
            <DialogDescription>
              Vista ampliada da foto do perfil. Clique em Fechar para retornar.
            </DialogDescription>
          </DialogHeader>
          <FotoAvatar
            url={urlAvatar}
            iniciaisTexto={iniciais(perfil.nome)}
            classe="mx-auto h-72 w-72 rounded-full text-5xl"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAmpliar(false)}>
              Fechar
            </Button>
            <Button
              className="bg-accent text-primary hover:bg-accent/90"
              onClick={fazerUpload}
              disabled={enviando || !arquivo}
            >
              Confirmar alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
