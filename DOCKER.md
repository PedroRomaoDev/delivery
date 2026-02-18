# Guia Rápido - Docker

## Início Rápido

### 1. Com Docker Compose (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d
```

### 2. Com npm scripts

```bash
# Na raiz do projeto
pnpm run docker:up
```

### 3. Acessar a aplicação

- API: http://localhost:8080
- Swagger: http://localhost:8080/docs

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

### Via Docker CLI

```bash
# Build
docker build -f apps/api/Dockerfile -t delivery-api:latest .

# Run
docker run -d --name delivery-api -p 8080:8080 delivery-api:latest

# Logs
docker logs -f delivery-api

# Stop
docker stop delivery-api && docker rm delivery-api
```

## Verificar Saúde do Container

```bash
# Status do container
docker ps

# Health check
docker inspect delivery-api | grep -A 5 Health

# Logs de health check do compose
docker-compose ps
```

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs api

# Verificar se porta 8080 está livre
# Windows PowerShell
Get-NetTCPConnection -LocalPort 8080

# Linux/Mac
lsof -i :8080
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

### Limpar recursos Docker

```bash
# Parar todos os containers
docker stop $(docker ps -aq)

# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -a -f

# Limpar tudo (cuidado!)
docker system prune -a --volumes -f
```

## Estrutura dos Arquivos Docker

```
delivery/
├── docker-compose.yml          # Orquestração de containers
└── apps/
    └── api/
        ├── Dockerfile          # Build multi-stage
        └── .dockerignore       # Arquivos excluídos do build
```

## Características da Imagem

- **Base**: node:18-alpine (~180MB)
- **Build**: Multi-stage (builder + production)
- **Gerenciador**: pnpm 10.20.0
- **Porta**: 8080
- **Health Check**: HTTP GET a cada 30s
- **Restart Policy**: unless-stopped
- **Monorepo**: Suporte completo aos workspaces

## Notas Importantes

1. **Workspaces**: O Dockerfile copia todos os workspaces necessários (`packages/helpers`, `packages/shared`)
2. **Produção**: Apenas dependências de produção são instaladas no stage final com `--ignore-scripts` para evitar execução de hooks de desenvolvimento (como Husky)
3. **Cache**: O build usa o lock file para garantir versões consistentes
4. **Segurança**: Arquivos de desenvolvimento não são incluídos na imagem final
5. **Scripts de Lifecycle**: A flag `--ignore-scripts` previne a execução de scripts como `prepare` que tentam instalar ferramentas de desenvolvimento (Husky) desnecessárias em produção
