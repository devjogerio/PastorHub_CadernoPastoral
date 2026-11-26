-- Habilita a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Tabela: sermoes
-- -----------------------------------------------------------------------------
CREATE TABLE public.sermoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    texto_biblico TEXT,
    tema TEXT,
    publico_alvo TEXT,
    tipo_sermao TEXT,
    conteudo_html TEXT,
    conteudo_plain TEXT,
    tags TEXT[] DEFAULT '{}',
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_pregado TIMESTAMPTZ,
    status_pregado BOOLEAN DEFAULT FALSE,
    local_pregado TEXT
);

-- updated_at automático (auditoria: campo obrigatório de auditoria)
ALTER TABLE public.sermoes
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE OR REPLACE FUNCTION public.trigger_atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sermoes_updated_at ON public.sermoes;
CREATE TRIGGER trg_sermoes_updated_at
    BEFORE UPDATE ON public.sermoes
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_atualizar_updated_at();

-- Habilita RLS
ALTER TABLE public.sermoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)
-- Apenas o dono pode ver seus sermões
CREATE POLICY "Usuários podem ver seus próprios sermões" 
ON public.sermoes FOR SELECT 
USING (auth.uid() = user_id);

-- Apenas o dono pode inserir sermões
CREATE POLICY "Usuários podem criar seus próprios sermões" 
ON public.sermoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Apenas o dono pode atualizar seus sermões
CREATE POLICY "Usuários podem atualizar seus próprios sermões" 
ON public.sermoes FOR UPDATE 
USING (auth.uid() = user_id);

-- Apenas o dono pode deletar seus sermões
CREATE POLICY "Usuários podem deletar seus próprios sermões" 
ON public.sermoes FOR DELETE 
USING (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- Tabela: profiles (papel administrativo — lido pela Edge Functions e painéis
-- com autenticação real; nunca armazenado em user_metadata).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL DEFAULT '',
    igreja TEXT,
    telefone TEXT,
    cargo TEXT,
    papel TEXT NOT NULL DEFAULT 'usuario' CHECK (papel IN ('usuario', 'admin', 'pastor')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver o próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Tabela: atendimentos
-- -----------------------------------------------------------------------------
CREATE TABLE public.atendimentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome_fiel TEXT NOT NULL,
    data_atendimento TIMESTAMPTZ DEFAULT NOW(),
    anotacoes TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pendente' -- pendente, realizado, cancelado
);

ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios atendimentos" 
ON public.atendimentos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar atendimentos" 
ON public.atendimentos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus atendimentos" 
ON public.atendimentos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus atendimentos" 
ON public.atendimentos FOR DELETE 
USING (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- Tabela: agenda
-- -----------------------------------------------------------------------------
CREATE TABLE public.agenda (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ,
    local TEXT,
    tipo TEXT DEFAULT 'evento' -- culto, visita, reuniao, evento
);

ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver sua própria agenda" 
ON public.agenda FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar itens na agenda" 
ON public.agenda FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar sua agenda" 
ON public.agenda FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar itens da agenda" 
ON public.agenda FOR DELETE 
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Indices para performance
-- -----------------------------------------------------------------------------
CREATE INDEX sermoes_user_id_idx ON public.sermoes(user_id);
CREATE INDEX atendimentos_user_id_idx ON public.atendimentos(user_id);
CREATE INDEX agenda_user_id_idx ON public.agenda(user_id);

-- -----------------------------------------------------------------------------
-- Tabela: notifications (preferências/avisos do usuário)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    criada_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notificações"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar o status da própria notificação"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Storage: buckets privados por usuário (pasta de documentos do pastor)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pastor-documentos', 'pastor-documentos', false, 52428800, ARRAY['application/pdf','text/plain','application/json'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios documentos"
    ON storage.objects;
CREATE POLICY "Usuários podem ver seus próprios documentos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'pastor-documentos' AND owner = auth.uid().to_text());

DROP POLICY IF EXISTS "Usuários podem enviar seus próprios documentos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'pastor-documentos' AND owner = auth.uid().to_text());

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios documentos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'pastor-documentos' AND owner = auth.uid().to_text());

DROP POLICY IF EXISTS "Usuários podem remover seus próprios documentos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'pastor-documentos' AND owner = auth.uid().to_text());
