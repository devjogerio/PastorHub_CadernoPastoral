# 📖 PastorHub - Caderno do Pastor

![PastorHub](https://img.shields.io/badge/PastorHub-v1.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-blue)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green)

Aplicativo móvel completo para pastores gerenciarem seus sermões, agenda, atendimentos e recursos pastorais. **Geração de sermões com IA usando OpenAI GPT-4**.

---

## ✨ Funcionalidades Principais

### 📱 **Totalmente Mobile**
- Interface otimizada para dispositivos móveis
- Navegação inferior intuitiva
- Design touch-friendly
- Responsivo e moderno

### 🤖 **Caderno do Pastor com IA**
- ✅ Geração automática de sermões estruturados com IA
- ✅ Editor completo de sermões (HTML)
- ✅ Controle de pregações (data, local, status)
- ✅ Sistema de tags e categorias
- ✅ Busca avançada
- ✅ Filtros por status (pregado/aguardando)
- ✅ Exportação para PDF e TXT
- ✅ Biblioteca completa de sermões

### 🔄 **Sincronização Offline-First**
- ✅ Funciona sem internet (localStorage)
- ✅ Sincronização automática quando online
- ✅ Fila de sincronização inteligente
- ✅ Indicadores de status online/offline
- ✅ Backup automático na nuvem (com Supabase)

### 🔐 **Autenticação Segura**
- ✅ Login com email/senha
- ✅ Login com Google OAuth
- ✅ Proteção de dados com RLS (Row Level Security)
- ✅ Modo offline sem autenticação

### 📊 **Outros Recursos**
- Dashboard com estatísticas
- Agenda de atendimentos
- Gestão de atendimentos pastorais
- Biblioteca de recursos (palestras, vídeos)
- Sistema de notificações

---

## 🚀 Instalação Rápida

### 1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/pastorhub.git
cd pastorhub
```

### 2. **Instale as dependências**
```bash
npm install
```

### 3. **Configure as variáveis de ambiente**

**Opção A: Modo Offline (sem configuração)**
- Não faça nada! O app funcionará automaticamente em modo offline
- Dados salvos no navegador (localStorage)
- Perfeito para testes

**Opção B: Modo Online (com Supabase)**
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

### 4. **Execute o projeto**
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📦 Dependências Principais

```json
{
  "@supabase/supabase-js": "^2.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^4.x",
  "sonner": "^2.x"
}
```

Para instalar:
```bash
npm install @supabase/supabase-js
```

---

## ⚙️ Configuração do Supabase

### 1. **Criar Projeto Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie um novo projeto (Free Tier disponível)
4. Aguarde ~2 minutos para provisionar

### 2. **Configurar Banco de Dados**

Execute o SQL conforme descrito em `docs/INTEGRACAO_API.md`.

### 3. **Habilitar Autenticação**
- Email/senha e opcionalmente Google OAuth.

### 4. **Copiar Credenciais**
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `.env`.

---

## 📱 Uso do Aplicativo

Consulte `docs/GUIA_DO_USUARIO.md` para um passo a passo completo.

---

## 📂 Estrutura do Projeto

Ver `README.md` (raiz) para a estrutura atualizada e sugestões de melhoria.

