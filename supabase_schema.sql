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
