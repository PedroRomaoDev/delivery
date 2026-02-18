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
├── docker-compose.yml          # Orquestração de containers
└── apps/
    └── api/
        ├── Dockerfile          # Build multi-stage
        └── .dockerignore       # Arquivos excluídos do build
```

## Notas Importantes

1. **Workspaces**: O Dockerfile copia todos os workspaces necessários (`packages/helpers`, `packages/shared`)
2. **Produção**: Apenas dependências de produção são instaladas no stage final com `--ignore-scripts` para evitar execução de hooks de desenvolvimento (como Husky)
3. **Segurança**: Arquivos de desenvolvimento não são incluídos na imagem final
4. **Scripts de Lifecycle**: A flag `--ignore-scripts` previne a execução de scripts como `prepare` que tentam instalar ferramentas de desenvolvimento (Husky) desnecessárias em produção
