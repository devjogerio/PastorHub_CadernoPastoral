# =============================================================================
# PastorHub - Dockerfile Multi-Stage (Desenvolvimento e Produção)
# =============================================================================

# -----------------------------------------------------------------------------
# Estágio 1: Instalação de dependências (camada cacheável)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Copia apenas os manifestos de dependências primeiro para maximizar cache
COPY package.json package-lock.json ./

# --ignore-scripts evita execução do hook 'prepare: husky' sem diretório .git
RUN npm ci --ignore-scripts

# -----------------------------------------------------------------------------
# Estágio 2: Ambiente de Desenvolvimento (hot-reload com Vite)
# -----------------------------------------------------------------------------
FROM deps AS development

WORKDIR /app

COPY index.html tsconfig.json vite.config.mts ./
COPY src ./src

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# -----------------------------------------------------------------------------
# Estágio 3: Build de Produção
# -----------------------------------------------------------------------------
FROM deps AS builder

WORKDIR /app

# Variáveis públicas opcionais injetadas em tempo de build pelo Vite
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

COPY index.html tsconfig.json vite.config.mts ./
COPY src ./src

RUN npm run build

# -----------------------------------------------------------------------------
# Estágio 4: Runtime de Produção (Nginx não-root enxuto)
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS production

# Remove configuração padrão do Nginx e a diretiva 'user' (ignorada quando o
# master roda como não-root) para manter os logs de inicialização limpos
RUN rm -f /etc/nginx/conf.d/default.conf \
    && sed -i '/^user /d' /etc/nginx/nginx.conf

# Copia configuração customizada (porta 8080 não-privilegiada + SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas os arquivos estáticos gerados no build
COPY --from=builder /app/dist /usr/share/nginx/html

# Ajusta permissões para executar como usuário sem privilégios (nginx)
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
