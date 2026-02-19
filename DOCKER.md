# Guia Rápido - Docker

### 1. Com Docker Compose

```bash
# Na raiz do projeto
docker-compose build
```

```bash
# Na raiz do projeto
docker-compose up -d
```

### 2. Com pnpm scripts

```bash
# Na raiz do projeto
pnpm run docker:build
```

```bash
# Na raiz do projeto
pnpm run docker:up
```

### 3. Acessar a aplicação

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8080
- **Swagger**: http://localhost:8080/docs

## Comandos Disponíveis

### Via npm scripts (raiz do projeto)

```bash
# Build da imagem
pnpm run docker:build

# Iniciar container
pnpm run docker:up

# Ver logs
pnpm run docker:logs

# Parar container
pnpm run docker:down

# Rebuild completo (sem cache)
pnpm run docker:rebuild
```

### Via Docker Compose

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar
docker-compose down

# Rebuild
docker-compose build --no-cache
```

### Rebuild necessário após mudanças

```bash
# Rebuild completo
pnpm run docker:rebuild

# Ou manualmente
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Estrutura dos Arquivos Docker

```
delivery/
├── docker-compose.yml          # Orquestração de containers (API + Web)
└── apps/
    ├── api/
    │   ├── Dockerfile          # Build multi-stage (Node.js)
    │   └── .dockerignore       # Arquivos excluídos do build
    └── web/
        ├── Dockerfile          # Build multi-stage (Vite + Nginx)
        ├── nginx.conf          # Configuração do servidor Nginx
        └── .dockerignore       # Arquivos excluídos do build
```

## Serviços Docker

O docker-compose provisiona dois serviços:

### 🔹 **API (Backend)**

- **Container**: `delivery-api`
- **Porta**: 8080
- **Tecnologia**: Node.js 20 Alpine + Fastify
- **Health Check**: `curl -f http://localhost:8080`

### 🔹 **Web (Frontend)**

- **Container**: `delivery-web`
- **Porta**: 3000
- **Tecnologia**: Nginx Alpine servindo build do Vite (React)
- **Proxy reverso**: Requisições `/api` são encaminhadas para o container da API
- **Health Check**: `wget --spider http://localhost:3000`

## Notas Importantes

1. **Workspaces**: Os Dockerfiles copiam todos os workspaces necessários (`packages/helpers`, `packages/shared`)
2. **Produção**: Apenas dependências de produção são instaladas no stage final com `--ignore-scripts` para evitar execução de hooks de desenvolvimento (como Husky)
3. **Segurança**: Arquivos de desenvolvimento não são incluídos nas imagens finais
4. **Scripts de Lifecycle**: A flag `--ignore-scripts` previne a execução de scripts como `prepare` que tentam instalar ferramentas de desenvolvimento (Husky) desnecessárias em produção
5. **Comunicação entre containers**: O frontend pode acessar a API através do proxy reverso configurado no Nginx

## Características de Segurança

A imagem Docker foi construída seguindo as melhores práticas de segurança:

### Base Image Atualizada

**API:**

- **Node.js 20 Alpine**: Versão LTS mais recente com patches de segurança aplicados
- Imagem Alpine Linux reduz a superfície de ataque (menor que 5MB)

**Web:**

- **Nginx Alpine**: Servidor web leve e seguro
- Build de produção otimizado com Vite

### Atualizações de Sistema

- `apk update && apk upgrade --no-cache`: Atualização de todos os pacotes do sistema
- Limpeza de cache APK: `rm -rf /var/cache/apk/*` reduz a superfície de ataque

### Execução como Usuário Não-Root

**API:**

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

**Web:**

```dockerfile
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001
USER appuser
```

- Aplicações rodam com UID 1001 (usuários dedicados)
- Previne escalada de privilégios em caso de comprometimento
- Princípio do menor privilégio aplicado

### Health Checks Integrados

**API:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1
```

**Web:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1
```

- Monitoramento automático do estado dos containers
- Reinício automático em caso de falha
- Intervalo de verificação: 30 segundos

### Build Multi-Stage

- Stage 1 (Builder): Build da aplicação com todas as dependências
- Stage 2 (Production): Apenas artefatos necessários para execução
- Redução significativa do tamanho final da imagem
- Dependências de desenvolvimento não incluídas na imagem final

### Flags de Segurança

- `--ignore-scripts`: Previne execução de scripts maliciosos durante instalação de pacotes
- `--frozen-lockfile`: Garante instalação determinística das dependências
- `--prod`: Instala apenas dependências de produção

### Gestão de Permissões

```dockerfile
RUN chown -R nodejs:nodejs /app
```

- Todos os arquivos da aplicação pertencem ao usuário `nodejs`
- Permissões mínimas necessárias para operação
