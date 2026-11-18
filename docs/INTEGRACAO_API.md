# Guia de Integração - PastorHub "Caderno do Pastor"

## 🎯 Visão Geral

Este guia explica como integrar a funcionalidade de **geração de sermões com IA** usando a OpenAI API e persistência de dados com Supabase.

---

## 📋 Pré-requisitos

### 1. Conta OpenAI
- Crie uma conta em [platform.openai.com](https://platform.openai.com)
- Gere uma API Key em **API Keys**
- Modelos recomendados:
  - **MVP/PoC**: `gpt-3.5-turbo` ou `gpt-4o-mini` (custo-benefício)
  - **Produção**: `gpt-4` ou `gpt-4-turbo` (qualidade máxima)

### 2. Conta Supabase (Opcional, mas recomendado)
- Crie um projeto em [supabase.com](https://supabase.com)
- Configure autenticação (Google OAuth ou Email/Senha)
- Crie as tabelas necessárias (estrutura abaixo)

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

### Tabela: `sermoes`

```sql
CREATE TABLE sermoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  texto_biblico TEXT NOT NULL,
  tema TEXT NOT NULL,
  publico_alvo TEXT NOT NULL,
  tipo_sermao TEXT NOT NULL,
  conteudo_html TEXT NOT NULL,
  conteudo_plain TEXT,
  tags TEXT[],
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_pregado DATE,
  status_pregado BOOLEAN DEFAULT FALSE,
  local_pregado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_sermoes_user_id ON sermoes(user_id);
CREATE INDEX idx_sermoes_status_pregado ON sermoes(status_pregado);
CREATE INDEX idx_sermoes_data_criacao ON sermoes(data_criacao DESC);
CREATE INDEX idx_sermoes_tags ON sermoes USING GIN (tags);

-- Row Level Security (RLS)
ALTER TABLE sermoes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver apenas seus próprios sermões"
  ON sermoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios sermões"
  ON sermoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios sermões"
  ON sermoes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios sermões"
  ON sermoes FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔧 Configuração Backend (Edge Functions)

### Por que usar Edge Functions?
**NUNCA exponha a API Key da OpenAI no frontend!** Use Supabase Edge Functions para:
- Proteger credenciais sensíveis
- Controlar custos e rate limiting
- Validar inputs antes de enviar para a OpenAI
- Adicionar logging e monitoramento

### 1. Instale o Supabase CLI

```bash
npm install -g supabase
```

### 2. Crie uma Edge Function

```bash
supabase functions new generate-sermon
```

### 3. Implemente a função (`supabase/functions/generate-sermon/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

interface SermonRequest {
  titulo?: string;
  texto_biblico: string;
  tema: string;
  publico_alvo: string;
  tipo_sermao: string;
  tom?: string;
  observacoes?: string;
}

serve(async (req) => {
  try {
    // Autenticação
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse do body
    const body: SermonRequest = await req.json();

    // Validação
    if (!body.texto_biblico || !body.tema || !body.publico_alvo || !body.tipo_sermao) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios faltando" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Construir prompts
    // ...
  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

---

## 🔐 Segredos e Deploy

```bash
supabase secrets set OPENAI_API_KEY=sk-sua-chave-aqui
supabase functions deploy generate-sermon
```

